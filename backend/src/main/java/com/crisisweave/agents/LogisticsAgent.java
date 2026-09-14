package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class LogisticsAgent extends BaseAgent {
    
    public LogisticsAgent() {
        this.agentName = "LogisticsAgent";
        this.domain = "Supply Chain & Logistics";
        this.description = "Manages flow of resources, relief supplies, and equipment.";
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
            "Last-mile delivery routes compromised due to debris.",
            "Surge in demand for MREs, bottled water, and blankets."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Spoilage of refrigerated medical supplies.",
            "Looting of unescorted supply convoys."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Establish centralized staging areas outside the hot zone.",
            "Coordinate with military/National Guard for supply escort.",
            "Utilize drone delivery for isolated pockets of survivors."
        ));
        
        assessment.setConfidenceScore(0.87);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 250));
        assessment.setGoldenHourMinutes(240);
        
        return assessment;
    }
}
