package com.crisisweave.agents;

import com.crisisweave.model.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class HydrologyAgent extends BaseAgent {
    
    public HydrologyAgent() {
        this.agentName = "HydrologyAgent";
        this.domain = "Hydrology & Water Systems";
        this.description = "Assesses water-related disasters such as floods and tsunamis.";
    }

    @Override
    public boolean isRelevantFor(DisasterType type) {
        return type.name().equals("FLOOD") || type.name().equals("TSUNAMI") || type.name().equals("MUDSLIDE");
    }

    @Override
    public AgentAssessment assess(DisasterEvent event) {
        AgentAssessment assessment = new AgentAssessment();
        assessment.setAgentName(this.agentName);
        assessment.setDomain(this.domain);
        
        assessment.setPredictions(Arrays.asList(
            "Water levels expected to crest at 5 meters above flood stage.",
            "Inundation of low-lying residential areas likely within 12 hours."
        ));
        
        assessment.setCascadeRisks(Arrays.asList(
            "Contamination of municipal water supply.",
            "Structural damage to bridges and riverside infrastructure."
        ));
        
        assessment.setRecommendedActions(Arrays.asList(
            "Deploy sandbags in vulnerable areas.",
            "Evacuate populations near riverbanks and coastal zones.",
            "Shut down water intake valves to prevent contamination."
        ));
        
        assessment.setConfidenceScore(0.92);
        assessment.setEstimatedAffectedPeople((long) (event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * 3.14 * 500)); 
        assessment.setGoldenHourMinutes(60);
        
        return assessment;
    }
}
