package com.crisisweave.controller;

import com.crisisweave.model.*;
import com.crisisweave.prism.PrismCoordinator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SimulationController {

    @Autowired
    private PrismCoordinator prismCoordinator;

    @PostMapping("/simulate")
    public SimulationResult simulate(@RequestBody DisasterEvent event) {
        return prismCoordinator.runSimulation(event);
    }
}
