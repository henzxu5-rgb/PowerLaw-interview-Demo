from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Contract, Risk, Task
from schemas import DashboardStatsOut

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStatsOut)
def dashboard_stats(db: Session = Depends(get_db)):
    total_contracts = db.query(func.count(Contract.id)).scalar() or 0
    pending_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.status != "completed")
        .scalar()
        or 0
    )
    high_risks = (
        db.query(func.count(Risk.id))
        .filter(Risk.level == "high", Risk.status != "resolved")
        .scalar()
        or 0
    )
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.status == "completed")
        .scalar()
        or 0
    )
    rate = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    return DashboardStatsOut(
        totalContracts=total_contracts,
        pendingTasks=pending_tasks,
        highRisks=high_risks,
        completionRate=rate,
    )
