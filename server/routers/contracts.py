from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Contract
from schemas import ContractCreate, ContractUpdate, ContractOut

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


@router.get("/", response_model=list[ContractOut])
def list_contracts(
    search: str | None = Query(None),
    status: str | None = Query(None),
    type: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Contract)
    if status:
        q = q.filter(Contract.status == status)
    if type:
        q = q.filter(Contract.type == type)
    if search:
        like = f"%{search}%"
        q = q.filter(
            Contract.name.ilike(like)
            | Contract.party.ilike(like)
            | Contract.type.ilike(like)
        )
    rows = q.order_by(Contract.created_at.desc()).all()
    return [ContractOut.from_orm_model(r) for r in rows]


@router.get("/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    obj = db.get(Contract, contract_id)
    if not obj:
        raise HTTPException(404, "Contract not found")
    return ContractOut.from_orm_model(obj)


@router.post("/", response_model=ContractOut, status_code=201)
def create_contract(body: ContractCreate, db: Session = Depends(get_db)):
    obj = Contract(
        name=body.name,
        type=body.type,
        party=body.party,
        amount=body.amount,
        signed_date=body.signed_date,
        expiry_date=body.expiry_date,
        status=body.status,
        content=body.content,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ContractOut.from_orm_model(obj)


@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: str, body: ContractUpdate, db: Session = Depends(get_db)):
    obj = db.get(Contract, contract_id)
    if not obj:
        raise HTTPException(404, "Contract not found")
    data = body.model_dump(exclude_unset=True)
    field_map = {
        "signed_date": "signed_date",
        "expiry_date": "expiry_date",
        "ai_analyzed": "ai_analyzed",
        "risk_level": "risk_level",
    }
    for key, val in data.items():
        attr = field_map.get(key, key)
        setattr(obj, attr, val)
    db.commit()
    db.refresh(obj)
    return ContractOut.from_orm_model(obj)


@router.delete("/{contract_id}", status_code=204)
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    obj = db.get(Contract, contract_id)
    if not obj:
        raise HTTPException(404, "Contract not found")
    db.delete(obj)
    db.commit()
