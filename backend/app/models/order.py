# Task ID: 88cca822
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Order(Base):
    """
    Order model representing the orders table in the database.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class OrderItem(Base):
    """
    OrderItem model representing the order_items table in the database.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
