# Task ID: 88cca822, 49a274b4, 700e9c60
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_user_optional
from app.models.user import User
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderListResponse, OrderListItem,
    OrderStatusUpdate, OrderStatusHistoryResponse
)
from app.services.order_service import OrderService
from app.services.inventory_service import InsufficientStockException

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Create a new order with items.
    Task ID: 6c269a18, 49a274b4, 700e9c60

    - **customer_name**: Name of the customer
    - **customer_email**: Email of the customer
    - **notes**: Optional notes for the order
    - **items**: List of order items (at least one required)

    Authentication is optional. If authenticated, the order will be linked to the user account.
    Validates inventory stock before order creation and decrements stock on success.

    Returns the created order with auto-generated order_number and calculated totals.

    Raises:
        400 Bad Request: If validation fails or insufficient stock
        500 Internal Server Error: If order creation fails
    """
    try:
        # Pass user ID if authenticated, None for guest orders
        user_id = current_user.id if current_user else None
        order = OrderService.create_order(db, order_data, user_id)
        return order
    except InsufficientStockException as e:
        # Task ID: 700e9c60 - Return specific stock error message
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "insufficient_stock",
                "message": f"Stock not enough: {e.message}",
                "product_name": e.product_name,
                "requested_quantity": e.requested_quantity,
                "available_quantity": e.available_quantity,
                "sku": e.sku
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific order by ID.

    - **order_id**: ID of the order to retrieve

    Returns the order with all its items.
    """
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order


@router.get("/", response_model=OrderListResponse)
def get_orders(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., pending, completed, cancelled)"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (ISO format)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all orders with pagination and filters.

    - **page**: Page number (default: 1)
    - **per_page**: Number of items per page (default: 10, max: 100)
    - **status**: Optional filter by status
    - **start_date**: Optional filter by start date
    - **end_date**: Optional filter by end date

    Returns a paginated list of orders with item counts.
    """
    orders_data, total, total_pages = OrderService.get_orders_with_pagination(
        db=db,
        page=page,
        per_page=per_page,
        status=status,
        start_date=start_date,
        end_date=end_date
    )

    # Convert to OrderListItem models
    order_items = [OrderListItem(**order) for order in orders_data]

    return OrderListResponse(
        items=order_items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Task ID: 09f4a7e6
    Update order status with validation of allowed transitions.

    - **order_id**: ID of the order to update
    - **new_status**: New status (pending, processing, shipped, delivered, cancelled)
    - **notes**: Optional notes about the status change

    Valid transitions:
    - pending → processing, cancelled
    - processing → shipped, cancelled
    - shipped → delivered, cancelled
    - any status → cancelled

    Returns the updated order with new status.
    """
    try:
        order = OrderService.update_order_status(
            db=db,
            order_id=order_id,
            new_status=status_update.new_status,
            user_id=current_user.id,
            notes=status_update.notes
        )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )


@router.get("/{order_id}/history", response_model=List[OrderStatusHistoryResponse])
def get_order_status_history(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Task ID: 09f4a7e6
    Get the status change history for an order.

    - **order_id**: ID of the order

    Returns a chronological list of all status changes with user information and notes.
    """
    # Check if order exists
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    history = OrderService.get_order_status_history(db, order_id)
    return [OrderStatusHistoryResponse(**entry) for entry in history]


@router.get("/{order_id}/valid-statuses", response_model=List[str])
def get_valid_next_statuses(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Task ID: 09f4a7e6
    Get list of valid next statuses for an order.

    - **order_id**: ID of the order

    Returns a list of valid status values that the order can transition to.
    """
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    valid_statuses = OrderService.get_valid_next_statuses(order.status)
    return valid_statuses
