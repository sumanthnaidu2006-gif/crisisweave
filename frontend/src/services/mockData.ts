import { DisasterType, SeverityLevel, SimulationResult, ScenarioTemplate } from '../types';

export const mockBhopalSimulation: SimulationResult = {
  id: 'sim-bhopal-1984',
  event: {
    type: DisasterType.CHEMICAL_LEAK,
    severity: SeverityLevel.CATASTROPHIC,
    locationName: 'Bhopal, India',
    latitude: 23.2599,
    longitude: 77.4126,
    affectedRadiusKm: 40,
    description: 'Massive leak of methyl isocyanate (MIC) gas from pesticide plant.',
    timestamp: new Date().toISOString()
  },
  agents: [
    {
      agentName: 'Atmos',
      domain: 'Meteorology',
      status: 'ACTIVE',
      predictions: ['Gas plume will travel southeast at 5km/h', 'Low wind speed will cause gas to settle in low-lying areas', 'Inversion layer will trap toxic cloud near surface'],
      confidenceScore: 92,
      recommendedActions: [{ id: 'a1', text: 'Evacuate southeast sector immediately', urgency: 'IMMEDIATE', domain: 'Evacuation' }],
      cascadeRisks: [{ serviceAffected: 'Air Quality', probabilityPercent: 99 }]
    },
    {
      agentName: 'Toxico',
      domain: 'CBRN',
      status: 'ACTIVE',
      predictions: ['MIC reacts exothermically with water', 'Severe respiratory distress within 10 mins of exposure', 'Corneal damage likely for exposed individuals'],
      confidenceScore: 95,
      recommendedActions: [{ id: 'a2', text: 'Distribute wet cloths for breathing', urgency: 'IMMEDIATE', domain: 'Health' }],
      cascadeRisks: [{ serviceAffected: 'Water Supply', probabilityPercent: 60 }]
    },
    {
      agentName: 'Medivac',
      domain: 'Healthcare',
      status: 'ACTIVE',
      predictions: ['Hospitals will exceed capacity within 2 hours', 'Shortage of oxygen cylinders predicted', 'High mortality rate for infants'],
      confidenceScore: 88,
      recommendedActions: [{ id: 'a3', text: 'Mobilize all available oxygen reserves', urgency: 'IMMEDIATE', domain: 'Health' }],
      cascadeRisks: [{ serviceAffected: 'Emergency Rooms', probabilityPercent: 95 }]
    },
    {
      agentName: 'RouteX',
      domain: 'Transport',
      status: 'ACTIVE',
      predictions: ['Major panic on outbound roads', 'Railway station will become a chokepoint', 'Visibility dropping due to gas cloud'],
      confidenceScore: 85,
      recommendedActions: [{ id: 'a4', text: 'Halt incoming trains to Bhopal', urgency: 'IMMEDIATE', domain: 'Transport' }],
      cascadeRisks: [{ serviceAffected: 'Traffic flow', probabilityPercent: 90 }]
    },
    {
      agentName: 'GridMaster',
      domain: 'Utilities',
      status: 'ACTIVE',
      predictions: ['Power plants unaffected directly', 'Staff abandonment may cause local outages', 'Water treatment facilities at risk of contamination'],
      confidenceScore: 75,
      recommendedActions: [{ id: 'a5', text: 'Secure water treatment plant intakes', urgency: 'WITHIN 1H', domain: 'Utilities' }],
      cascadeRisks: [{ serviceAffected: 'Water Supply', probabilityPercent: 40 }]
    },
    {
      agentName: 'Securo',
      domain: 'Public Safety',
      status: 'ACTIVE',
      predictions: ['Stampedes likely in dense neighborhoods', 'Communication lines will overload', 'First responders lack proper PPE'],
      confidenceScore: 82,
      recommendedActions: [{ id: 'a6', text: 'Deploy megaphones for public address (radio down)', urgency: 'IMMEDIATE', domain: 'Comms' }],
      cascadeRisks: [{ serviceAffected: 'Cell networks', probabilityPercent: 80 }]
    },
    {
      agentName: 'EcoWatch',
      domain: 'Environment',
      status: 'ACTIVE',
      predictions: ['Long-term soil contamination', 'Vegetation die-off in 5km radius', 'Groundwater toxic seepage possible'],
      confidenceScore: 70,
      recommendedActions: [{ id: 'a7', text: 'Monitor groundwater wells', urgency: 'WITHIN 24H', domain: 'Environment' }],
      cascadeRisks: [{ serviceAffected: 'Agriculture', probabilityPercent: 85 }]
    },
    {
      agentName: 'LogistiX',
      domain: 'Resources',
      status: 'ACTIVE',
      predictions: ['Medical supply chain collapse', 'Food and clean water shortages by day 2'],
      confidenceScore: 78,
      recommendedActions: [{ id: 'a8', text: 'Request federal medical stockpiles', urgency: 'WITHIN 6H', domain: 'Resources' }],
      cascadeRisks: [{ serviceAffected: 'Supply Chain', probabilityPercent: 75 }]
    },
    {
      agentName: 'GeoSpy',
      domain: 'Mapping',
      status: 'ACTIVE',
      predictions: ['High density slums in direct path', 'Narrow streets will hamper ambulances'],
      confidenceScore: 90,
      recommendedActions: [{ id: 'a9', text: 'Identify wide avenues for triage centers', urgency: 'WITHIN 1H', domain: 'Mapping' }],
      cascadeRisks: [{ serviceAffected: 'Emergency Access', probabilityPercent: 88 }]
    },
    {
      agentName: 'SocialNet',
      domain: 'Information',
      status: 'ACTIVE',
      predictions: ['Misinformation about antidotes spreading', 'Panic amplifying through word of mouth'],
      confidenceScore: 85,
      recommendedActions: [{ id: 'a10', text: 'Broadcast official medical advice continuously', urgency: 'IMMEDIATE', domain: 'Comms' }],
      cascadeRisks: [{ serviceAffected: 'Public Trust', probabilityPercent: 70 }]
    }
  ],
  cascadeTimeline: [
    { hourOffset: 0, serviceAffected: 'Air Quality', impactDescription: 'Lethal MIC gas cloud expands', severity: 10, probabilityPercent: 100, recommendedAction: 'Shelter in place with wet cloths or evacuate upwind' },
    { hourOffset: 1, serviceAffected: 'Healthcare', impactDescription: 'Hospitals overwhelmed, oxygen depleted', severity: 9, probabilityPercent: 95, recommendedAction: 'Set up outdoor triage centers' },
    { hourOffset: 3, serviceAffected: 'Transport', impactDescription: 'Roads blocked by fleeing population, stampedes', severity: 8, probabilityPercent: 90, recommendedAction: 'Deploy military for traffic control' },
    { hourOffset: 6, serviceAffected: 'Public Safety', impactDescription: 'First responders incapacitated by gas', severity: 8, probabilityPercent: 85, recommendedAction: 'Require SCBA gear for all responders' },
    { hourOffset: 12, serviceAffected: 'Communications', impactDescription: 'Total collapse of local comms due to overload', severity: 7, probabilityPercent: 80, recommendedAction: 'Deploy ham radio networks' },
    { hourOffset: 24, serviceAffected: 'Water Supply', impactDescription: 'Suspected contamination of open water sources', severity: 6, probabilityPercent: 60, recommendedAction: 'Distribute bottled water' },
    { hourOffset: 48, serviceAffected: 'Food Supply', impactDescription: 'Local markets abandoned, food scarce', severity: 5, probabilityPercent: 70, recommendedAction: 'Establish relief kitchens' },
    { hourOffset: 72, serviceAffected: 'Sanitation', impactDescription: 'Mass casualty management crisis', severity: 9, probabilityPercent: 90, recommendedAction: 'Mobilize national disaster response force' }
  ],
  topActions: [
    { id: 't1', text: 'Evacuate populations UPWIND of the plant immediately.', urgency: 'IMMEDIATE', domain: 'Evacuation' },
    { id: 't2', text: 'Broadcast instructions to use wet cloths over face.', urgency: 'IMMEDIATE', domain: 'Health' },
    { id: 't3', text: 'Mobilize all regional oxygen supplies to Bhopal.', urgency: 'IMMEDIATE', domain: 'Resources' },
    { id: 't4', text: 'Halt all incoming trains to Bhopal junction.', urgency: 'IMMEDIATE', domain: 'Transport' },
    { id: 't5', text: 'Setup open-air triage centers away from low-lying areas.', urgency: 'WITHIN 1H', domain: 'Health' },
    { id: 't6', text: 'Deploy military personnel with SCBA gear for rescue.', urgency: 'WITHIN 1H', domain: 'Public Safety' },
    { id: 't7', text: 'Establish temporary morgues with ice supplies.', urgency: 'WITHIN 6H', domain: 'Sanitation' },
    { id: 't8', text: 'Request federal medical disaster teams.', urgency: 'WITHIN 6H', domain: 'Resources' }
  ],
  publicAlertText: "CRITICAL ALERT: Toxic gas leak detected at Union Carbide plant. DO NOT PANIC. Move UPWIND or perpendicular to the wind direction. If trapped, stay indoors, close all windows, and breathe through a wet cloth. Await further instructions.",
  historicalComparison: "Unprecedented scale. Compares to zero previous industrial accidents in dense urban areas. Similar hazard profile to WWI chemical agents but lacking military discipline in exposed population.",
  createdAt: new Date().toISOString()
};

export const mockScenarios: ScenarioTemplate[] = [
  {
    id: 's1',
    title: 'Bhopal Gas Tragedy',
    year: '1984',
    location: 'Bhopal, India',
    type: DisasterType.CHEMICAL_LEAK,
    description: 'Largest industrial disaster — 40 tonnes of MIC gas. 15,000+ deaths.',
    keyLessons: ['Urban planning near industrial zones is critical', 'Public warning systems must be immediate', 'First responders need hazard-specific training'],
    simulationData: mockBhopalSimulation
  },
  {
    id: 's2',
    title: 'Chernobyl Nuclear Disaster',
    year: '1986',
    location: 'Pripyat, Ukraine',
    type: DisasterType.NUCLEAR_ACCIDENT,
    description: 'Reactor 4 explosion. Radiation spread across 7 countries.',
    keyLessons: ['Information transparency saves lives', 'Evacuation perimeters must be aggressively large', 'Long-term ecological monitoring is required'],
    simulationData: {
      ...mockBhopalSimulation,
      id: 'sim-chernobyl',
      event: {
        ...mockBhopalSimulation.event,
        type: DisasterType.NUCLEAR_ACCIDENT,
        locationName: 'Pripyat, Ukraine',
        latitude: 51.3895,
        longitude: 30.0991,
        affectedRadiusKm: 30,
        description: 'Catastrophic nuclear reactor explosion and fire.'
      }
    }
  },
  {
    id: 's3',
    title: 'Nepal Monsoon Floods',
    year: 'Annual',
    location: 'Terai Region, Nepal',
    type: DisasterType.FLOOD,
    description: 'Recurring monsoon crisis. Villages isolated, disease outbreaks follow.',
    keyLessons: ['Pre-positioning supplies is vital', 'Early warning via mobile networks effective', 'Sanitation is the secondary killer'],
    simulationData: {
      ...mockBhopalSimulation,
      id: 'sim-nepal',
      event: {
        ...mockBhopalSimulation.event,
        type: DisasterType.FLOOD,
        locationName: 'Terai, Nepal',
        latitude: 27.7,
        longitude: 85.3,
        affectedRadiusKm: 200,
        description: 'Massive monsoon flooding affecting millions.'
      }
    }
  }
];
