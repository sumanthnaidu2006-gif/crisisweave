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
public class AgentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.agents").value(10));
    }

    @Test
    public void testAgentsEndpoint() throws Exception {
        mockMvc.perform(get("/api/agents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(10))
                .andExpect(jsonPath("$[0]").value("MeteorologicalAgent"));
    }

    @Test
    public void testDisasterTypesEndpoint() throws Exception {
        mockMvc.perform(get("/api/disaster-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@ == 'FLOOD')]").exists())
                .andExpect(jsonPath("$[?(@ == 'CHEMICAL_LEAK')]").exists());
    }
}
