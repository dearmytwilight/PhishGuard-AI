package com._team.backend.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class AnalyzeResponse {
    private int totalScore; // 위험도 점수 (0~100)
    private String riskLevel; // 낮음(초록), 주의(노랑), 위험(빨강)
    private List<ThreatElement> threats; // 탐지된 위협 요소 목록 (키워드, 문구, URL 통합)

    @Getter
    @Builder
    public static class ThreatElement {
        private String content; // 예: "즉시 본인인증 하세요", "http://naver-login.xyz"
        private String type; // 예: "긴급성 표현", "위험 키워드", "URL 포함"
    }
}