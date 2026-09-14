package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class InternationalAgent extends BaseAgent {
    
    public InternationalAgent() {
        this.agentName = "InternationalAgent";
        this.domain = "International Aid & Diplomacy";
        this.description = "Coordinates foreign aid, international NGOs, and cross-border impacts.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("EARTHQUAKE") || type.name().equals("TSUNAMI") || type.name().equals("NUCLEAR_ACCIDENT") || type.name().equals("PANDEMIC");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "International aid requests will exceed local processing capacity.",
            "Cross-border refugee movement anticipated."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Diplomatic friction over resource allocation.",
            "Uncoordinated NGO efforts leading to duplication of services."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Activate UN cluster approach for aid coordination.",
            "Expedite customs clearance for international search and rescue teams.",
            "Establish joint border reception centers."
        ));
        
        assessment.setConfidenceScore(0.80);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 100));
        assessment.setGoldenHourMinutes(360);
        
        return assessment;
    }
}
