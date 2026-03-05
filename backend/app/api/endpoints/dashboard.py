# Task ID: 1cf37973
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard summary with metrics.
    Task ID: 1cf37973

    Returns:
    - **total_orders**: Total number of orders
    - **orders_today**: Number of orders created today
    - **total_revenue**: Total revenue from all orders
    - **revenue_today**: Revenue from orders created today
    - **orders_by_status**: Count of orders by each status (pending, processing, shipped, delivered, cancelled)
    - **recent_orders**: Last 5 orders with basic info

    Requires authentication.
    """
    try:
        summary = DashboardService.get_dashboard_summary(db)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard summary: {str(e)}"
        )
