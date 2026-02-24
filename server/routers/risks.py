from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import Risk
from schemas import RiskCreate, RiskUpdate, RiskOut

router = APIRouter(prefix="/api/risks", tags=["risks"])


@router.get("/", response_model=list[RiskOut])
def list_risks(
    contract_id: str | None = Query(None, alias="contractId"),
    level: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Risk)
    if contract_id:
        q = q.filter(Risk.contract_id == contract_id)
    if level:
        q = q.filter(Risk.level == level)
    if status:
        q = q.filter(Risk.status == status)
    rows = q.order_by(Risk.created_at.desc()).all()
    return [RiskOut.from_orm_model(r) for r in rows]


@router.post("/", response_model=RiskOut, status_code=201)
def create_risk(body: RiskCreate, db: Session = Depends(get_db)):
    clause_start = None
    clause_end = None
    if body.clause_position:
        clause_start = body.clause_position.get("start")
        clause_end = body.clause_position.get("end")
    obj = Risk(
        contract_id=body.contract_id,
        contract_name=body.contract_name,
        type=body.type,
        level=body.level,
        description=body.description,
        suggestion=body.suggestion,
        clause=body.clause,
        clause_start=clause_start,
        clause_end=clause_end,
        status=body.status,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return RiskOut.from_orm_model(obj)


@router.patch("/{risk_id}", response_model=RiskOut)
def update_risk(risk_id: str, body: RiskUpdate, db: Session = Depends(get_db)):
    obj = db.get(Risk, risk_id)
    if not obj:
        raise HTTPException(404, "Risk not found")
    data = body.model_dump(exclude_unset=True)
    field_map = {
        "assigned_to": "assigned_to",
        "assigned_department": "assigned_department",
        "resolved_at": "resolved_at",
    }
    for key, val in data.items():
        attr = field_map.get(key, key)
        if attr == "resolved_at" and isinstance(val, str):
            val = datetime.fromisoformat(val)
        setattr(obj, attr, val)
    if data.get("status") == "resolved" and not obj.resolved_at:
        obj.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obj)
    return RiskOut.from_orm_model(obj)


@router.delete("/{risk_id}", status_code=204)
def delete_risk(risk_id: str, db: Session = Depends(get_db)):
    obj = db.get(Risk, risk_id)
    if not obj:
        raise HTTPException(404, "Risk not found")
    db.delete(obj)
    db.commit()
