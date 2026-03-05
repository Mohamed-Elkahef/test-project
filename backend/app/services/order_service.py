# Task ID: 88cca822
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Tuple
from datetime import datetime
from decimal import Decimal
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderItemCreate
import math


class OrderService:
    """Service class for order-related business logic."""

    @staticmethod
    def _generate_order_number(db: Session) -> str:
        """
        Generate a unique order number in format ORD-YYYYMMDD-XXXX.

        Args:
            db: Database session

        Returns:
            str: Generated order number
        """
        today = datetime.now().strftime("%Y%m%d")
        prefix = f"ORD-{today}-"

        # Find the highest order number for today
        latest_order = (
            db.query(Order)
            .filter(Order.order_number.like(f"{prefix}%"))
            .order_by(Order.order_number.desc())
            .first()
        )

        if latest_order:
            # Extract the sequence number and increment
            last_sequence = int(latest_order.order_number.split("-")[-1])
            new_sequence = last_sequence + 1
        else:
            # First order of the day
            new_sequence = 1

        # Format with leading zeros (4 digits)
        return f"{prefix}{new_sequence:04d}"

    @staticmethod
    def _calculate_item_subtotal(quantity: int, unit_price: Decimal) -> Decimal:
        """
        Calculate subtotal for an order item.

        Args:
            quantity: Item quantity
            unit_price: Unit price

        Returns:
            Decimal: Calculated subtotal
        """
        return Decimal(str(quantity)) * unit_price

    @staticmethod
    def create_order(db: Session, order_data: OrderCreate, user_id: int) -> Order:
        """
        Create a new order with items in a single transaction.

        Args:
            db: Database session
            order_data: Order creation data including items
            user_id: ID of the user creating the order

        Returns:
            Order: The newly created order with items

        Raises:
            ValueError: If no items provided or invalid quantities
        """
        try:
            # Validate items
            if not order_data.items or len(order_data.items) == 0:
                raise ValueError("At least one item is required")

            # Validate quantities
            for item in order_data.items:
                if item.quantity <= 0:
                    raise ValueError(f"Quantity must be greater than 0 for {item.product_name}")
                if item.unit_price <= 0:
                    raise ValueError(f"Unit price must be greater than 0 for {item.product_name}")

            # Generate unique order number
            order_number = OrderService._generate_order_number(db)

            # Calculate total amount
            total_amount = Decimal("0.00")
            order_items_data = []

            for item_data in order_data.items:
                subtotal = OrderService._calculate_item_subtotal(
                    item_data.quantity,
                    item_data.unit_price
                )
                total_amount += subtotal
                order_items_data.append({
                    "product_name": item_data.product_name,
                    "quantity": item_data.quantity,
                    "unit_price": item_data.unit_price,
                    "subtotal": subtotal
                })

            # Create order
            db_order = Order(
                order_number=order_number,
                customer_name=order_data.customer_name,
                customer_email=order_data.customer_email,
                status="pending",
                total_amount=total_amount,
                notes=order_data.notes,
                created_by=user_id
            )

            db.add(db_order)
            db.flush()  # Flush to get the order ID

            # Create order items
            for item_info in order_items_data:
                db_item = OrderItem(
                    order_id=db_order.id,
                    **item_info
                )
                db.add(db_item)

            # Commit transaction
            db.commit()
            db.refresh(db_order)

            return db_order

        except ValueError as e:
            db.rollback()
            raise e
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create order: {str(e)}")

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Order:
        """
        Retrieve an order by ID with its items.

        Args:
            db: Database session
            order_id: Order ID

        Returns:
            Order: Order object with items or None
        """
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        """
        Retrieve all orders with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[Order]: List of orders
        """
        return db.query(Order).offset(skip).limit(limit).all()

    @staticmethod
    def get_orders_with_pagination(
        db: Session,
        page: int = 1,
        per_page: int = 10,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Tuple[List[dict], int, int]:
        """
        Retrieve orders with pagination and filters.

        Args:
            db: Database session
            page: Page number (1-indexed)
            per_page: Number of items per page
            status: Optional status filter
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            Tuple containing:
            - List of order dictionaries with item count
            - Total number of orders matching filters
            - Total number of pages
        """
        # Build base query
        query = db.query(Order)

        # Apply filters
        if status:
            query = query.filter(Order.status == status)

        if start_date:
            query = query.filter(Order.created_at >= start_date)

        if end_date:
            # Include the entire end date by adding 1 day
            query = query.filter(Order.created_at < end_date)

        # Get total count before pagination
        total = query.count()

        # Calculate total pages
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0

        # Apply pagination
        skip = (page - 1) * per_page
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(per_page).all()

        # Build response with item count
        orders_with_count = []
        for order in orders:
            item_count = db.query(func.count(OrderItem.id)).filter(
                OrderItem.order_id == order.id
            ).scalar()

            orders_with_count.append({
                "id": order.id,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "status": order.status,
                "total_amount": order.total_amount,
                "created_at": order.created_at,
                "updated_at": order.updated_at,
                "item_count": item_count or 0
            })

        return orders_with_count, total, total_pages
