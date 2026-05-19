from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI()

class AnalyzeRequest(BaseModel):
    emailText: str

@app.get("/")
def root():
    return {"message": "Phishing Mail AI Backend is running"}

@app.post("/analyze")
def analyze_email(request: AnalyzeRequest):
    text = request.emailText
    score = 0
    threats = []

    if "비밀번호" in text or "인증번호" in text or "개인정보" in text:
        score += 20
        threats.append({
            "type": "개인정보 요구",
            "text": "개인정보 관련 문구 발견",
            "score": 20
        })

    if "즉시" in text or "긴급" in text or "오늘까지" in text or "24시간" in text:
        score += 15
        threats.append({
            "type": "긴급성 표현",
            "text": "긴급성 표현 발견",
            "score": 15
        })

    urls = re.findall(r"https?://[^\s]+", text)
    if urls:
        score += 10
        for url in urls:
            threats.append({
                "type": "URL 포함",
                "text": url,
                "score": 10
            })

    if score <= 30:
        risk_level = "낮음"
    elif score <= 60:
        risk_level = "주의"
    else:
        risk_level = "위험"

    return {
        "riskScore": min(score, 100),
        "riskLevel": risk_level,
        "detectedThreats": threats,
        "urls": urls
    }
