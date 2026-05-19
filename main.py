import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from url_analyzer import analyze_urls
from scorer import calculate_score

load_dotenv()

app = FastAPI(title="AI 피싱 메일 탐지 API (발표 시연용)")

# 프론트엔드 연동을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MailAnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_email(request: MailAnalyzeRequest):
    body_text = request.text
    
    if not body_text.strip():
        raise HTTPException(status_code=400, detail="이메일 본문이 비어있습니다.")

    # 1단계: 룰베이스 및 URL 분석 엔진
    u_res = analyze_urls(body_text)
    k_res = calculate_score(body_text)

    rule_total = u_res["total_url_score"] + k_res["score"]
    rule_final = min(rule_total, 60)

    rule_evidence = []
    for u in u_res["urls"]:
        rule_evidence.extend(u.get("reasons", []))
    rule_evidence = list(set(rule_evidence + k_res["threats"])) # 중복 제거
    
    # Early Exit : 안전한 메일일 경우 분기 처리
    suspicious_keywords = ["즉시", "비밀번호", "인증", "정지", "차단", "만료"]
    is_keyword_safe = not any(kw in body_text for kw in suspicious_keywords)
    
    if u_res["total_url_score"] == 0 and is_keyword_safe:
        return {
            "score": 0,
            "grade": "안전",
            "threats": [],
            "urls": [],
            "highlight_sentences": []
        }

    # 2단계: GPT 엔진 대신 발표용 Mock 데이터 사용 (에러 방지 및 과금 방지)
    gpt_res = {
        "score": 85,
        "reasons": ["본문에서 사용자의 개인정보(비밀번호) 입력을 유도함", "24시간 내에 계정이 정지된다며 긴급성을 조성함"],
        "highlight_sentences": ["24시간 이내에 아래 링크를 통해 비밀번호를 변경하지 않으면 계정이 영구 정지됩니다."]
    }

    gpt_score = gpt_res.get("score", 0)
    llm_weighted_score = min(gpt_score * 0.4, 40)

    # 3단계: 결과 통합 및 최종 점수/등급 산출
    final_score = int(rule_final + llm_weighted_score)
    total_threats = list(set(gpt_res.get("reasons", []) + rule_evidence))
    
    if final_score >= 70:
        grade = "위험"
    elif final_score >= 40:
        grade = "주의"
    else:
        grade = "안전"

    return {
        "score": final_score,
        "grade": grade,
        "threats": total_threats,
        "urls": [u["url"] for u in u_res["urls"] if u.get("score", 0) > 0],
        "highlight_sentences": gpt_res.get("highlight_sentences", [])
    }