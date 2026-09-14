package com.crisisweave.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class SimulationResult {
    private String id;
    private DisasterEvent event;
    
    @JsonProperty("agents")
    private List<AgentAssessment> agentAssessments = new ArrayList<>();
    
    private List<CascadeEvent> cascadeTimeline = new ArrayList<>();
    
    private List<RecommendedAction> topActions = new ArrayList<>();
    
    @JsonProperty("publicAlertText")
    private String publicAlert;
    
    private String historicalComparison;
    
    private String createdAt;
    
    private LocalDateTime simulationTimestamp = LocalDateTime.now();
    
    private String overallRiskLevel;
    
    private long estimatedTotalAffected;
    
    private double prismConfidence = 0.90;

    public SimulationResult() {}

    public SimulationResult(String id, DisasterEvent event, List<AgentAssessment> agentAssessments, List<CascadeEvent> cascadeTimeline, List<RecommendedAction> topActions, String publicAlert, String historicalComparison, String createdAt, LocalDateTime simulationTimestamp, String overallRiskLevel, long estimatedTotalAffected, double prismConfidence) {
        this.id = id;
        this.event = event;
        if (agentAssessments != null) this.agentAssessments = agentAssessments;
        if (cascadeTimeline != null) this.cascadeTimeline = cascadeTimeline;
        setTopActions(topActions);
        this.publicAlert = publicAlert;
        this.historicalComparison = historicalComparison;
        this.createdAt = createdAt;
        if (simulationTimestamp != null) this.simulationTimestamp = simulationTimestamp;
        this.overallRiskLevel = overallRiskLevel;
        this.estimatedTotalAffected = estimatedTotalAffected;
        this.prismConfidence = prismConfidence;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DisasterEvent getEvent() { return event; }
    public void setEvent(DisasterEvent event) { this.event = event; }

    @JsonProperty("agents")
    public List<AgentAssessment> getAgentAssessments() { return agentAssessments; }
    public void setAgentAssessments(List<AgentAssessment> agentAssessments) { this.agentAssessments = agentAssessments; }

    public List<CascadeEvent> getCascadeTimeline() { return cascadeTimeline; }
    public void setCascadeTimeline(List<CascadeEvent> cascadeTimeline) { this.cascadeTimeline = cascadeTimeline; }

    public List<RecommendedAction> getTopActions() { return topActions; }
    
    @SuppressWarnings("unchecked")
    public void setTopActions(List<?> actions) {
        if (actions == null) {
            this.topActions = new ArrayList<>();
            return;
        }
        List<RecommendedAction> result = new ArrayList<>();
        for (Object obj : actions) {
            if (obj instanceof RecommendedAction) {
                result.add((RecommendedAction) obj);
            } else if (obj instanceof String) {
                result.add(new RecommendedAction((String) obj, "Command Center"));
            }
        }
        this.topActions = result;
    }

    @JsonProperty("publicAlertText")
    public String getPublicAlert() { return publicAlert; }
    public void setPublicAlert(String publicAlert) { this.publicAlert = publicAlert; }

    public String getHistoricalComparison() { return historicalComparison; }
    public void setHistoricalComparison(String historicalComparison) { this.historicalComparison = historicalComparison; }

    public String getCreatedAt() {
        if (createdAt != null) return createdAt;
        if (simulationTimestamp != null) return simulationTimestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSimulationTimestamp() { return simulationTimestamp; }
    public void setSimulationTimestamp(LocalDateTime simulationTimestamp) { this.simulationTimestamp = simulationTimestamp; }

    public String getOverallRiskLevel() { return overallRiskLevel; }
    public void setOverallRiskLevel(String overallRiskLevel) { this.overallRiskLevel = overallRiskLevel; }

    public long getEstimatedTotalAffected() { return estimatedTotalAffected; }
    public void setEstimatedTotalAffected(long estimatedTotalAffected) { this.estimatedTotalAffected = estimatedTotalAffected; }

    public double getPrismConfidence() { return prismConfidence; }
    public void setPrismConfidence(double prismConfidence) { this.prismConfidence = prismConfidence; }

    public static SimulationResultBuilder builder() {
        return new SimulationResultBuilder();
    }

    public static class SimulationResultBuilder {
        private String id;
        private DisasterEvent event;
        private List<AgentAssessment> agentAssessments = new ArrayList<>();
        private List<CascadeEvent> cascadeTimeline = new ArrayList<>();
        private List<RecommendedAction> topActions = new ArrayList<>();
        private String publicAlert;
        private String historicalComparison;
        private String createdAt;
        private LocalDateTime simulationTimestamp = LocalDateTime.now();
        private String overallRiskLevel;
        private long estimatedTotalAffected;
        private double prismConfidence = 0.90;

        public SimulationResultBuilder id(String id) { this.id = id; return this; }
        public SimulationResultBuilder event(DisasterEvent event) { this.event = event; return this; }
        public SimulationResultBuilder agentAssessments(List<AgentAssessment> agentAssessments) { if (agentAssessments != null) this.agentAssessments = agentAssessments; return this; }
        public SimulationResultBuilder cascadeTimeline(List<CascadeEvent> cascadeTimeline) { if (cascadeTimeline != null) this.cascadeTimeline = cascadeTimeline; return this; }
        
        @SuppressWarnings("unchecked")
        public SimulationResultBuilder topActions(List<?> actions) {
            if (actions != null) {
                List<RecommendedAction> result = new ArrayList<>();
                for (Object obj : actions) {
                    if (obj instanceof RecommendedAction) {
                        result.add((RecommendedAction) obj);
                    } else if (obj instanceof String) {
                        result.add(new RecommendedAction((String) obj, "Command Center"));
                    }
                }
                this.topActions = result;
            }
            return this;
        }

        public SimulationResultBuilder publicAlert(String publicAlert) { this.publicAlert = publicAlert; return this; }
        public SimulationResultBuilder historicalComparison(String historicalComparison) { this.historicalComparison = historicalComparison; return this; }
        public SimulationResultBuilder createdAt(String createdAt) { this.createdAt = createdAt; return this; }
        public SimulationResultBuilder simulationTimestamp(LocalDateTime simulationTimestamp) { this.simulationTimestamp = simulationTimestamp; return this; }
        public SimulationResultBuilder overallRiskLevel(String overallRiskLevel) { this.overallRiskLevel = overallRiskLevel; return this; }
        public SimulationResultBuilder estimatedTotalAffected(long estimatedTotalAffected) { this.estimatedTotalAffected = estimatedTotalAffected; return this; }
        public SimulationResultBuilder prismConfidence(double prismConfidence) { this.prismConfidence = prismConfidence; return this; }

        public SimulationResult build() {
            return new SimulationResult(id, event, agentAssessments, cascadeTimeline, topActions, publicAlert, historicalComparison, createdAt, simulationTimestamp, overallRiskLevel, estimatedTotalAffected, prismConfidence);
        }
    }
}
