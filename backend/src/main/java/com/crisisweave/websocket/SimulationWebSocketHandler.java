package com.crisisweave.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SimulationWebSocketHandler {

    @MessageMapping("/simulate")
    @SendTo("/topic/updates")
    public String simulate(String message) {
        return "Simulation update: " + message;
    }
}
