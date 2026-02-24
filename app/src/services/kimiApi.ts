import type { ContractAnalysisRequest, RiskAnalysisResult, Contract, Risk } from '@/types';
import { aiApi } from '@/services/api';

export async function analyzeContractRisk(
  contract: ContractAnalysisRequest
): Promise<RiskAnalysisResult> {
  return aiApi.analyze(contract);
}

export async function autoAnalyzeContract(contract: Contract): Promise<Risk[]> {
  const result = await analyzeContractRisk({
    contractName: contract.name,
    contractType: contract.type,
    content: contract.content || '',
  });

  return result.risks.map((riskData, index) => ({
    id: `${Date.now()}-${index}`,
    contractId: contract.id,
    contractName: contract.name,
    type: riskData.type,
    level: riskData.level,
    description: riskData.description,
    suggestion: riskData.suggestion,
    clause: riskData.clause,
    clausePosition: riskData.clausePosition,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  }));
}

export async function generateContractAdvice(
  contract: ContractAnalysisRequest,
  riskDescription: string
): Promise<string> {
  const res = await aiApi.advice({ ...contract, riskDescription });
  return res.advice;
}
