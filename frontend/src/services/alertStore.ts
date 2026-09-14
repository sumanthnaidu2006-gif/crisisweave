import { StoredAlert } from '../types';

const STORAGE_KEY = 'crisisweave_stored_alerts';

export const getStoredAlerts = (): StoredAlert[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load stored alerts:', e);
    return [];
  }
};

export const saveAlert = (alertData: {
  title: string;
  type: string;
  severity: string;
  location: string;
  advice: string;
  status?: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
}): StoredAlert => {
  const existing = getStoredAlerts();
  const newAlert: StoredAlert = {
    id: 'alert-' + Date.now(),
    title: alertData.title,
    type: alertData.type,
    severity: alertData.severity,
    location: alertData.location,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    advice: alertData.advice,
    status: alertData.status || 'ACTIVE'
  };

  const updated = [newAlert, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save alert:', e);
  }
  return newAlert;
};

export const clearAllAlerts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear alerts:', e);
  }
};

export const markAlertResolved = (id: string): void => {
  const existing = getStoredAlerts();
  const updated = existing.map(a => a.id === id ? { ...a, status: 'RESOLVED' as const } : a);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
