# Task ID: 1cf37973
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from decimal import Decimal
from typing import Dict
from app.models.order import Order
from app.schemas.dashboard import DashboardSummary, RecentOrder


class DashboardService:
    """Service class for dashboard-related business logic."""

    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummary:
        """
        Get dashboard summary with aggregated metrics.

        Args:
            db: Database session

        Returns:
            DashboardSummary: Dashboard summary with all metrics
        """
        # Get today's date range (start and end of today)
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = datetime.combine(date.today(), datetime.max.time())

        # Total orders count
        total_orders = db.query(func.count(Order.id)).scalar() or 0

        # Orders today count
        orders_today = (
            db.query(func.count(Order.id))
            .filter(Order.created_at >= today_start)
            .filter(Order.created_at <= today_end)
            .scalar() or 0
        )

        # Total revenue
        total_revenue_result = db.query(func.sum(Order.total_amount)).scalar()
        total_revenue = Decimal(str(total_revenue_result)) if total_revenue_result else Decimal("0.00")

        # Revenue today
        revenue_today_result = (
            db.query(func.sum(Order.total_amount))
            .filter(Order.created_at >= today_start)
            .filter(Order.created_at <= today_end)
            .scalar()
        )
        revenue_today = Decimal(str(revenue_today_result)) if revenue_today_result else Decimal("0.00")

        # Orders by status - ensure all statuses are included
        status_list = ["pending", "processing", "shipped", "delivered", "cancelled"]

        # Get actual counts from database
        status_counts = (
            db.query(Order.status, func.count(Order.id))
            .group_by(Order.status)
            .all()
        )

        # Create dictionary with all statuses initialized to 0
        orders_by_status: Dict[str, int] = {status: 0 for status in status_list}

        # Update with actual counts
        for status, count in status_counts:
            if status in orders_by_status:
                orders_by_status[status] = count
            else:
                # If there's a status not in our predefined list, include it
                orders_by_status[status] = count

        # Recent orders (last 5)
        recent_orders_query = (
            db.query(Order)
            .order_by(Order.created_at.desc())
            .limit(5)
            .all()
        )

        # Convert to RecentOrder schema
        recent_orders = [
            RecentOrder(
                id=order.id,
                order_number=order.order_number,
                customer_name=order.customer_name,
                status=order.status,
                total_amount=order.total_amount,
                created_at=order.created_at
            )
            for order in recent_orders_query
        ]

        return DashboardSummary(
            total_orders=total_orders,
            orders_today=orders_today,
            total_revenue=total_revenue,
            revenue_today=revenue_today,
            orders_by_status=orders_by_status,
            recent_orders=recent_orders
        )
