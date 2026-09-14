package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class UtilitiesAgent extends BaseAgent {
    
    public UtilitiesAgent() {
        this.agentName = "UtilitiesAgent";
        this.domain = "Infrastructure & Utilities";
        this.description = "Monitors power, water, gas, and telecommunications networks.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("EARTHQUAKE") || type.name().equals("HURRICANE") || type.name().equals("TORNADO") || type.name().equals("FLOOD") || type.name().equals("CYBER_ATTACK");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Widespread power outages expected to last 3-5 days.",
            "Cellular network congestion leading to communication dropouts."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Failure of backup generators at critical facilities.",
            "Gas main ruptures causing localized fires."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Shut off main gas lines in affected quadrants.",
            "Prioritize power restoration to hospitals and emergency centers.",
            "Deploy temporary cell towers (COWs) to restore comms."
        ));
        
        assessment.setConfidenceScore(0.91);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 800));
        assessment.setGoldenHourMinutes(90);
        
        return assessment;
    }
}
