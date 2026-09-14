package com.crisisweave.controller;

import com.crisisweave.model.*;
import com.crisisweave.prism.PrismCoordinator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SimulationController {

    @Autowired
    private PrismCoordinator prismCoordinator;

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResult> simulate(@RequestBody DisasterEvent event) {
        if (event == null || event.getType() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (event.getId() == null || event.getId().trim().isEmpty()) {
            event.setId("evt-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (event.getTimestamp() == null) {
            event.setTimestamp(LocalDateTime.now());
        }
        if (event.getAffectedRadiusKm() <= 0) {
            event.setAffectedRadiusKm(10.0);
        }

        SimulationResult result = prismCoordinator.runSimulation(event);
        if (result.getId() == null) {
            result.setId("sim-" + System.currentTimeMillis());
        }
        return ResponseEntity.ok(result);
    }
}
