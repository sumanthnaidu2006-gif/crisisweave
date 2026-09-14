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
public class SimulationResult {
    private DisasterEvent event;
    private List<AgentAssessment> agentAssessments;
    private String overallRiskLevel;
    private List<CascadeEvent> cascadeTimeline;
    private List<String> topActions;
    private String historicalComparison;
    private String publicAlert;
    private long estimatedTotalAffected;
    private LocalDateTime simulationTimestamp;
    private double prismConfidence;
}
