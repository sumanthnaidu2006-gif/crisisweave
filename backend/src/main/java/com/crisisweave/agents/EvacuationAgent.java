package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class EvacuationAgent extends BaseAgent {
    
    public EvacuationAgent() {
        this.agentName = "EvacuationAgent";
        this.domain = "Evacuation & Population Movement";
        this.description = "Plans and assesses mass evacuation routes and logistics.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("HURRICANE") || type.name().equals("TSUNAMI") || type.name().equals("WILDFIRE") || type.name().equals("NUCLEAR_ACCIDENT") || type.name().equals("CHEMICAL_LEAK");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Major highways will experience gridlock within 2 hours of order.",
            "Vulnerable populations will require specialized transport."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Fuel shortages along primary evacuation routes.",
            "Panic-induced accidents bottlenecking key choke points."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Implement contraflow lane reversal on major arteries.",
            "Dispatch public transit buses for vulnerable population extraction.",
            "Establish rest and refueling waypoints."
        ));
        
        assessment.setConfidenceScore(0.85);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 600));
        assessment.setGoldenHourMinutes(120);
        
        return assessment;
    }
}
