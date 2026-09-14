package com.crisisweave.model;

public class RecommendedAction {
    private String id;
    private String text;
    private String urgency;
    private String domain;

    public RecommendedAction() {}

    public RecommendedAction(String id, String text, String urgency, String domain) {
        this.id = id;
        this.text = text;
        this.urgency = urgency;
        this.domain = domain;
    }

    public RecommendedAction(String text, String domain) {
        this.id = "act-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        this.text = text;
        this.urgency = "IMMEDIATE";
        this.domain = domain;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public static RecommendedActionBuilder builder() {
        return new RecommendedActionBuilder();
    }

    public static class RecommendedActionBuilder {
        private String id;
        private String text;
        private String urgency = "IMMEDIATE";
        private String domain = "General";

        public RecommendedActionBuilder id(String id) { this.id = id; return this; }
        public RecommendedActionBuilder text(String text) { this.text = text; return this; }
        public RecommendedActionBuilder urgency(String urgency) { this.urgency = urgency; return this; }
        public RecommendedActionBuilder domain(String domain) { this.domain = domain; return this; }

        public RecommendedAction build() {
            if (id == null) id = "act-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
            return new RecommendedAction(id, text, urgency, domain);
        }
    }
}
