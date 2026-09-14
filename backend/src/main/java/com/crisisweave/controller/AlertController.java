package com.crisisweave.controller;

import com.crisisweave.model.StoredAlert;
import com.crisisweave.repository.StoredAlertRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private StoredAlertRepository alertRepository;

    @PostConstruct
    public void seedInitialAlerts() {
        if (alertRepository.count() == 0) {
            alertRepository.save(StoredAlert.builder()
                    .id("alert-bhopal-initial")
                    .title("Chemical Plume Emergency Warning")
                    .type("CHEMICAL_LEAK")
                    .severity("CRITICAL")
                    .location("Bhopal Industrial Zone")
                    .timestamp("Oct 14, 02:15 AM")
                    .advice("Disable air conditioning/HVAC. Cover face with wet cloth and move perpendicular to wind direction.")
                    .status("ACTIVE")
                    .build());

            alertRepository.save(StoredAlert.builder()
                    .id("alert-nepal-initial")
                    .title("Bagmati River Flood Surge Red Alert")
                    .type("FLOOD")
                    .severity("HIGH")
                    .location("Kathmandu Basin")
                    .timestamp("Sep 14, 08:30 PM")
                    .advice("Evacuate riverbanks immediately. High-ground emergency shelters opened at National Stadium.")
                    .status("ACTIVE")
                    .build());
        }
    }

    @GetMapping
    public List<StoredAlert> getAlerts() {
        return alertRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<StoredAlert> createAlert(@RequestBody StoredAlert alert) {
        if (alert.getId() == null || alert.getId().trim().isEmpty()) {
            alert.setId("alert-" + System.currentTimeMillis());
        }
        if (alert.getTimestamp() == null || alert.getTimestamp().trim().isEmpty()) {
            alert.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        }
        if (alert.getStatus() == null) {
            alert.setStatus("ACTIVE");
        }
        StoredAlert savedAlert = alertRepository.save(alert);
        return ResponseEntity.ok(savedAlert);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<StoredAlert> markResolved(@PathVariable String id) {
        Optional<StoredAlert> optionalAlert = alertRepository.findById(id);
        if (optionalAlert.isPresent()) {
            StoredAlert alert = optionalAlert.get();
            alert.setStatus("RESOLVED");
            alertRepository.save(alert);
            return ResponseEntity.ok(alert);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAlerts() {
        alertRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
