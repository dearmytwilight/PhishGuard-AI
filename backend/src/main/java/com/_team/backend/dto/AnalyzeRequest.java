package com._team.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnalyzeRequest {
    @NotBlank(message = "이메일 본문은 필수입니다.")
    private String emailBody;
}