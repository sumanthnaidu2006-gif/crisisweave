package com.crisisweave.model;

public class CascadeEvent {
    private int hourOffset;
    private String serviceAffected;
    private String impactDescription;
    private int severity;
    private int probabilityPercent;
    private String recommendedAction;

    public CascadeEvent() {}

    public CascadeEvent(int hourOffset, String serviceAffected, String impactDescription, int severity, int probabilityPercent, String recommendedAction) {
        this.hourOffset = hourOffset;
        this.serviceAffected = serviceAffected;
        this.impactDescription = impactDescription;
        this.severity = severity;
        this.probabilityPercent = probabilityPercent;
        this.recommendedAction = recommendedAction;
    }

    public int getHourOffset() { return hourOffset; }
    public void setHourOffset(int hourOffset) { this.hourOffset = hourOffset; }

    public String getServiceAffected() { return serviceAffected; }
    public void setServiceAffected(String serviceAffected) { this.serviceAffected = serviceAffected; }

    public String getImpactDescription() { return impactDescription; }
    public void setImpactDescription(String impactDescription) { this.impactDescription = impactDescription; }

    public int getSeverity() { return severity; }
    public void setSeverity(int severity) { this.severity = severity; }
    public void setSeverity(String severityStr) { this.severity = parseSeverityStr(severityStr); }

    public int getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(int probabilityPercent) { this.probabilityPercent = probabilityPercent; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    private static int parseSeverityStr(String str) {
        if (str == null) return 3;
        switch (str.toUpperCase()) {
            case "CATASTROPHIC":
            case "CRITICAL": return 5;
            case "HIGH": return 4;
            case "MODERATE": return 3;
            case "LOW": return 2;
            default:
                try {
                    return Integer.parseInt(str);
                } catch (NumberFormatException e) {
                    return 3;
                }
        }
    }

    public static CascadeEventBuilder builder() {
        return new CascadeEventBuilder();
    }

    public static class CascadeEventBuilder {
        private int hourOffset;
        private String serviceAffected;
        private String impactDescription;
        private int severity = 3;
        private int probabilityPercent;
        private String recommendedAction;

        public CascadeEventBuilder hourOffset(int hourOffset) { this.hourOffset = hourOffset; return this; }
        public CascadeEventBuilder serviceAffected(String serviceAffected) { this.serviceAffected = serviceAffected; return this; }
        public CascadeEventBuilder impactDescription(String impactDescription) { this.impactDescription = impactDescription; return this; }
        public CascadeEventBuilder severity(String severityStr) { this.severity = parseSeverityStr(severityStr); return this; }
        public CascadeEventBuilder severity(int severityInt) { this.severity = severityInt; return this; }
        public CascadeEventBuilder probabilityPercent(int probabilityPercent) { this.probabilityPercent = probabilityPercent; return this; }
        public CascadeEventBuilder recommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; return this; }

        public CascadeEvent build() {
            return new CascadeEvent(hourOffset, serviceAffected, impactDescription, severity, probabilityPercent, recommendedAction);
        }
    }
}
