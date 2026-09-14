package com.crisisweave.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class AgentController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "CrisisWeave");
        response.put("agents", 10);
        return response;
    }

    @GetMapping("/agents")
    public List<String> getAgents() {
        return Arrays.asList("InfrastructureAgent", "MedicalAgent", "WeatherAgent");
    }

    @GetMapping("/disaster-types")
    public List<String> getDisasterTypes() {
        return Arrays.asList("EARTHQUAKE", "FLOOD", "CHEMICAL_LEAK", "NUCLEAR_ACCIDENT");
    }
}
