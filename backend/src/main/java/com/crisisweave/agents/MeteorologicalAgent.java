package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class MeteorologicalAgent extends BaseAgent {
    
    public MeteorologicalAgent() {
        this.agentName = "MeteorologicalAgent";
        this.domain = "Meteorology & Weather";
        this.description = "Assesses weather-related disasters and extreme atmospheric conditions.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("HURRICANE") || type.name().equals("TORNADO") || type.name().equals("BLIZZARD") || type.name().equals("WILDFIRE") || type.name().equals("DROUGHT");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Storm path expected to impact coastal areas within 48 hours.",
            "Wind speeds may exceed 150 km/h in localized zones."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Power grid failure due to high winds.",
            "Flash flooding from heavy rainfall."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Issue severe weather warnings across all media channels.",
            "Prepare utility crews for widespread power restoration.",
            "Secure loose structures in high-risk zones."
        ));
        
        assessment.setConfidenceScore(0.85);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 200));
        assessment.setGoldenHourMinutes(120);
        
        return assessment;
    }
}
