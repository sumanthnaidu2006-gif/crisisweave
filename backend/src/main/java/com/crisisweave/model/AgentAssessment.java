package com.crisisweave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAssessment {
    private String agentName;
    private String domain;
    private String status;
    private List<String> predictions;
    private double confidenceScore;
    private List<String> recommendedActions;
    private List<String> cascadeRisks;
    private long estimatedAffectedPeople;
    private int goldenHourMinutes;
    private LocalDateTime dataTimestamp;
}
