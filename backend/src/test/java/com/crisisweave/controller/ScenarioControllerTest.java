package com.crisisweave.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ScenarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetScenariosList() throws Exception {
        mockMvc.perform(get("/api/scenarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value("bhopal"))
                .andExpect(jsonPath("$[1].id").value("chernobyl"))
                .andExpect(jsonPath("$[2].id").value("nepal_flood"));
    }

    @Test
    public void testGetSingleScenarioBhopal() throws Exception {
        mockMvc.perform(get("/api/scenarios/bhopal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("bhopal"))
                .andExpect(jsonPath("$.title").value("Bhopal Gas Tragedy (1984)"))
                .andExpect(jsonPath("$.type").value("CHEMICAL_LEAK"))
                .andExpect(jsonPath("$.simulationData").exists());
    }

    @Test
    public void testGetScenarioNotFound() throws Exception {
        mockMvc.perform(get("/api/scenarios/nonexistent"))
                .andExpect(status().isNotFound());
    }
}
