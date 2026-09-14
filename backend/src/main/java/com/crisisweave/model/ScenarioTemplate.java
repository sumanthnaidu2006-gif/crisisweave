package com.crisisweave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioTemplate {
    private String id;
    private String name;
    private String description;
    private int historicalYear;
    private String location;
    private DisasterType disasterType;
    private List<String> keyLessons;
    private List<String> tags;
    private DisasterEvent event;
    private SimulationResult result;
}
