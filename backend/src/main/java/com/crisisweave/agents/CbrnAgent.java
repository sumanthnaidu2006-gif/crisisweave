package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class CbrnAgent extends BaseAgent {
    
    public CbrnAgent() {
        this.agentName = "CbrnAgent";
        this.domain = "Chemical, Biological, Radiological, Nuclear";
        this.description = "Specializes in chemical spills, biological outbreaks, and hazmat scenarios.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("CHEMICAL_LEAK") || type.name().equals("BIOLOGICAL_HAZARD") || type.name().equals("INDUSTRIAL_ACCIDENT");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Toxic gas cloud expanding based on current wind vectors.",
            "Potential for ground water seepage if not contained."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Acute respiratory distress in exposed populations.",
            "Supply chain disruption due to quarantine measures."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Deploy Hazmat units for immediate containment.",
            "Establish decontamination corridors at perimeter.",
            "Issue immediate shelter-in-place with HVAC systems disabled."
        ));
        
        assessment.setConfidenceScore(0.89);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 300));
        assessment.setGoldenHourMinutes(45);
        
        return assessment;
    }
}
