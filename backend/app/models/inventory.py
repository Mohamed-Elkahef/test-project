# Task ID: 93b9969c
from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint
from sqlalchemy.sql import func
from app.db.database import Base


class InventoryItem(Base):
    """
    InventoryItem model representing the inventory_items table in the database.
    Tracks product stock levels with SKU-based identification.
    Task ID: 93b9969c
    """
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(255), unique=True, nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
    )
