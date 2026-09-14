import axios from 'axios';
import { DisasterEvent, SimulationResult, ScenarioTemplate } from '../types';
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

export const fetchScenarios = async (): Promise<ScenarioTemplate[]> => {
  try {
    const response = await apiClient.get('/scenarios');
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock scenarios');
    return mockScenarios;
  }
};

export const fetchScenario = async (id: string): Promise<ScenarioTemplate | undefined> => {
  try {
    const response = await apiClient.get(`/scenarios/${id}`);
    return response.data;
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
    result = response.data;
  } catch (error) {
    console.warn('Backend unavailable, returning mock simulation data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    result = {
      ...mockBhopalSimulation,
      id: `sim-${Date.now()}`,
      event: {
        ...event,
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };
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
