package com.crisisweave.model;

public class CascadeRisk {
    private String serviceAffected;
    private int probabilityPercent;

    public CascadeRisk() {}

    public CascadeRisk(String serviceAffected, int probabilityPercent) {
        this.serviceAffected = serviceAffected;
        this.probabilityPercent = probabilityPercent;
    }

    public String getServiceAffected() { return serviceAffected; }
    public void setServiceAffected(String serviceAffected) { this.serviceAffected = serviceAffected; }

    public int getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(int probabilityPercent) { this.probabilityPercent = probabilityPercent; }

    public static CascadeRiskBuilder builder() {
        return new CascadeRiskBuilder();
    }

    public static class CascadeRiskBuilder {
        private String serviceAffected;
        private int probabilityPercent;

        public CascadeRiskBuilder serviceAffected(String serviceAffected) { this.serviceAffected = serviceAffected; return this; }
        public CascadeRiskBuilder probabilityPercent(int probabilityPercent) { this.probabilityPercent = probabilityPercent; return this; }

        public CascadeRisk build() {
            return new CascadeRisk(serviceAffected, probabilityPercent);
        }
    }
}
