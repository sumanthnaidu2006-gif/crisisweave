package com.crisisweave.agents;

import com.crisisweave.model.*;
import lombok.Data;

@Data
public abstract class BaseAgent {
    protected String agentName;
    protected String domain;
    protected String description;

    public abstract AgentAssessment assess(DisasterEvent event);
    public abstract boolean isRelevantFor(DisasterType type);
}
