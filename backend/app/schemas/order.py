# Task ID: 88cca822
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class OrderItemCreate(BaseModel):
    """Schema for creating an order item."""
    product_name: str = Field(..., min_length=1, description="Product name")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    unit_price: Decimal = Field(..., gt=0, description="Unit price must be greater than 0")

    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "Product A",
                "quantity": 2,
                "unit_price": 99.99
            }
        }


class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    customer_name: str = Field(..., min_length=1, description="Customer name")
    customer_email: str = Field(..., min_length=1, description="Customer email")
    notes: Optional[str] = Field(None, description="Optional order notes")
    items: List[OrderItemCreate] = Field(..., min_items=1, description="At least one item required")

    @validator('items')
    def validate_items(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one item is required')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "customer_name": "John Doe",
                "customer_email": "john.doe@example.com",
                "notes": "Please deliver by 5 PM",
                "items": [
                    {
                        "product_name": "Product A",
                        "quantity": 2,
                        "unit_price": 99.99
                    },
                    {
                        "product_name": "Product B",
                        "quantity": 1,
                        "unit_price": 149.99
                    }
                ]
            }
        }


class OrderResponse(BaseModel):
    """
    Task ID: 364c8938
    Schema for order response.
    """
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    status: str
    total_amount: Decimal
    notes: Optional[str]
    created_by: Optional[int] = None  # Nullable to support guest orders
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderListItem(BaseModel):
    """Schema for order list item with item count."""
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    status: str
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    item_count: int

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Schema for paginated order list response."""
    items: List[OrderListItem]
    total: int
    page: int
    per_page: int
    total_pages: int

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "order_number": "ORD-20260305-0001",
                        "customer_name": "John Doe",
                        "customer_email": "john.doe@example.com",
                        "status": "pending",
                        "total_amount": 349.97,
                        "created_at": "2026-03-05T10:30:00",
                        "updated_at": "2026-03-05T10:30:00",
                        "item_count": 2
                    }
                ],
                "total": 50,
                "page": 1,
                "per_page": 10,
                "total_pages": 5
            }
        }


class OrderStatusUpdate(BaseModel):
    """
    Task ID: 09f4a7e6
    Schema for updating order status.
    """
    new_status: str = Field(..., min_length=1, description="New status for the order")
    notes: Optional[str] = Field(None, description="Optional notes about the status change")

    class Config:
        json_schema_extra = {
            "example": {
                "new_status": "processing",
                "notes": "Started processing the order"
            }
        }


class OrderStatusHistoryResponse(BaseModel):
    """
    Task ID: 09f4a7e6
    Schema for order status history response.
    """
    id: int
    order_id: int
    old_status: Optional[str]
    new_status: str
    changed_by: int
    changed_by_name: Optional[str] = None
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "order_id": 1,
                "old_status": "pending",
                "new_status": "processing",
                "changed_by": 1,
                "changed_by_name": "John Doe",
                "notes": "Started processing the order",
                "created_at": "2026-03-05T10:30:00"
            }
        }
