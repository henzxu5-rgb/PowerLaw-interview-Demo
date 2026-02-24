from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Annotation, TextEdit
from schemas import (
    AnnotationCreate, AnnotationOut,
    TextEditCreate, TextEditOut,
)

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.get("/", response_model=list[AnnotationOut])
def list_annotations(
    contract_id: str = Query(..., alias="contractId"),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Annotation)
        .filter(Annotation.contract_id == contract_id)
        .order_by(Annotation.created_at.desc())
        .all()
    )
    return [AnnotationOut.from_orm_model(r) for r in rows]


@router.post("/", response_model=AnnotationOut, status_code=201)
def create_annotation(body: AnnotationCreate, db: Session = Depends(get_db)):
    obj = Annotation(
        contract_id=body.contract_id,
        text=body.text,
        note=body.note,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return AnnotationOut.from_orm_model(obj)


@router.delete("/{annotation_id}", status_code=204)
def delete_annotation(annotation_id: str, db: Session = Depends(get_db)):
    obj = db.get(Annotation, annotation_id)
    if not obj:
        raise HTTPException(404, "Annotation not found")
    db.delete(obj)
    db.commit()


# ── TextEdits (mounted under /api/text-edits) ────────────────────────

text_edits_router = APIRouter(prefix="/api/text-edits", tags=["text-edits"])


@text_edits_router.get("/", response_model=list[TextEditOut])
def list_text_edits(
    contract_id: str = Query(..., alias="contractId"),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(TextEdit)
        .filter(TextEdit.contract_id == contract_id)
        .order_by(TextEdit.created_at.desc())
        .all()
    )
    return [TextEditOut.from_orm_model(r) for r in rows]


@text_edits_router.post("/", response_model=TextEditOut, status_code=201)
def create_text_edit(body: TextEditCreate, db: Session = Depends(get_db)):
    obj = TextEdit(
        contract_id=body.contract_id,
        type=body.type,
        text=body.text,
        position=body.position,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return TextEditOut.from_orm_model(obj)


@text_edits_router.delete("/{edit_id}", status_code=204)
def delete_text_edit(edit_id: str, db: Session = Depends(get_db)):
    obj = db.get(TextEdit, edit_id)
    if not obj:
        raise HTTPException(404, "TextEdit not found")
    db.delete(obj)
    db.commit()
