package com.crisisweave.agents;

import com.crisisweave.model.*;

public abstract class BaseAgent {
    protected String agentName;
    protected String domain;
    protected String description;

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public abstract AgentAssessment assess(DisasterEvent event);
    public abstract boolean isRelevantFor(DisasterType type);
}
