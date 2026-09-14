package com.crisisweave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterEvent {
    private String id;
    private DisasterType type;
    private SeverityLevel severity;
    private double latitude;
    private double longitude;
    private String locationName;
    private String description;
    private double affectedRadiusKm;
    private LocalDateTime timestamp;
    private String reportedBy;
}
