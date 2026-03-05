# Task ID: 88cca822
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse, OrderListItem
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order with items.

    - **customer_name**: Name of the customer
    - **customer_email**: Email of the customer
    - **notes**: Optional notes for the order
    - **items**: List of order items (at least one required)

    Returns the created order with auto-generated order_number and calculated totals.
    """
    try:
        order = OrderService.create_order(db, order_data, current_user.id)
        return order
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
