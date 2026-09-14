package com.crisisweave.controller;

import com.crisisweave.model.DisasterType;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AgentController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "CrisisWeave Backend API");
        response.put("agents", 10);
        response.put("prismEngine", "Gemini 1.5 Flash Concurrency");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/agents")
    public List<String> getAgents() {
        return Arrays.asList(
            "MeteorologicalAgent",
            "HydrologyAgent",
            "HealthcareAgent",
            "EvacuationAgent",
            "UtilitiesAgent",
            "LogisticsAgent",
            "CbrnAgent",
            "RadiationAgent",
            "EarlyWarningAgent",
            "InternationalAgent"
        );
    }

    @GetMapping("/disaster-types")
    public List<String> getDisasterTypes() {
        return Arrays.stream(DisasterType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }
}
