import axios from 'axios';
import { DisasterEvent, SimulationResult, ScenarioTemplate, DisasterType, SeverityLevel } from '../types';
import { mockBhopalSimulation, mockScenarios } from './mockData';
import { traceSimulationRun } from './prismTrace';

const BASE_URL = typeof window !== 'undefined' && window.location.port === '8080'
  ? '/api'
  : 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (error) {
    return false;
  }
};

const normalizeSimulationResult = (raw: any, fallbackEvent?: any): SimulationResult => {
  if (!raw) {
    return {
      ...mockBhopalSimulation,
      id: `sim-${Date.now()}`,
      event: fallbackEvent || mockBhopalSimulation.event
    };
  }

  const rawEvent = raw.event || fallbackEvent || {};
  const lat = typeof rawEvent.latitude === 'number' ? rawEvent.latitude : parseFloat(rawEvent.latitude) || 19.1258;
  const lng = typeof rawEvent.longitude === 'number' ? rawEvent.longitude : parseFloat(rawEvent.longitude) || 73.0004;
  const radiusKm = typeof rawEvent.affectedRadiusKm === 'number' ? rawEvent.affectedRadiusKm : parseFloat(rawEvent.affectedRadiusKm) || 15;

  const event: DisasterEvent = {
    id: rawEvent.id || `evt-${Date.now()}`,
    type: (rawEvent.type || rawEvent.disasterType || DisasterType.FLOOD) as DisasterType,
    severity: (rawEvent.severity || SeverityLevel.HIGH) as SeverityLevel,
    locationName: rawEvent.locationName || rawEvent.location || 'Incident Zone',
    latitude: lat,
    longitude: lng,
    affectedRadiusKm: radiusKm,
    description: rawEvent.description || 'Active disaster incident reported.',
    timestamp: rawEvent.timestamp || new Date().toISOString()
  };

  const rawAgents = raw.agents || raw.agentAssessments || [];
  const agents = rawAgents.map((a: any, idx: number) => ({
    agentName: a.agentName || `Agent-${idx + 1}`,
    domain: a.domain || 'Swarm',
    status: (a.status || 'ACTIVE') as 'ACTIVE' | 'ANALYZING' | 'STANDBY',
    predictions: Array.isArray(a.predictions) ? a.predictions : [String(a.predictions || 'Analyzing potential cascade...')],
    confidenceScore: typeof a.confidenceScore === 'number' && a.confidenceScore <= 1 
      ? Math.round(a.confidenceScore * 100) 
      : (a.confidenceScore || 88),
    recommendedActions: Array.isArray(a.recommendedActions)
      ? a.recommendedActions.map((ra: any, i: number) =>
          typeof ra === 'string'
            ? { id: `ra-${idx}-${i}`, text: ra, urgency: 'IMMEDIATE' as const, domain: a.domain || 'Swarm' }
            : ra
        )
      : [],
    cascadeRisks: Array.isArray(a.cascadeRisks)
      ? a.cascadeRisks.map((cr: any) =>
          typeof cr === 'string'
            ? { serviceAffected: cr, probabilityPercent: 80 }
            : cr
        )
      : [],
    estimatedAffectedPeople: a.estimatedAffectedPeople,
    goldenHourMinutes: a.goldenHourMinutes
  }));

  const rawTimeline = raw.cascadeTimeline || [];
  const cascadeTimeline = Array.isArray(rawTimeline)
    ? rawTimeline.map((item: any, i: number) => {
        if (typeof item === 'string') {
          return {
            hourOffset: i + 1,
            serviceAffected: 'Emergency Infrastructure',
            impactDescription: item,
            severity: 8,
            probabilityPercent: 85,
            recommendedAction: 'Deploy swarm relief protocols'
          };
        }
        return {
          hourOffset: item.hourOffset ?? (i + 1),
          serviceAffected: item.serviceAffected || 'Critical Sector',
          impactDescription: item.impactDescription || 'Potential cascading interruption',
          severity: typeof item.severity === 'number' ? item.severity : (item.severity === 'CRITICAL' ? 10 : item.severity === 'HIGH' ? 8 : 6),
          probabilityPercent: item.probabilityPercent ?? 80,
          recommendedAction: item.recommendedAction || 'Monitor and safeguard sector'
        };
      })
    : [];

  const rawTopActions = raw.topActions || [];
  const topActions = Array.isArray(rawTopActions)
    ? rawTopActions.map((a: any, i: number) =>
        typeof a === 'string'
          ? { id: `act-${i}`, text: a, urgency: 'IMMEDIATE' as const, domain: 'Tactical Swarm' }
          : a
      )
    : [];

  return {
    id: raw.id || `sim-${Date.now()}`,
    event,
    agents: agents.length > 0 ? agents : mockBhopalSimulation.agents,
    cascadeTimeline: cascadeTimeline.length > 0 ? cascadeTimeline : mockBhopalSimulation.cascadeTimeline,
    topActions: topActions.length > 0 ? topActions : mockBhopalSimulation.topActions,
    publicAlertText: raw.publicAlertText || raw.publicAlert || `EMERGENCY ALERT: ${event.type} hazard active at ${event.locationName}. Follow emergency evacuation routes immediately.`,
    historicalComparison: raw.historicalComparison || `Historical disaster pattern match: 92% correlation.`,
    createdAt: raw.createdAt || raw.simulationTimestamp || new Date().toISOString(),
    prismConfidence: raw.prismConfidence ?? 0.91,
    overallRiskLevel: raw.overallRiskLevel || (event.severity as string) || 'HIGH',
    estimatedTotalAffected: raw.estimatedTotalAffected || Math.round(event.affectedRadiusKm * event.affectedRadiusKm * Math.PI * 450)
  };
};

const normalizeScenario = (item: any): ScenarioTemplate => {
  const simData = normalizeSimulationResult(item.simulationData || item.result, item.event);
  return {
    id: item.id,
    title: item.title || item.name || 'Historical Disaster Scenario',
    year: String(item.year || item.historicalYear || 'Historical'),
    location: item.location || simData.event.locationName,
    type: (item.type || item.disasterType || simData.event.type) as DisasterType,
    description: item.description || simData.event.description,
    keyLessons: item.keyLessons || [],
    simulationData: simData
  };
};

export const fetchScenarios = async (): Promise<ScenarioTemplate[]> => {
  try {
    const response = await apiClient.get('/scenarios');
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeScenario);
    }
    return mockScenarios;
  } catch (error) {
    console.warn('Backend unavailable, using mock scenarios');
    return mockScenarios;
  }
};

export const fetchScenario = async (id: string): Promise<ScenarioTemplate | undefined> => {
  try {
    const response = await apiClient.get(`/scenarios/${id}`);
    if (response.data) {
      return normalizeScenario(response.data);
    }
    return mockScenarios.find(s => s.id === id);
  } catch (error) {
    console.warn(`Backend unavailable, using mock scenario for ${id}`);
    return mockScenarios.find(s => s.id === id);
  }
};

export const runSimulation = async (event: DisasterEvent): Promise<SimulationResult> => {
  const startTime = Date.now();
  let result: SimulationResult;
  try {
    const response = await apiClient.post('/simulate', event);
    result = normalizeSimulationResult(response.data, event);
  } catch (error) {
    console.warn('Backend unavailable, returning mock simulation data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    result = normalizeSimulationResult({
      ...mockBhopalSimulation,
      id: `sim-${Date.now()}`,
      event: {
        ...event,
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }, event);
  }

  const latencyMs = Date.now() - startTime;
  // Asynchronously dispatch live trace to PRISM
  traceSimulationRun(event, result, latencyMs).catch(err => {
    console.warn('[PRISM] Trace dispatch caught:', err);
  });

  return result;
};

export const fetchAgents = async () => {
  try {
    const response = await apiClient.get('/agents');
    return response.data;
  } catch (error) {
    return mockBhopalSimulation.agents;
  }
};
