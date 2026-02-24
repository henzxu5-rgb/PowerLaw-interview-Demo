from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    contract_id: str | None = Query(None, alias="contractId"),
    db: Session = Depends(get_db),
):
    q = db.query(Task)
    if status:
        q = q.filter(Task.status == status)
    if priority:
        q = q.filter(Task.priority == priority)
    if contract_id:
        q = q.filter(Task.contract_id == contract_id)
    rows = q.order_by(Task.created_at.desc()).all()
    return [TaskOut.from_orm_model(r) for r in rows]


@router.post("/", response_model=TaskOut, status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    obj = Task(
        title=body.title,
        description=body.description,
        type=body.type,
        priority=body.priority,
        status=body.status,
        assignee=body.assignee,
        due_date=body.due_date,
        contract_id=body.contract_id,
        contract_name=body.contract_name,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return TaskOut.from_orm_model(obj)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, body: TaskUpdate, db: Session = Depends(get_db)):
    obj = db.get(Task, task_id)
    if not obj:
        raise HTTPException(404, "Task not found")
    data = body.model_dump(exclude_unset=True)
    field_map = {
        "due_date": "due_date",
        "contract_id": "contract_id",
        "contract_name": "contract_name",
        "completed_at": "completed_at",
    }
    for key, val in data.items():
        attr = field_map.get(key, key)
        if attr == "completed_at" and isinstance(val, str):
            val = datetime.fromisoformat(val)
        setattr(obj, attr, val)
    if data.get("status") == "completed" and not obj.completed_at:
        obj.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obj)
    return TaskOut.from_orm_model(obj)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    obj = db.get(Task, task_id)
    if not obj:
        raise HTTPException(404, "Task not found")
    db.delete(obj)
    db.commit()
