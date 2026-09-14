package com.crisisweave.controller;

import com.crisisweave.model.DisasterEvent;
import com.crisisweave.model.DisasterType;
import com.crisisweave.model.SeverityLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SimulationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testSimulateFloodEvent() throws Exception {
        DisasterEvent event = DisasterEvent.builder()
                .type(DisasterType.FLOOD)
                .severity(SeverityLevel.HIGH)
                .locationName("River Valley")
                .latitude(27.7172)
                .longitude(85.3240)
                .affectedRadiusKm(25.0)
                .description("Flash flooding due to intense monsoon surge.")
                .build();

        mockMvc.perform(post("/api/simulate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.event.type").value("FLOOD"))
                .andExpect(jsonPath("$.agents").isArray())
                .andExpect(jsonPath("$.cascadeTimeline").isArray())
                .andExpect(jsonPath("$.publicAlertText").exists())
                .andExpect(jsonPath("$.prismConfidence").exists());
    }

    @Test
    public void testSimulateChemicalLeak() throws Exception {
        DisasterEvent event = DisasterEvent.builder()
                .type(DisasterType.CHEMICAL_LEAK)
                .severity(SeverityLevel.CRITICAL)
                .locationName("Industrial Complex")
                .latitude(23.2599)
                .longitude(77.4126)
                .affectedRadiusKm(30.0)
                .description("Toxic gas tank rupture.")
                .build();

        mockMvc.perform(post("/api/simulate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.event.type").value("CHEMICAL_LEAK"))
                .andExpect(jsonPath("$.agents[?(@.agentName == 'CbrnAgent')]").exists());
    }
}
