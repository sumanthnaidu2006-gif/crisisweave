package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class EarlyWarningAgent extends BaseAgent {
    
    public EarlyWarningAgent() {
        this.agentName = "EarlyWarningAgent";
        this.domain = "Detection & Early Warning";
        this.description = "Provides initial detection and alerts for rapid onset disasters.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("EARTHQUAKE") || type.name().equals("TSUNAMI") || type.name().equals("TORNADO");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Initial impact imminent within minutes.",
            "Secondary events (aftershocks, secondary waves) highly probable."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Failure of automated warning sirens.",
            "Public confusion or normalization bias delaying response."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Trigger automated SMS and broadcast emergency alerts.",
            "Initiate automated shutdown of critical transit systems.",
            "Activate 'Drop, Cover, and Hold On' public messaging."
        ));
        
        assessment.setConfidenceScore(0.95);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 1200));
        assessment.setGoldenHourMinutes(15);
        
        return assessment;
    }
}
