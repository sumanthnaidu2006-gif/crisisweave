package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class RadiationAgent extends BaseAgent {
    
    public RadiationAgent() {
        this.agentName = "RadiationAgent";
        this.domain = "Nuclear & Radiation";
        this.description = "Monitors and assesses radiological hazards and nuclear incidents.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("NUCLEAR_ACCIDENT") || type.name().equals("RADIOLOGICAL_HAZARD");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Radioactive plume spreading NW at 45km/h.",
            "High levels of Iodine-131 projected downwind."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Long-term agricultural contamination.",
            "Mass panic and chaotic self-evacuation."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "30km exclusion zone required immediately.",
            "Distribute Potassium Iodide (KI) tablets to affected populations.",
            "Enforce shelter-in-place for outer perimeter zones."
        ));
        
        assessment.setConfidenceScore(0.88);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 1000));
        assessment.setGoldenHourMinutes(30);
        
        return assessment;
    }
}
