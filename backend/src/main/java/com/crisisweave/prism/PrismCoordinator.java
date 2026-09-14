package com.crisisweave.prism;

import com.crisisweave.model.*;
import com.crisisweave.agents.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class PrismCoordinator {

    @Autowired
    private List<BaseAgent> agents;
    
    @Autowired
    private GeminiService geminiService;

    public SimulationResult runSimulation(DisasterEvent event) {
        List<BaseAgent> relevantAgents = agents.stream()
                .filter(a -> a.isRelevantFor(event.getType()))
                .collect(Collectors.toList());

        List<CompletableFuture<AgentAssessment>> futures = relevantAgents.stream()
                .map(agent -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return agent.assess(event);
                    } catch (Exception e) {
                        return geminiService.resolveFallback(agent.getClass().getSimpleName(), event);
                    }
                }))
                .collect(Collectors.toList());

        List<AgentAssessment> assessments = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        List<CascadeEvent> timeline = geminiService.generateCascadeTimeline(event, assessments);
        List<String> allActions = assessments.stream()
                .filter(a -> a.getRecommendedActions() != null)
                .flatMap(a -> a.getRecommendedActions().stream())
                .collect(Collectors.toList());
        List<String> rankedActions = geminiService.rankActions(allActions, event);
        String historicalScenario = geminiService.matchHistoricalScenario(event);
        
        String overallRiskLevel = event.getSeverity() != null ? event.getSeverity().name() : "HIGH";
        long estimatedAffectedPeople = Math.round(event.getAffectedRadiusKm() * event.getAffectedRadiusKm() * Math.PI * 450);
        double prismConfidence = assessments.stream()
                .mapToDouble(AgentAssessment::getConfidenceScore)
                .average()
                .orElse(0.88);
        
        String publicAlert = geminiService.generatePublicAlert(event, overallRiskLevel);

        return SimulationResult.builder()
                .event(event)
                .agentAssessments(assessments)
                .cascadeTimeline(timeline)
                .topActions(rankedActions)
                .historicalComparison(historicalScenario)
                .publicAlert(publicAlert)
                .overallRiskLevel(overallRiskLevel)
                .estimatedTotalAffected(estimatedAffectedPeople)
                .simulationTimestamp(LocalDateTime.now())
                .prismConfidence(prismConfidence)
                .build();
    }
}
