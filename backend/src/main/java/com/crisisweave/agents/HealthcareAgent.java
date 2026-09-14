package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class HealthcareAgent extends BaseAgent {
    
    public HealthcareAgent() {
        this.agentName = "HealthcareAgent";
        this.domain = "Medical & Healthcare";
        this.description = "Assesses medical infrastructure strain and public health impacts.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return true; 
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Local trauma centers will reach capacity within 4 hours.",
            "Shortage of critical medical supplies (blood, oxygen) likely."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Secondary infections due to lack of sanitation.",
            "Burnout and exhaustion of medical personnel."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Activate emergency triage protocols.",
            "Deploy mobile field hospitals to the disaster perimeter.",
            "Request mutual aid for medical personnel and supplies."
        ));
        
        assessment.setConfidenceScore(0.90);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 400));
        assessment.setGoldenHourMinutes(60);
        
        return assessment;
    }
}
