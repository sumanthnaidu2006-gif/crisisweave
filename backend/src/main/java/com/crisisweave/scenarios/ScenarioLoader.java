package com.crisisweave.scenarios;

import com.crisisweave.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@Service
public class ScenarioLoader {

    public List<ScenarioTemplate> getTemplates() {
        return Arrays.asList(
            createBhopalTemplate(),
            createChernobylTemplate(),
            createNepalFloodTemplate()
        );
    }
    
    public ScenarioTemplate getTemplate(String id) {
        return getTemplates().stream().filter(t -> t.getId().equals(id)).findFirst().orElse(null);
    }

    private ScenarioTemplate createBhopalTemplate() {
        DisasterEvent event = DisasterEvent.builder()
            .id("evt-bhopal")
            .type(DisasterType.CHEMICAL_LEAK)
            .severity(SeverityLevel.CATASTROPHIC)
            .latitude(23.2599)
            .longitude(77.4126)
            .locationName("Bhopal, India")
            .description("40 tonnes of Methyl Isocyanate (MIC) gas leaked from Union Carbide pesticide plant.")
            .affectedRadiusKm(40.0)
            .timestamp(LocalDateTime.now())
            .reportedBy("System")
            .build();

        return ScenarioTemplate.builder()
            .id("bhopal")
            .name("Bhopal Gas Tragedy (1984)")
            .description("Deadliest chemical industrial catastrophe in history.")
            .historicalYear(1984)
            .location("Bhopal, Madhya Pradesh, India")
            .disasterType(DisasterType.CHEMICAL_LEAK)
            .keyLessons(Arrays.asList(
                "Never disable industrial refrigeration or flare towers",
                "Hospitals must have pre-loaded chemical antidotes and protocols",
                "Enforce buffer zones between hazardous facilities and population"
            ))
            .tags(Arrays.asList("Chemical", "Industrial", "CBRN", "Toxic Plume"))
            .event(event)
            .result(createMockResult(event, "CRITICAL", "Historical Bhopal incident match: 94% similarity."))
            .build();
    }

    private ScenarioTemplate createChernobylTemplate() {
        DisasterEvent event = DisasterEvent.builder()
            .id("evt-chernobyl")
            .type(DisasterType.NUCLEAR_ACCIDENT)
            .severity(SeverityLevel.CATASTROPHIC)
            .latitude(51.3890)
            .longitude(30.0994)
            .locationName("Pripyat, Ukraine")
            .description("Reactor 4 steam explosion and open graphite fire releasing radioactive isotopes.")
            .affectedRadiusKm(300.0)
            .timestamp(LocalDateTime.now())
            .reportedBy("System")
            .build();

        return ScenarioTemplate.builder()
            .id("chernobyl")
            .name("Chernobyl Nuclear Disaster (1986)")
            .description("Level 7 nuclear accident releasing radioactive plume across Europe.")
            .historicalYear(1986)
            .location("Pripyat, Ukraine")
            .disasterType(DisasterType.NUCLEAR_ACCIDENT)
            .keyLessons(Arrays.asList(
                "Do not delay urban evacuation: Pripyat took 36 hours",
                "Automated international radiological notification is mandatory",
                "Equip all first responders with proper CBRN/radiation PPE"
            ))
            .tags(Arrays.asList("Nuclear", "Radiation", "Exclusion Zone"))
            .event(event)
            .result(createMockResult(event, "CATASTROPHIC", "Chernobyl Level 7 INES similarity."))
            .build();
    }

    private ScenarioTemplate createNepalFloodTemplate() {
        DisasterEvent event = DisasterEvent.builder()
            .id("evt-nepal")
            .type(DisasterType.FLOOD)
            .severity(SeverityLevel.HIGH)
            .latitude(27.7172)
            .longitude(85.3240)
            .locationName("Kathmandu Valley, Nepal")
            .description("Monsoon torrential downpours triggering Bagmati & Kosi river overflows and landslides.")
            .affectedRadiusKm(50.0)
            .timestamp(LocalDateTime.now())
            .reportedBy("System")
            .build();

        return ScenarioTemplate.builder()
            .id("nepal_flood")
            .name("Nepal Monsoon Floods & Landslides")
            .description("Severe annual monsoon cloudburst inundating valleys and isolating villages.")
            .historicalYear(2024)
            .location("Kathmandu & Terai Region, Nepal")
            .disasterType(DisasterType.FLOOD)
            .keyLessons(Arrays.asList(
                "Pre-position clean water and cholera kits before river crests",
                "Dynamic route rerouting for humanitarian convoys",
                "Community early warning sirens in mountain catchment basins"
            ))
            .tags(Arrays.asList("Hydrology", "Monsoon", "Landslide", "Disease Risk"))
            .event(event)
            .result(createMockResult(event, "HIGH", "Matches high-precipitation Himalayan cloudburst patterns."))
            .build();
    }
    
    private SimulationResult createMockResult(DisasterEvent event, String riskLevel, String historicalComp) {
        List<CascadeEvent> events = new ArrayList<>();
        events.add(CascadeEvent.builder().hourOffset(1).serviceAffected("Immediate Impact Zone").impactDescription("Primary shockwave / chemical release / flash flood crest").severity("CRITICAL").probabilityPercent(98).recommendedAction("Issue red alert and start evacuation").build());
        events.add(CascadeEvent.builder().hourOffset(3).serviceAffected("Emergency Transport").impactDescription("Major arterials blocked or congested").severity("HIGH").probabilityPercent(85).recommendedAction("Open secondary emergency corridors").build());
        events.add(CascadeEvent.builder().hourOffset(6).serviceAffected("Healthcare Facilities").impactDescription("Local hospitals reach 90% acute surge threshold").severity("CRITICAL").probabilityPercent(90).recommendedAction("Triage non-critical patients to surrounding district hospitals").build());
        events.add(CascadeEvent.builder().hourOffset(12).serviceAffected("Power & Telecom").impactDescription("Grid substation failure causes regional blackout").severity("MODERATE").probabilityPercent(75).recommendedAction("Deploy emergency generators to field command").build());
        events.add(CascadeEvent.builder().hourOffset(24).serviceAffected("Potable Water & Sanitation").impactDescription("Treatment reservoirs compromised").severity("HIGH").probabilityPercent(80).recommendedAction("Mobilize bottled water and purification tablets").build());
        events.add(CascadeEvent.builder().hourOffset(48).serviceAffected("Public Health & Disease").impactDescription("Secondary epidemic/exposure risk escalates").severity("MODERATE").probabilityPercent(65).recommendedAction("Pre-position antibiotics and preventive vaccines").build());

        return SimulationResult.builder()
            .event(event)
            .agentAssessments(new ArrayList<>())
            .overallRiskLevel(riskLevel)
            .cascadeTimeline(events)
            .topActions(Arrays.asList(
                "Establish incident command and dispatch first responders",
                "Broadcast mass geo-targeted SMS warning in local dialect",
                "Activate nearest safe high-ground emergency shelters",
                "Reroute emergency ambulances away from blocked routes"
            ))
            .historicalComparison(historicalComp)
            .publicAlert("EMERGENCY ALERT: Active hazard in your vicinity. Seek marked safe shelters immediately and follow emergency guidance.")
            .estimatedTotalAffected(450000)
            .simulationTimestamp(LocalDateTime.now())
            .prismConfidence(0.91)
            .build();
    }
}
