package com.crisisweave.controller;

import com.crisisweave.model.ScenarioTemplate;
import com.crisisweave.scenarios.ScenarioLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    @Autowired
    private ScenarioLoader scenarioLoader;

    @GetMapping
    public List<ScenarioTemplate> getScenarios() {
        return scenarioLoader.getTemplates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScenarioTemplate> getScenario(@PathVariable String id) {
        ScenarioTemplate template = scenarioLoader.getTemplate(id);
        if (template == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(template);
    }
}
