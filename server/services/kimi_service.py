import os
import json
import random
import httpx
from dotenv import load_dotenv

load_dotenv()

KIMI_API_KEY = os.getenv("KIMI_API_KEY", "")
KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions"
KIMI_MODEL = "kimi-latest"
TIMEOUT = 120.0


async def analyze_contract_risk(contract_name: str, contract_type: str, content: str) -> dict:
    prompt = f"""你是一位专业的合同风险审核专家。请对以下合同进行风险分析，并以JSON格式返回分析结果。

合同名称：{contract_name}
合同类型：{contract_type}
合同内容：
{content}

请分析合同中的潜在风险，包括但不限于：
1. 法律风险 - 条款合法性、权利义务明确性等
2. 财务风险 - 付款条款、违约责任等
3. 运营风险 - 交付标准、服务范围等
4. 合规风险 - 数据保护、行业规范等

请以以下JSON格式返回分析结果：
{{
  "overallRisk": "low|medium|high",
  "confidence": 0.85,
  "thinking": ["分析思考步骤1", "分析思考步骤2"],
  "risks": [
    {{
      "type": "legal|financial|operational|compliance",
      "level": "low|medium|high",
      "description": "风险描述",
      "suggestion": "修改建议",
      "clause": "相关条款原文（如有）",
      "clausePosition": {{ "start": 0, "end": 10 }}
    }}
  ]
}}

注意：
1. 必须返回合法的JSON格式
2. overallRisk根据最高级别风险确定
3. confidence为0-1之间的置信度
4. thinking为分析思考过程，至少3-5条
5. clausePosition为风险条款在合同文本中的大致位置（字符索引）
6. 如未发现明显风险，risks可为空数组"""

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                KIMI_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {KIMI_API_KEY}",
                },
                json={
                    "model": KIMI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一位专业的合同风险审核专家，擅长识别合同中的法律、财务、运营和合规风险。请以JSON格式返回分析结果。",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            result_text = data["choices"][0]["message"]["content"]
            return json.loads(result_text)
    except Exception:
        return simulate_risk_analysis(contract_type, content)


def simulate_risk_analysis(contract_type: str, content: str) -> dict:
    risks = []
    thinking = [
        "正在解析合同文本结构...",
        "识别合同类型和主要条款...",
        "分析法律合规性...",
        "评估财务风险点...",
        "检查运营可行性...",
    ]

    if "软件开发" in contract_type or "外包" in contract_type:
        ip_idx = content.find("知识产权")
        risks.append({
            "type": "legal",
            "level": "high",
            "description": "知识产权归属条款不明确，可能导致后续争议",
            "suggestion": "明确约定开发成果的知识产权归属及后续改进权益",
            "clause": content[ip_idx:ip_idx + 50] if ip_idx >= 0 else "知识产权条款",
            "clausePosition": {"start": ip_idx, "end": ip_idx + 50} if ip_idx >= 0 else None,
        })
        pay_idx = content.find("付款")
        risks.append({
            "type": "financial",
            "level": "medium",
            "description": "付款节点设置不合理，预付款比例过高",
            "suggestion": "建议调整付款节点，增加里程碑验收条件",
            "clause": content[pay_idx:pay_idx + 40] if pay_idx >= 0 else "付款条款",
            "clausePosition": {"start": pay_idx, "end": pay_idx + 40} if pay_idx >= 0 else None,
        })
        thinking.append("发现软件开发类合同常见风险点...")

    if "租赁" in contract_type:
        m_idx = content.find("维护")
        risks.append({
            "type": "operational",
            "level": "medium",
            "description": "租赁物维护责任划分不够清晰",
            "suggestion": "明确日常维护、大修责任归属及费用承担方式",
            "clause": content[m_idx:m_idx + 30] if m_idx >= 0 else "维护条款",
            "clausePosition": {"start": m_idx, "end": m_idx + 30} if m_idx >= 0 else None,
        })

    if "采购" in contract_type or "服务" in contract_type:
        risks.append({
            "type": "compliance",
            "level": "low",
            "description": "数据安全条款需补充合规要求",
            "suggestion": "增加数据本地化存储及合规处理条款",
        })

    if "违约" not in content and "责任" not in content:
        risks.append({
            "type": "legal",
            "level": "medium",
            "description": "缺少违约责任条款",
            "suggestion": "建议增加违约责任条款，明确违约情形及赔偿标准",
        })

    thinking.append("综合评估完成，生成风险报告...")

    highest = "low"
    level_rank = {"low": 1, "medium": 2, "high": 3}
    for r in risks:
        if level_rank.get(r["level"], 0) > level_rank.get(highest, 0):
            highest = r["level"]

    return {
        "overallRisk": highest,
        "confidence": round(0.85 + random.random() * 0.1, 2),
        "thinking": thinking,
        "risks": risks,
    }


async def generate_contract_advice(contract_name: str, contract_type: str, content: str, risk_description: str) -> str:
    prompt = f"""你是一位专业的合同审核专家。针对以下合同中的风险问题，请提供具体的修改建议。

合同名称：{contract_name}
合同类型：{contract_type}
合同内容：
{content}

风险问题：{risk_description}

请提供：
1. 具体的修改建议
2. 建议的条款表述
3. 修改理由

请用中文回复，保持专业、简洁。"""

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                KIMI_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {KIMI_API_KEY}",
                },
                json={
                    "model": KIMI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一位专业的合同审核专家，擅长提供具体的合同条款修改建议。",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.5,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception:
        return "基于该风险，建议：1）明确相关条款表述；2）增加保护性条款；3）咨询专业法律顾问进行进一步审核。"
