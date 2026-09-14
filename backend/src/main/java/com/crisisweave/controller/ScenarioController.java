package com.crisisweave.controller;

import com.crisisweave.model.ScenarioTemplate;
import com.crisisweave.scenarios.ScenarioLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    @Autowired
    private ScenarioLoader scenarioLoader;

    @GetMapping
    public List<ScenarioTemplate> getScenarios() {
        // Return metadata only (without full simulation result)
        return scenarioLoader.getTemplates().stream().map(t ->
            ScenarioTemplate.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .historicalYear(t.getHistoricalYear())
                .location(t.getLocation())
                .disasterType(t.getDisasterType())
                .keyLessons(t.getKeyLessons())
                .tags(t.getTags())
                .event(t.getEvent())
                // intentionally omit result for list view
                .build()
        ).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ScenarioTemplate getScenario(@PathVariable String id) {
        return scenarioLoader.getTemplate(id);
    }
}

