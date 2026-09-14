package com.crisisweave.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AgentAssessment {
    private String agentName;
    private String domain;
    private String status = "ACTIVE";
    private List<String> predictions = new ArrayList<>();
    private double confidenceScore;
    private List<RecommendedAction> recommendedActions = new ArrayList<>();
    private List<CascadeRisk> cascadeRisks = new ArrayList<>();
    private long estimatedAffectedPeople;
    private int goldenHourMinutes;
    private LocalDateTime dataTimestamp = LocalDateTime.now();

    public AgentAssessment() {}

    public AgentAssessment(String agentName, String domain, String status, List<String> predictions, double confidenceScore, List<RecommendedAction> recommendedActions, List<CascadeRisk> cascadeRisks, long estimatedAffectedPeople, int goldenHourMinutes, LocalDateTime dataTimestamp) {
        this.agentName = agentName;
        this.domain = domain;
        if (status != null) this.status = status;
        if (predictions != null) this.predictions = predictions;
        this.confidenceScore = confidenceScore;
        setRecommendedActions(recommendedActions);
        setCascadeRisks(cascadeRisks);
        this.estimatedAffectedPeople = estimatedAffectedPeople;
        this.goldenHourMinutes = goldenHourMinutes;
        if (dataTimestamp != null) this.dataTimestamp = dataTimestamp;
    }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getPredictions() { return predictions; }
    public void setPredictions(List<String> predictions) { this.predictions = predictions; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public List<RecommendedAction> getRecommendedActions() { return recommendedActions; }
    
    @SuppressWarnings("unchecked")
    public void setRecommendedActions(List<?> actions) {
        if (actions == null) {
            this.recommendedActions = new ArrayList<>();
            return;
        }
        List<RecommendedAction> result = new ArrayList<>();
        for (Object obj : actions) {
            if (obj instanceof RecommendedAction) {
                result.add((RecommendedAction) obj);
            } else if (obj instanceof String) {
                result.add(new RecommendedAction((String) obj, this.domain != null ? this.domain : "General"));
            }
        }
        this.recommendedActions = result;
    }

    public List<CascadeRisk> getCascadeRisks() { return cascadeRisks; }
    
    @SuppressWarnings("unchecked")
    public void setCascadeRisks(List<?> risks) {
        if (risks == null) {
            this.cascadeRisks = new ArrayList<>();
            return;
        }
        List<CascadeRisk> result = new ArrayList<>();
        for (Object obj : risks) {
            if (obj instanceof CascadeRisk) {
                result.add((CascadeRisk) obj);
            } else if (obj instanceof String) {
                result.add(new CascadeRisk((String) obj, 75));
            }
        }
        this.cascadeRisks = result;
    }

    public long getEstimatedAffectedPeople() { return estimatedAffectedPeople; }
    public void setEstimatedAffectedPeople(long estimatedAffectedPeople) { this.estimatedAffectedPeople = estimatedAffectedPeople; }

    public int getGoldenHourMinutes() { return goldenHourMinutes; }
    public void setGoldenHourMinutes(int goldenHourMinutes) { this.goldenHourMinutes = goldenHourMinutes; }

    public LocalDateTime getDataTimestamp() { return dataTimestamp; }
    public void setDataTimestamp(LocalDateTime dataTimestamp) { this.dataTimestamp = dataTimestamp; }

    public static AgentAssessmentBuilder builder() {
        return new AgentAssessmentBuilder();
    }

    public static class AgentAssessmentBuilder {
        private String agentName;
        private String domain;
        private String status = "ACTIVE";
        private List<String> predictions = new ArrayList<>();
        private double confidenceScore;
        private List<RecommendedAction> recommendedActions = new ArrayList<>();
        private List<CascadeRisk> cascadeRisks = new ArrayList<>();
        private long estimatedAffectedPeople;
        private int goldenHourMinutes;
        private LocalDateTime dataTimestamp = LocalDateTime.now();

        public AgentAssessmentBuilder agentName(String agentName) { this.agentName = agentName; return this; }
        public AgentAssessmentBuilder domain(String domain) { this.domain = domain; return this; }
        public AgentAssessmentBuilder status(String status) { this.status = status; return this; }
        public AgentAssessmentBuilder predictions(List<String> predictions) { this.predictions = predictions; return this; }
        public AgentAssessmentBuilder confidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        
        @SuppressWarnings("unchecked")
        public AgentAssessmentBuilder recommendedActions(List<?> actions) {
            if (actions != null) {
                List<RecommendedAction> result = new ArrayList<>();
                for (Object obj : actions) {
                    if (obj instanceof RecommendedAction) {
                        result.add((RecommendedAction) obj);
                    } else if (obj instanceof String) {
                        result.add(new RecommendedAction((String) obj, this.domain != null ? this.domain : "General"));
                    }
                }
                this.recommendedActions = result;
            }
            return this;
        }

        @SuppressWarnings("unchecked")
        public AgentAssessmentBuilder cascadeRisks(List<?> risks) {
            if (risks != null) {
                List<CascadeRisk> result = new ArrayList<>();
                for (Object obj : risks) {
                    if (obj instanceof CascadeRisk) {
                        result.add((CascadeRisk) obj);
                    } else if (obj instanceof String) {
                        result.add(new CascadeRisk((String) obj, 75));
                    }
                }
                this.cascadeRisks = result;
            }
            return this;
        }

        public AgentAssessmentBuilder estimatedAffectedPeople(long estimatedAffectedPeople) { this.estimatedAffectedPeople = estimatedAffectedPeople; return this; }
        public AgentAssessmentBuilder goldenHourMinutes(int goldenHourMinutes) { this.goldenHourMinutes = goldenHourMinutes; return this; }
        public AgentAssessmentBuilder dataTimestamp(LocalDateTime dataTimestamp) { this.dataTimestamp = dataTimestamp; return this; }

        public AgentAssessment build() {
            return new AgentAssessment(agentName, domain, status, predictions, confidenceScore, recommendedActions, cascadeRisks, estimatedAffectedPeople, goldenHourMinutes, dataTimestamp);
        }
    }
}
