import { SimulationResult } from '../types';

export interface ControllerBroadcast {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  locationName: string;
  imageUrl?: string;
  guidelines?: string[];
  timestamp: string;
  sender: string;
}

export interface SyncState {
  currentIncident: SimulationResult | null;
  broadcast: ControllerBroadcast | null;
  lastUpdated: number;
  version: number;
}

export interface SyncEvent {
  type: 'INIT' | 'INCIDENT' | 'BROADCAST' | 'CLEAR';
  state: SyncState;
  timestamp: number;
  version: number;
}

type SyncCallback = (event: SyncEvent) => void;

// Resolve sync server URL (Vite dev server or standalone daemon)
const getSyncBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5173';
  const port = window.location.port;
  if (port === '8080') {
    return 'http://localhost:8081';
  }
  return window.location.origin;
};

// Local storage keys
const STORAGE_SYNC_KEY = 'crisisweave_live_sync_state';

// BroadcastChannel for instant same-browser cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('crisisweave_live_sync');
  } catch (e) {
    console.warn('[Sync] BroadcastChannel not supported:', e);
  }
}

const listeners = new Set<SyncCallback>();
let eventSource: EventSource | null = null;
let reconnectTimer: any = null;

/**
 * Initialize real-time synchronization connection
 */
export const initRealtimeSync = (): void => {
  if (typeof window === 'undefined') return;
  if (eventSource) return;

  const baseUrl = getSyncBaseUrl();
  const sseUrl = `${baseUrl}/api/sync/events`;

  try {
    eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[Sync] Real-time live stream connected to:', sseUrl);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SyncEvent = JSON.parse(event.data);
        handleIncomingSyncEvent(data);
      } catch (err) {
        // Heartbeat or comment
      }
    };

    eventSource.onerror = () => {
      console.warn('[Sync] SSE connection lost, retrying in 3s...');
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        initRealtimeSync();
      }, 3000);
    };
  } catch (err) {
    console.warn('[Sync] EventSource initialization failed:', err);
  }

  // Cross-tab broadcast channel listener
  if (broadcastChannel) {
    broadcastChannel.onmessage = (msgEvent) => {
      if (msgEvent.data) {
        notifyListeners(msgEvent.data);
      }
    };
  }

  // Window storage event listener for cross-tab fallback
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_SYNC_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        notifyListeners(parsed);
      } catch {}
    }
  });
};

function handleIncomingSyncEvent(event: SyncEvent) {
  // Cache to localStorage
  try {
    localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(event));
  } catch {}

  // Broadcast to other tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch {}
  }

  notifyListeners(event);
}

function notifyListeners(event: SyncEvent) {
  listeners.forEach(cb => {
    try {
      cb(event);
    } catch (e) {
      console.error('[Sync] Listener error:', e);
    }
  });
}

/**
 * Subscribe to real-time sync events across all devices & tabs
 */
export const subscribeToSync = (callback: SyncCallback): (() => void) => {
  listeners.add(callback);
  initRealtimeSync();

  // Initial push from local storage if available
  try {
    const cached = localStorage.getItem(STORAGE_SYNC_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      callback(parsed);
    }
  } catch {}

  return () => {
    listeners.delete(callback);
  };
};

/**
 * Controller Dispatches Incident: Updates EVERY user using the website immediately
 */
export const publishIncident = async (
  simulationResult: SimulationResult,
  broadcast?: ControllerBroadcast
): Promise<boolean> => {
  const baseUrl = getSyncBaseUrl();
  const payload = {
    type: 'INCIDENT',
    payload: {
      simulationResult,
      broadcast: broadcast || {
        id: `bc-${Date.now()}`,
        title: `${simulationResult.event.type} Emergency Declared`,
        message: simulationResult.publicAlertText || 'Emergency disaster response swarm activated by Command Center.',
        severity: (simulationResult.event.severity as any) || 'HIGH',
        locationName: simulationResult.event.locationName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Controller Command Center'
      }
    }
  };

  try {
    const res = await fetch(`${baseUrl}/api/sync/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('[Sync] Publish to primary server failed, broadcasting locally:', err);
  }

  // Local fallback broadcast
  const localEvent: SyncEvent = {
    type: 'INCIDENT',
    state: {
      currentIncident: simulationResult,
      broadcast: payload.payload.broadcast,
      lastUpdated: Date.now(),
      version: Date.now()
    },
    timestamp: Date.now(),
    version: Date.now()
  };
  handleIncomingSyncEvent(localEvent);
  return true;
};

/**
 * Controller Uploads Custom Advisory Bulletin / Announcement
 */
export const publishControllerBroadcast = async (
  broadcast: ControllerBroadcast
): Promise<boolean> => {
  const baseUrl = getSyncBaseUrl();
  const payload = {
    type: 'BROADCAST',
    payload: broadcast
  };

  try {
    const res = await fetch(`${baseUrl}/api/sync/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) return true;
  } catch (err) {
    console.warn('[Sync] Broadcast to server failed, broadcasting locally:', err);
  }

  // Local fallback broadcast
  const localEvent: SyncEvent = {
    type: 'BROADCAST',
    state: {
      currentIncident: null,
      broadcast,
      lastUpdated: Date.now(),
      version: Date.now()
    },
    timestamp: Date.now(),
    version: Date.now()
  };
  handleIncomingSyncEvent(localEvent);
  return true;
};

/**
 * Controller Clears Disaster State (ALL CLEAR signal)
 */
export const clearSyncState = async (): Promise<boolean> => {
  const baseUrl = getSyncBaseUrl();
  try {
    await fetch(`${baseUrl}/api/sync/clear`, { method: 'POST' });
  } catch (err) {
    console.warn('[Sync] Clear on server failed:', err);
  }

  const localEvent: SyncEvent = {
    type: 'CLEAR',
    state: {
      currentIncident: null,
      broadcast: null,
      lastUpdated: Date.now(),
      version: Date.now()
    },
    timestamp: Date.now(),
    version: Date.now()
  };
  handleIncomingSyncEvent(localEvent);
  return true;
};

/**
 * Fetch current state snapshot from server
 */
export const fetchCurrentSyncState = async (): Promise<SyncState | null> => {
  const baseUrl = getSyncBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sync/state`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Sync] Fetch state failed:', err);
  }
  return null;
};
