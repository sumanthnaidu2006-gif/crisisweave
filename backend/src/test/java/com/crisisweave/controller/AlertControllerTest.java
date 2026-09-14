package com.crisisweave.controller;

import com.crisisweave.model.StoredAlert;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAlerts() throws Exception {
        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void testCreateAndResolveAlert() throws Exception {
        StoredAlert newAlert = StoredAlert.builder()
                .title("Test Evacuation Warning")
                .type("EVACUATION")
                .severity("HIGH")
                .location("Sector 7")
                .advice("Proceed to shelter A")
                .build();

        mockMvc.perform(post("/api/alerts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAlert)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Evacuation Warning"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(put("/api/alerts/alert-bhopal-initial/resolve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }
}
