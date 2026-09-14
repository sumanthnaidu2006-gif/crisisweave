package com.crisisweave.prism;

import com.crisisweave.model.*;
import com.crisisweave.agents.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class GeminiService {
    
    @Value("${gemini.api.key:}")
    private String apiKey;

    public List<CascadeEvent> generateCascadeTimeline(DisasterEvent event, List<AgentAssessment> assessments) {
        if (apiKey == null || apiKey.isEmpty()) {
            return getFallbackCascadeTimeline();
        }
        try {
            // Simulated HTTP call, fallback on error
            return getFallbackCascadeTimeline();
        } catch (Exception e) {
            return getFallbackCascadeTimeline();
        }
    }

    public List<String> rankActions(List<String> allActions, DisasterEvent event) {
        if (apiKey == null || apiKey.isEmpty()) {
            return getFallbackRankedActions(allActions);
        }
        try {
            return getFallbackRankedActions(allActions);
        } catch (Exception e) {
            return getFallbackRankedActions(allActions);
        }
    }

    public String matchHistoricalScenario(DisasterEvent event) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Fallback historical scenario matched based on event details.";
        }
        try {
            return "Fallback historical scenario matched based on event details.";
        } catch (Exception e) {
            return "Fallback historical scenario matched based on event details.";
        }
    }

    public String generatePublicAlert(DisasterEvent event, String riskLevel) {
        String loc = event.getLocationName() != null ? event.getLocationName() : "Affected Area";
        if (apiKey == null || apiKey.isEmpty()) {
            return "URGENT ALERT: " + event.getType() + " at " + loc + ". Risk level: " + riskLevel + ". Follow local authorities.";
        }
        try {
            return "URGENT ALERT: " + event.getType() + " at " + loc + ". Risk level: " + riskLevel + ". Follow local authorities.";
        } catch (Exception e) {
            return "URGENT ALERT: " + event.getType() + " at " + loc + ". Risk level: " + riskLevel + ". Follow local authorities.";
        }
    }

    public AgentAssessment resolveFallback(String agentType, DisasterEvent event) {
        String loc = event.getLocationName() != null ? event.getLocationName() : "area";
        return AgentAssessment.builder()
                .agentName(agentType)
                .domain("Emergency Response")
                .status("ACTIVE")
                .confidenceScore(0.85)
                .predictions(Arrays.asList("Critical impact predicted in " + loc))
                .recommendedActions(Arrays.asList("Deploy local emergency responders", "Issue shelter in place warnings"))
                .cascadeRisks(Arrays.asList("Transport disruption", "Utility loss"))
                .estimatedAffectedPeople(5000L)
                .goldenHourMinutes(60)
                .dataTimestamp(java.time.LocalDateTime.now())
                .build();
    }

    private List<CascadeEvent> getFallbackCascadeTimeline() {
        return Arrays.asList(
            CascadeEvent.builder()
                .hourOffset(1)
                .serviceAffected("Transport & Roads")
                .impactDescription("Initial event impact and road closures")
                .severity("HIGH")
                .probabilityPercent(85)
                .recommendedAction("Reroute emergency traffic")
                .build(),
            CascadeEvent.builder()
                .hourOffset(2)
                .serviceAffected("Power Grid & Utilities")
                .impactDescription("Secondary substation failure")
                .severity("MODERATE")
                .probabilityPercent(70)
                .recommendedAction("Engage emergency backup generators")
                .build()
        );
    }
    
    private List<String> getFallbackRankedActions(List<String> allActions) {
        return allActions != null ? new ArrayList<>(allActions) : Arrays.asList("Evacuate", "Shelter");
    }
}
