# Task ID: 93b9969c
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryListResponse,
    StockAdjustment,
    RESTOCK_THRESHOLD
)
from app.services.inventory_service import InventoryService

router = APIRouter()


def _add_restock_flag(item) -> dict:
    """Convert inventory item to response dict with needs_restock flag."""
    return {
        "id": item.id,
        "name": item.name,
        "sku": item.sku,
        "quantity": item.quantity,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "needs_restock": item.quantity <= RESTOCK_THRESHOLD
    }


@router.get("/", response_model=InventoryListResponse)
def get_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all inventory items.
    Items with quantity <= 10 will have needs_restock set to True.
    """
    items = InventoryService.get_all_items(db, skip=skip, limit=limit)
    items_with_flag = [_add_restock_flag(item) for item in items]
    return InventoryListResponse(items=items_with_flag, total=len(items))


@router.post("/", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    item_data: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new inventory item.
    SKU must be unique.
    """
    try:
        item = InventoryService.create_item(db, item_data)
        return _add_restock_flag(item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/{item_id}/stock", response_model=InventoryItemResponse)
def adjust_stock(
    item_id: int,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Adjust stock level for an inventory item.
    Use positive values to add stock, negative to remove.
    """
    try:
        item = InventoryService.adjust_stock(db, item_id, adjustment.adjustment)
        return _add_restock_flag(item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{item_id}", response_model=InventoryItemResponse)
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific inventory item by ID.
    """
    from app.models.inventory import InventoryItem
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return _add_restock_flag(item)
