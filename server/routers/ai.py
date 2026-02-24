from fastapi import APIRouter
from schemas import AIAnalyzeRequest, AIAnalyzeResponse, AIAdviceRequest, AIAdviceResponse
from services.kimi_service import analyze_contract_risk, generate_contract_advice

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze(body: AIAnalyzeRequest):
    result = await analyze_contract_risk(
        contract_name=body.contractName,
        contract_type=body.contractType,
        content=body.content,
    )
    return AIAnalyzeResponse(**result)


@router.post("/advice", response_model=AIAdviceResponse)
async def advice(body: AIAdviceRequest):
    text = await generate_contract_advice(
        contract_name=body.contractName,
        contract_type=body.contractType,
        content=body.content,
        risk_description=body.riskDescription,
    )
    return AIAdviceResponse(advice=text)
