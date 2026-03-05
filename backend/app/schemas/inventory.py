# Task ID: 93b9969c
from pydantic import BaseModel, Field, computed_field
from typing import Optional, List
from datetime import datetime

# Restock threshold constant
RESTOCK_THRESHOLD = 10


class InventoryItemBase(BaseModel):
    """Base schema for inventory item."""
    name: str = Field(..., min_length=1, description="Product name")
    sku: str = Field(..., min_length=1, description="Unique product SKU")


class InventoryItemCreate(InventoryItemBase):
    """Schema for creating an inventory item."""
    quantity: int = Field(default=0, ge=0, description="Initial quantity")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Product A",
                "sku": "PROD-A-001",
                "quantity": 100
            }
        }


class InventoryItemResponse(InventoryItemBase):
    """
    Schema for inventory item response.
    Includes needs_restock flag for items with quantity <= 10.
    """
    id: int
    quantity: int
    created_at: datetime
    updated_at: datetime
    needs_restock: bool = False

    class Config:
        from_attributes = True


class InventoryListResponse(BaseModel):
    """Schema for inventory list response."""
    items: List[InventoryItemResponse]
    total: int

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "name": "Product A",
                        "sku": "PROD-A-001",
                        "quantity": 100,
                        "needs_restock": False,
                        "created_at": "2026-03-06T10:00:00",
                        "updated_at": "2026-03-06T10:00:00"
                    }
                ],
                "total": 1
            }
        }


class StockAdjustment(BaseModel):
    """Schema for adjusting stock levels."""
    adjustment: int = Field(..., description="Amount to adjust (positive to add, negative to remove)")

    class Config:
        json_schema_extra = {
            "example": {
                "adjustment": 10
            }
        }


class InsufficientStockError(BaseModel):
    """Schema for insufficient stock error response."""
    detail: str
    product_name: str
    requested_quantity: int
    available_quantity: int
    sku: Optional[str] = None
