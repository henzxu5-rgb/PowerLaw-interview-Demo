import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Float, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def _uuid() -> str:
    return uuid.uuid4().hex[:12]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(256))
    type: Mapped[str] = mapped_column(String(64))
    party: Mapped[str] = mapped_column(String(256))
    amount: Mapped[float] = mapped_column(Float, default=0)
    signed_date: Mapped[str] = mapped_column(String(32))
    expiry_date: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="draft")
    content: Mapped[str] = mapped_column(Text, default="")
    ai_analyzed: Mapped[bool] = mapped_column(Boolean, default=False)
    risk_level: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    risks: Mapped[list["Risk"]] = relationship(back_populates="contract", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship(back_populates="contract", cascade="all, delete-orphan")
    annotations: Mapped[list["Annotation"]] = relationship(back_populates="contract", cascade="all, delete-orphan")
    text_edits: Mapped[list["TextEdit"]] = relationship(back_populates="contract", cascade="all, delete-orphan")


class Risk(Base):
    __tablename__ = "risks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    contract_id: Mapped[str] = mapped_column(ForeignKey("contracts.id", ondelete="CASCADE"))
    contract_name: Mapped[str] = mapped_column(String(256), default="")
    type: Mapped[str] = mapped_column(String(32))
    level: Mapped[str] = mapped_column(String(16))
    description: Mapped[str] = mapped_column(Text)
    suggestion: Mapped[str] = mapped_column(Text)
    clause: Mapped[str | None] = mapped_column(Text, nullable=True)
    clause_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    clause_end: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    assigned_to: Mapped[str | None] = mapped_column(String(128), nullable=True)
    assigned_department: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    contract: Mapped["Contract"] = relationship(back_populates="risks")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[str] = mapped_column(String(32))
    priority: Mapped[str] = mapped_column(String(16), default="medium")
    status: Mapped[str] = mapped_column(String(32), default="pending")
    assignee: Mapped[str] = mapped_column(String(128), default="")
    due_date: Mapped[str] = mapped_column(String(32))
    contract_id: Mapped[str | None] = mapped_column(ForeignKey("contracts.id", ondelete="CASCADE"), nullable=True)
    contract_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    contract: Mapped["Contract | None"] = relationship(back_populates="tasks")


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    contract_id: Mapped[str] = mapped_column(ForeignKey("contracts.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text)
    note: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    contract: Mapped["Contract"] = relationship(back_populates="annotations")


class TextEdit(Base):
    __tablename__ = "text_edits"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    contract_id: Mapped[str] = mapped_column(ForeignKey("contracts.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(16))
    text: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    contract: Mapped["Contract"] = relationship(back_populates="text_edits")
