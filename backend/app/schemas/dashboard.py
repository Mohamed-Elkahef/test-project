# Task ID: 1cf37973
from pydantic import BaseModel
from typing import Dict
from decimal import Decimal
from datetime import datetime


class RecentOrder(BaseModel):
    """Schema for recent order in dashboard."""
    id: int
    order_number: str
    customer_name: str
    status: str
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    """Schema for dashboard summary response."""
    total_orders: int
    orders_today: int
    total_revenue: Decimal
    revenue_today: Decimal
    orders_by_status: Dict[str, int]
    recent_orders: list[RecentOrder]

    class Config:
        json_schema_extra = {
            "example": {
                "total_orders": 150,
                "orders_today": 5,
                "total_revenue": 45000.00,
                "revenue_today": 1250.00,
                "orders_by_status": {
                    "pending": 10,
                    "processing": 5,
                    "shipped": 8,
                    "delivered": 125,
                    "cancelled": 2
                },
                "recent_orders": [
                    {
                        "id": 1,
                        "order_number": "ORD-20260305-0001",
                        "customer_name": "John Doe",
                        "status": "pending",
                        "total_amount": 349.97,
                        "created_at": "2026-03-05T10:30:00"
                    }
                ]
            }
        }
