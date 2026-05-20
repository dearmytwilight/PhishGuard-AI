package com._team.backend.service;

import com._team.backend.dto.AnalyzeRequest;
import com._team.backend.dto.AnalyzeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhishingAnalysisService {

    private final RestClient restClient;
    private static final String AI_SERVER_URL = "http://localhost:8000/analyze";

    public record FastApiResponse(
            int score,
            String grade,
            List<String> threats,
            List<String> urls,
            List<String> highlight_sentences) {
    }

    public AnalyzeResponse analyzeEmail(AnalyzeRequest request) {
        String body = request.getEmailBody();

        try {
            log.info("도윤님 AI 서버로 분석 위임 중...");

            FastApiResponse aiResponse = restClient.post()
                    .uri(AI_SERVER_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("text", body))
                    .retrieve()
                    .body(FastApiResponse.class);

            if (aiResponse != null) {
                List<AnalyzeResponse.ThreatElement> formattedThreats = new ArrayList<>();

                if (aiResponse.threats() != null) {
                    for (String t : aiResponse.threats()) {
                        formattedThreats.add(AnalyzeResponse.ThreatElement.builder()
                                .content(t)
                                .type("AI 탐지 위협")
                                .build());
                    }
                }

                // grade 값이 안 오면 기본값으로 "낮음" 세팅
                String finalRiskLevel = aiResponse.grade() != null ? aiResponse.grade() : "낮음";

                log.info("AI 서버 분석 성공! 점수: {}", aiResponse.score());

                return AnalyzeResponse.builder()
                        .totalScore(aiResponse.score())
                        .riskLevel(finalRiskLevel)
                        .threats(formattedThreats)
                        .build();
            }

        } catch (Exception e) {
            log.error("AI 서버 통신 실패: {}", e.getMessage());
        }

        // 서버 연결 실패 시 안전망 반환
        return AnalyzeResponse.builder()
                .totalScore(0)
                .riskLevel("서버 연결 실패")
                .threats(new ArrayList<>())
                .build();
    }
}