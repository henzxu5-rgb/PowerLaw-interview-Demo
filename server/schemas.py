from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field


# ── Contract ──────────────────────────────────────────────────────────

class ContractCreate(BaseModel):
    name: str
    type: str
    party: str
    amount: float = 0
    signed_date: str = Field(..., alias="signedDate")
    expiry_date: str = Field(..., alias="expiryDate")
    status: str = "draft"
    content: str = ""

    model_config = {"populate_by_name": True}


class ContractUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    party: str | None = None
    amount: float | None = None
    signed_date: str | None = Field(None, alias="signedDate")
    expiry_date: str | None = Field(None, alias="expiryDate")
    status: str | None = None
    content: str | None = None
    ai_analyzed: bool | None = Field(None, alias="aiAnalyzed")
    risk_level: str | None = Field(None, alias="riskLevel")

    model_config = {"populate_by_name": True}


class ContractOut(BaseModel):
    id: str
    name: str
    type: str
    party: str
    amount: float
    signedDate: str
    expiryDate: str
    status: str
    content: str
    aiAnalyzed: bool
    riskLevel: str | None
    createdAt: str
    updatedAt: str

    @classmethod
    def from_orm_model(cls, obj) -> ContractOut:
        return cls(
            id=obj.id,
            name=obj.name,
            type=obj.type,
            party=obj.party,
            amount=obj.amount,
            signedDate=obj.signed_date,
            expiryDate=obj.expiry_date,
            status=obj.status,
            content=obj.content,
            aiAnalyzed=obj.ai_analyzed or False,
            riskLevel=obj.risk_level,
            createdAt=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            updatedAt=obj.updated_at.isoformat() if isinstance(obj.updated_at, datetime) else str(obj.updated_at),
        )


# ── Risk ──────────────────────────────────────────────────────────────

class RiskCreate(BaseModel):
    contract_id: str = Field(..., alias="contractId")
    contract_name: str = Field("", alias="contractName")
    type: str
    level: str
    description: str
    suggestion: str
    clause: str | None = None
    clause_position: dict | None = Field(None, alias="clausePosition")
    status: str = "pending"

    model_config = {"populate_by_name": True}


class RiskUpdate(BaseModel):
    status: str | None = None
    assigned_to: str | None = Field(None, alias="assignedTo")
    assigned_department: str | None = Field(None, alias="assignedDepartment")
    resolved_at: str | None = Field(None, alias="resolvedAt")
    level: str | None = None
    description: str | None = None
    suggestion: str | None = None

    model_config = {"populate_by_name": True}


class RiskOut(BaseModel):
    id: str
    contractId: str
    contractName: str
    type: str
    level: str
    description: str
    suggestion: str
    clause: str | None
    clausePosition: dict | None
    status: str
    assignedTo: str | None
    assignedDepartment: str | None
    createdAt: str
    resolvedAt: str | None

    @classmethod
    def from_orm_model(cls, obj) -> RiskOut:
        clause_pos = None
        if obj.clause_start is not None and obj.clause_end is not None:
            clause_pos = {"start": obj.clause_start, "end": obj.clause_end}
        return cls(
            id=obj.id,
            contractId=obj.contract_id,
            contractName=obj.contract_name,
            type=obj.type,
            level=obj.level,
            description=obj.description,
            suggestion=obj.suggestion,
            clause=obj.clause,
            clausePosition=clause_pos,
            status=obj.status,
            assignedTo=obj.assigned_to,
            assignedDepartment=obj.assigned_department,
            createdAt=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            resolvedAt=obj.resolved_at.isoformat() if isinstance(obj.resolved_at, datetime) else str(obj.resolved_at) if obj.resolved_at else None,
        )


# ── Task ──────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    type: str
    priority: str = "medium"
    status: str = "pending"
    assignee: str = ""
    due_date: str = Field(..., alias="dueDate")
    contract_id: str | None = Field(None, alias="contractId")
    contract_name: str | None = Field(None, alias="contractName")

    model_config = {"populate_by_name": True}


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    priority: str | None = None
    status: str | None = None
    assignee: str | None = None
    due_date: str | None = Field(None, alias="dueDate")
    contract_id: str | None = Field(None, alias="contractId")
    contract_name: str | None = Field(None, alias="contractName")
    completed_at: str | None = Field(None, alias="completedAt")

    model_config = {"populate_by_name": True}


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    type: str
    priority: str
    status: str
    assignee: str
    dueDate: str
    contractId: str | None
    contractName: str | None
    createdAt: str
    completedAt: str | None

    @classmethod
    def from_orm_model(cls, obj) -> TaskOut:
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            type=obj.type,
            priority=obj.priority,
            status=obj.status,
            assignee=obj.assignee,
            dueDate=obj.due_date,
            contractId=obj.contract_id,
            contractName=obj.contract_name,
            createdAt=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            completedAt=obj.completed_at.isoformat() if isinstance(obj.completed_at, datetime) else str(obj.completed_at) if obj.completed_at else None,
        )


# ── Annotation ────────────────────────────────────────────────────────

class AnnotationCreate(BaseModel):
    contract_id: str = Field(..., alias="contractId")
    text: str
    note: str

    model_config = {"populate_by_name": True}


class AnnotationOut(BaseModel):
    id: str
    contractId: str
    text: str
    note: str
    createdAt: str

    @classmethod
    def from_orm_model(cls, obj) -> AnnotationOut:
        return cls(
            id=obj.id,
            contractId=obj.contract_id,
            text=obj.text,
            note=obj.note,
            createdAt=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
        )


# ── TextEdit ──────────────────────────────────────────────────────────

class TextEditCreate(BaseModel):
    contract_id: str = Field(..., alias="contractId")
    type: str
    text: str
    position: int = 0

    model_config = {"populate_by_name": True}


class TextEditOut(BaseModel):
    id: str
    contractId: str
    type: str
    text: str
    position: int
    createdAt: str

    @classmethod
    def from_orm_model(cls, obj) -> TextEditOut:
        return cls(
            id=obj.id,
            contractId=obj.contract_id,
            type=obj.type,
            text=obj.text,
            position=obj.position,
            createdAt=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
        )


# ── Stats ─────────────────────────────────────────────────────────────

class DashboardStatsOut(BaseModel):
    totalContracts: int
    pendingTasks: int
    highRisks: int
    completionRate: int


# ── AI ────────────────────────────────────────────────────────────────

class AIAnalyzeRequest(BaseModel):
    contractName: str
    contractType: str
    content: str


class AIAdviceRequest(BaseModel):
    contractName: str
    contractType: str
    content: str
    riskDescription: str


class RiskItem(BaseModel):
    type: str
    level: str
    description: str
    suggestion: str
    clause: str | None = None
    clausePosition: dict | None = None


class AIAnalyzeResponse(BaseModel):
    overallRisk: str
    confidence: float
    thinking: list[str]
    risks: list[RiskItem]


class AIAdviceResponse(BaseModel):
    advice: str
