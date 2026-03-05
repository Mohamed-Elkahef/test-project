# Task ID: 93b9969c
from sqlalchemy.orm import Session
from typing import List, Optional, Tuple, Dict, Any
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryItemCreate, RESTOCK_THRESHOLD


class InsufficientStockException(Exception):
    """Exception raised when there is insufficient stock for an order."""

    def __init__(
        self,
        product_name: str,
        requested_quantity: int,
        available_quantity: int,
        sku: Optional[str] = None
    ):
        self.product_name = product_name
        self.requested_quantity = requested_quantity
        self.available_quantity = available_quantity
        self.sku = sku
        self.message = (
            f"Insufficient stock for '{product_name}': "
            f"requested {requested_quantity}, available {available_quantity}"
        )
        super().__init__(self.message)


class InventoryService:
    """Service class for inventory-related business logic."""

    @staticmethod
    def get_item_by_id(db: Session, item_id: int) -> Optional[InventoryItem]:
        """
        Get an inventory item by ID.

        Args:
            db: Database session
            item_id: Item ID

        Returns:
            InventoryItem or None
        """
        return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()

    @staticmethod
    def get_item_by_name(db: Session, name: str) -> Optional[InventoryItem]:
        """
        Get an inventory item by name.

        Args:
            db: Database session
            name: Product name

        Returns:
            InventoryItem or None
        """
        return db.query(InventoryItem).filter(InventoryItem.name == name).first()

    @staticmethod
    def get_item_by_sku(db: Session, sku: str) -> Optional[InventoryItem]:
        """
        Get an inventory item by SKU.

        Args:
            db: Database session
            sku: Product SKU

        Returns:
            InventoryItem or None
        """
        return db.query(InventoryItem).filter(InventoryItem.sku == sku).first()

    @staticmethod
    def get_all_items(db: Session, skip: int = 0, limit: int = 100) -> List[InventoryItem]:
        """
        Get all inventory items with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of InventoryItem
        """
        return db.query(InventoryItem).offset(skip).limit(limit).all()

    @staticmethod
    def get_all_items_with_restock_flag(db: Session) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get all inventory items with needs_restock flag.

        Args:
            db: Database session

        Returns:
            Tuple of (list of items with restock flag, total count)
        """
        items = db.query(InventoryItem).order_by(InventoryItem.name).all()
        total = len(items)

        result = []
        for item in items:
            result.append({
                "id": item.id,
                "name": item.name,
                "sku": item.sku,
                "quantity": item.quantity,
                "needs_restock": item.quantity <= RESTOCK_THRESHOLD,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            })

        return result, total

    @staticmethod
    def item_to_response_dict(item: InventoryItem) -> Dict[str, Any]:
        """
        Convert an InventoryItem to a response dictionary with needs_restock flag.

        Args:
            item: InventoryItem instance

        Returns:
            Dictionary with item data and needs_restock flag
        """
        return {
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "quantity": item.quantity,
            "needs_restock": item.quantity <= RESTOCK_THRESHOLD,
            "created_at": item.created_at,
            "updated_at": item.updated_at
        }

    @staticmethod
    def create_item(db: Session, item_data: InventoryItemCreate) -> InventoryItem:
        """
        Create a new inventory item.

        Args:
            db: Database session
            item_data: Item creation data

        Returns:
            Created InventoryItem

        Raises:
            ValueError: If SKU already exists
        """
        existing = InventoryService.get_item_by_sku(db, item_data.sku)
        if existing:
            raise ValueError(f"SKU '{item_data.sku}' already exists")

        db_item = InventoryItem(
            name=item_data.name,
            sku=item_data.sku,
            quantity=item_data.quantity
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def check_stock_availability(
        db: Session,
        items: List[Tuple[str, int]]
    ) -> List[Tuple[str, int, int, Optional[str]]]:
        """
        Check if all items have sufficient stock.

        Args:
            db: Database session
            items: List of (product_name, requested_quantity) tuples

        Returns:
            List of (product_name, requested_qty, available_qty, sku) for items with insufficient stock
        """
        insufficient_items = []

        for product_name, requested_quantity in items:
            inventory_item = InventoryService.get_item_by_name(db, product_name)

            if inventory_item is None:
                # Item not found in inventory - treat as 0 stock
                insufficient_items.append((product_name, requested_quantity, 0, None))
            elif inventory_item.quantity < requested_quantity:
                insufficient_items.append((
                    product_name,
                    requested_quantity,
                    inventory_item.quantity,
                    inventory_item.sku
                ))

        return insufficient_items

    @staticmethod
    def validate_and_reserve_stock(
        db: Session,
        items: List[Tuple[str, int]]
    ) -> None:
        """
        Validate stock availability and decrement quantities.
        This should be called within a transaction.

        Args:
            db: Database session
            items: List of (product_name, requested_quantity) tuples

        Raises:
            InsufficientStockException: If any item has insufficient stock
        """
        # First, check all items
        for product_name, requested_quantity in items:
            inventory_item = InventoryService.get_item_by_name(db, product_name)

            if inventory_item is None:
                raise InsufficientStockException(
                    product_name=product_name,
                    requested_quantity=requested_quantity,
                    available_quantity=0,
                    sku=None
                )

            if inventory_item.quantity < requested_quantity:
                raise InsufficientStockException(
                    product_name=product_name,
                    requested_quantity=requested_quantity,
                    available_quantity=inventory_item.quantity,
                    sku=inventory_item.sku
                )

        # If all checks pass, decrement stock
        for product_name, requested_quantity in items:
            inventory_item = InventoryService.get_item_by_name(db, product_name)
            inventory_item.quantity -= requested_quantity

    @staticmethod
    def adjust_stock(db: Session, item_id: int, adjustment: int) -> InventoryItem:
        """
        Adjust stock level for an inventory item.

        Args:
            db: Database session
            item_id: Inventory item ID
            adjustment: Amount to adjust (positive to add, negative to remove)

        Returns:
            Updated InventoryItem

        Raises:
            ValueError: If item not found or resulting quantity would be negative
        """
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()

        if not item:
            raise ValueError(f"Inventory item with ID {item_id} not found")

        new_quantity = item.quantity + adjustment
        if new_quantity < 0:
            raise ValueError(
                f"Cannot reduce stock below 0. Current: {item.quantity}, "
                f"Adjustment: {adjustment}"
            )

        item.quantity = new_quantity
        db.commit()
        db.refresh(item)
        return item
