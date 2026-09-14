package com.crisisweave.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class ScenarioTemplate {
    private String id;
    private String title;
    private String year;
    private String location;
    
    @JsonProperty("type")
    private DisasterType disasterType;
    
    private String description;
    private List<String> keyLessons = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private DisasterEvent event;
    
    @JsonProperty("simulationData")
    private SimulationResult result;

    public ScenarioTemplate() {}

    public ScenarioTemplate(String id, String title, String year, String location, DisasterType disasterType, String description, List<String> keyLessons, List<String> tags, DisasterEvent event, SimulationResult result) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.location = location;
        this.disasterType = disasterType;
        this.description = description;
        if (keyLessons != null) this.keyLessons = keyLessons;
        if (tags != null) this.tags = tags;
        this.event = event;
        this.result = result;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getName() { return title; }
    public void setName(String name) { this.title = name; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public int getHistoricalYear() {
        try {
            return Integer.parseInt(year);
        } catch (Exception e) {
            return 0;
        }
    }
    public void setHistoricalYear(int historicalYear) { this.year = String.valueOf(historicalYear); }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    @JsonProperty("type")
    public DisasterType getDisasterType() { return disasterType; }
    public void setDisasterType(DisasterType disasterType) { this.disasterType = disasterType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getKeyLessons() { return keyLessons; }
    public void setKeyLessons(List<String> keyLessons) { this.keyLessons = keyLessons; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public DisasterEvent getEvent() { return event; }
    public void setEvent(DisasterEvent event) { this.event = event; }

    @JsonProperty("simulationData")
    public SimulationResult getResult() { return result; }
    public void setResult(SimulationResult result) { this.result = result; }

    public static ScenarioTemplateBuilder builder() {
        return new ScenarioTemplateBuilder();
    }

    public static class ScenarioTemplateBuilder {
        private String id;
        private String title;
        private String year;
        private String location;
        private DisasterType disasterType;
        private String description;
        private List<String> keyLessons = new ArrayList<>();
        private List<String> tags = new ArrayList<>();
        private DisasterEvent event;
        private SimulationResult result;

        public ScenarioTemplateBuilder id(String id) { this.id = id; return this; }
        public ScenarioTemplateBuilder title(String title) { this.title = title; return this; }
        public ScenarioTemplateBuilder name(String name) { this.title = name; return this; }
        public ScenarioTemplateBuilder year(String year) { this.year = year; return this; }
        public ScenarioTemplateBuilder historicalYear(int historicalYear) { this.year = String.valueOf(historicalYear); return this; }
        public ScenarioTemplateBuilder location(String location) { this.location = location; return this; }
        public ScenarioTemplateBuilder disasterType(DisasterType disasterType) { this.disasterType = disasterType; return this; }
        public ScenarioTemplateBuilder type(DisasterType type) { this.disasterType = type; return this; }
        public ScenarioTemplateBuilder description(String description) { this.description = description; return this; }
        public ScenarioTemplateBuilder keyLessons(List<String> keyLessons) { if (keyLessons != null) this.keyLessons = keyLessons; return this; }
        public ScenarioTemplateBuilder tags(List<String> tags) { if (tags != null) this.tags = tags; return this; }
        public ScenarioTemplateBuilder event(DisasterEvent event) { this.event = event; return this; }
        public ScenarioTemplateBuilder result(SimulationResult result) { this.result = result; return this; }
        public ScenarioTemplateBuilder simulationData(SimulationResult simulationData) { this.result = simulationData; return this; }

        public ScenarioTemplate build() {
            return new ScenarioTemplate(id, title, year, location, disasterType, description, keyLessons, tags, event, result);
        }
    }
}
