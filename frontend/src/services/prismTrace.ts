import axios from 'axios';
import { DisasterEvent, SimulationResult } from '../types';

// PRISM Configuration from environment variables
// Safely access import.meta.env
const metaEnv: Record<string, string> = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const PRISM_HOST = (metaEnv.VITE_PRISMTRACE_HOST || 'https://prism-api-prod.up.railway.app').replace(/\/$/, '');
const PRISM_PROJECT_ID = metaEnv.VITE_PRISMTRACE_PROJECT_ID || '592f918a-ab4d-4e84-a267-0764afc7b154';
const PRISM_API_KEY = metaEnv.VITE_PRISMTRACE_API_KEY || '';

// Active session tracking to group traces into PRISM trajectories
let currentSessionId = `crisisweave-session-${Date.now()}`;

export const getPrismSessionId = (): string => currentSessionId;

export const resetPrismSessionId = (customId?: string): string => {
  currentSessionId = customId || `crisisweave-session-${Date.now()}`;
  return currentSessionId;
};

export interface PrismTracePayload {
  project_id: string;
  model: string;
  input_messages: Array<{ role: string; content: string }>;
  output_message: string;
  latency_ms: number;
  session_id?: string;
  agent_name?: string;
  agent_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a live trace directly to PRISM's HTTP ingest API.
 * Header: X-PRISMtrace-Key
 */
export const recordPrismTrace = async (payload: Partial<PrismTracePayload>): Promise<boolean> => {
  const apiKey = PRISM_API_KEY;
  if (!apiKey) {
    // If no key is configured in frontend env, tracing is bypassed gracefully
    return false;
  }

  const fullPayload: PrismTracePayload = {
    project_id: payload.project_id || PRISM_PROJECT_ID,
    model: payload.model || 'gemini-1.5-pro',
    input_messages: payload.input_messages || [{ role: 'user', content: 'Crisis simulation trigger' }],
    output_message: payload.output_message || 'Crisis response calculated',
    latency_ms: payload.latency_ms || 100,
    session_id: payload.session_id || currentSessionId,
    agent_name: payload.agent_name || 'PrismCoordinator',
    agent_id: payload.agent_id || 'prism-coordinator',
    metadata: {
      session_id: payload.session_id || currentSessionId,
      agent_name: payload.agent_name || 'PrismCoordinator',
      agent_id: payload.agent_id || 'prism-coordinator',
      ...(payload.metadata || {})
    }
  };

  try {
    await axios.post(`${PRISM_HOST}/api/traces`, fullPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-PRISMtrace-Key': apiKey
      },
      timeout: 5000
    });
    return true;
  } catch (error) {
    console.warn('[PRISM] Trace dispatch notice:', error);
    return false;
  }
};

/**
 * Record a full simulation run with agent assessments into PRISM trajectory
 */
export const traceSimulationRun = async (
  event: DisasterEvent,
  result: SimulationResult,
  latencyMs: number
): Promise<void> => {
  const sessionId = currentSessionId;

  // 1. Primary Swarm Coordinator trace
  const location = event.locationName || 'Unknown location';
  const inputPrompt = `Disaster Event: ${event.type} (${event.severity}) at ${location}. Radius: ${event.affectedRadiusKm}km. ${event.description || ''}`;
  const confidencePercent = result.prismConfidence !== undefined ? (result.prismConfidence * 100).toFixed(1) : '90.0';
  const affectedCount = result.estimatedTotalAffected !== undefined ? result.estimatedTotalAffected.toLocaleString() : '5,000';
  const actionsList = (result.topActions || []).slice(0, 3).map(a => typeof a === 'string' ? a : a.text).join('; ');
  const summaryOutput = `Alert: ${result.publicAlertText || 'Emergency alert triggered'}\nConfidence: ${confidencePercent}%\nEstimated Affected: ${affectedCount}\nActions: ${actionsList}`;

  await recordPrismTrace({
    model: 'gemini-1.5-pro',
    agent_name: 'PrismCoordinator',
    agent_id: 'prism-coordinator',
    session_id: sessionId,
    latency_ms: latencyMs,
    input_messages: [{ role: 'user', content: inputPrompt }],
    output_message: summaryOutput,
    metadata: {
      eventType: event.type,
      severity: event.severity,
      totalAffected: result.estimatedTotalAffected,
      confidence: result.prismConfidence
    }
  });

  // 2. Specialized individual agent traces (if available in assessment)
  if (result.agents && result.agents.length > 0) {
    for (const assessment of result.agents.slice(0, 3)) {
      const recActions = (assessment.recommendedActions || []).map(a => typeof a === 'string' ? a : a.text).join('; ');
      await recordPrismTrace({
        model: 'gemini-1.5-flash',
        agent_name: assessment.agentName,
        agent_id: assessment.agentName.toLowerCase().replace(/\s+/g, '-'),
        session_id: sessionId,
        latency_ms: Math.round(latencyMs * 0.4),
        input_messages: [
          { role: 'user', content: `Assess impact for ${assessment.domain || assessment.agentName}: ${event.type}` }
        ],
        output_message: `Predictions: ${(assessment.predictions || []).join('; ')}. Recommendations: ${recActions}`,
        metadata: {
          confidenceScore: assessment.confidenceScore,
          domain: assessment.domain
        }
      });
    }
  }
};
