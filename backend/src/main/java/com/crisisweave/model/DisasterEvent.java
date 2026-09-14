package com.crisisweave.model;

import java.time.LocalDateTime;

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

    public DisasterEvent() {}

    public DisasterEvent(String id, DisasterType type, SeverityLevel severity, double latitude, double longitude, String locationName, String description, double affectedRadiusKm, LocalDateTime timestamp, String reportedBy) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.description = description;
        this.affectedRadiusKm = affectedRadiusKm;
        this.timestamp = timestamp;
        this.reportedBy = reportedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DisasterType getType() { return type; }
    public void setType(DisasterType type) { this.type = type; }

    public SeverityLevel getSeverity() { return severity; }
    public void setSeverity(SeverityLevel severity) { this.severity = severity; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getAffectedRadiusKm() { return affectedRadiusKm; }
    public void setAffectedRadiusKm(double affectedRadiusKm) { this.affectedRadiusKm = affectedRadiusKm; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public static DisasterEventBuilder builder() {
        return new DisasterEventBuilder();
    }

    public static class DisasterEventBuilder {
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

        public DisasterEventBuilder id(String id) { this.id = id; return this; }
        public DisasterEventBuilder type(DisasterType type) { this.type = type; return this; }
        public DisasterEventBuilder severity(SeverityLevel severity) { this.severity = severity; return this; }
        public DisasterEventBuilder latitude(double latitude) { this.latitude = latitude; return this; }
        public DisasterEventBuilder longitude(double longitude) { this.longitude = longitude; return this; }
        public DisasterEventBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public DisasterEventBuilder description(String description) { this.description = description; return this; }
        public DisasterEventBuilder affectedRadiusKm(double affectedRadiusKm) { this.affectedRadiusKm = affectedRadiusKm; return this; }
        public DisasterEventBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public DisasterEventBuilder reportedBy(String reportedBy) { this.reportedBy = reportedBy; return this; }

        public DisasterEvent build() {
            return new DisasterEvent(id, type, severity, latitude, longitude, locationName, description, affectedRadiusKm, timestamp, reportedBy);
        }
    }
}
