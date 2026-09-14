package com.crisisweave.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stored_alerts")
public class StoredAlert {
    @Id
    private String id;
    
    private String title;
    private String type;
    private String severity;
    private String location;
    private String timestamp;
    
    @Column(length = 2000)
    private String advice;
    
    private String status = "ACTIVE";

    public StoredAlert() {}

    public StoredAlert(String id, String title, String type, String severity, String location, String timestamp, String advice, String status) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.severity = severity;
        this.location = location;
        this.timestamp = timestamp;
        this.advice = advice;
        if (status != null) this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static StoredAlertBuilder builder() {
        return new StoredAlertBuilder();
    }

    public static class StoredAlertBuilder {
        private String id;
        private String title;
        private String type;
        private String severity;
        private String location;
        private String timestamp;
        private String advice;
        private String status = "ACTIVE";

        public StoredAlertBuilder id(String id) { this.id = id; return this; }
        public StoredAlertBuilder title(String title) { this.title = title; return this; }
        public StoredAlertBuilder type(String type) { this.type = type; return this; }
        public StoredAlertBuilder severity(String severity) { this.severity = severity; return this; }
        public StoredAlertBuilder location(String location) { this.location = location; return this; }
        public StoredAlertBuilder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public StoredAlertBuilder advice(String advice) { this.advice = advice; return this; }
        public StoredAlertBuilder status(String status) { this.status = status; return this; }

        public StoredAlert build() {
            if (id == null) id = "alert-" + System.currentTimeMillis();
            return new StoredAlert(id, title, type, severity, location, timestamp, advice, status);
        }
    }
}
