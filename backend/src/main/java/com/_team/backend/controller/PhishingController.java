package com._team.backend.controller;

import com._team.backend.dto.AnalyzeRequest;
import com._team.backend.dto.AnalyzeResponse;
import com._team.backend.service.PhishingAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PhishingController {

    private final PhishingAnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyzeEmail(@RequestBody AnalyzeRequest request) {
        AnalyzeResponse result = analysisService.analyzeEmail(request);
        return ResponseEntity.ok(result);
    }
}