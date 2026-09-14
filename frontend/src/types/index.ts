export enum DisasterType {
  FLOOD = 'FLOOD',
  EARTHQUAKE = 'EARTHQUAKE',
  TSUNAMI = 'TSUNAMI',
  CYCLONE = 'CYCLONE',
  WILDFIRE = 'WILDFIRE',
  CHEMICAL_LEAK = 'CHEMICAL_LEAK',
  NUCLEAR_ACCIDENT = 'NUCLEAR_ACCIDENT',
  EXPLOSION = 'EXPLOSION',
  INFRASTRUCTURE_FAILURE = 'INFRASTRUCTURE_FAILURE',
  HEATWAVE = 'HEATWAVE',
  LANDSLIDE = 'LANDSLIDE',
  DROUGHT = 'DROUGHT'
}

export enum SeverityLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  CATASTROPHIC = 'CATASTROPHIC'
}

export interface DisasterEvent {
  id?: string;
  type: DisasterType;
  severity: SeverityLevel;
  locationName: string;
  latitude: number;
  longitude: number;
  affectedRadiusKm: number;
  description: string;
  timestamp: string;
}

export interface AgentAssessment {
  agentName: string;
  domain: string;
  status: 'ACTIVE' | 'ANALYZING' | 'STANDBY';
  predictions: string[];
  confidenceScore: number;
  recommendedActions: RecommendedAction[];
  cascadeRisks: CascadeRisk[];
  estimatedAffectedPeople?: number;
  goldenHourMinutes?: number;
}

export interface RecommendedAction {
  id: string;
  text: string;
  urgency: 'IMMEDIATE' | 'WITHIN 1H' | 'WITHIN 6H' | 'WITHIN 24H';
  domain: string;
}

export interface CascadeRisk {
  serviceAffected: string;
  probabilityPercent: number;
}

export interface CascadeEvent {
  hourOffset: number;
  serviceAffected: string;
  impactDescription: string;
  severity: number;
  probabilityPercent: number;
  recommendedAction: string;
}

export interface SimulationResult {
  id: string;
  event: DisasterEvent;
  agents: AgentAssessment[];
  cascadeTimeline: CascadeEvent[];
  topActions: RecommendedAction[];
  publicAlertText: string;
  historicalComparison: string;
  createdAt: string;
  prismConfidence?: number;
  overallRiskLevel?: string;
  estimatedTotalAffected?: number;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  year: string;
  location: string;
  type: DisasterType;
  description: string;
  keyLessons: string[];
  simulationData: SimulationResult;
}

export interface StoredAlert {
  id: string;
  title: string;
  type: string;
  severity: string;
  location: string;
  timestamp: string;
  advice: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
}
