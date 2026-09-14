import React, { useState, useEffect } from 'react';
import { DisasterType, SeverityLevel, DisasterEvent } from '../../types';
import { Warning, MapPin, Target, Crosshair, Sparkle } from '@phosphor-icons/react';

interface IncidentInputProps {
  onSimulate: (event: DisasterEvent) => void;
  isLoading: boolean;
  selectedTarget?: {
    lat: number;
    lng: number;
    locationName: string;
    timestamp?: number;
  } | null;
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS?: boolean;
    isPinned?: boolean;
  };
}

const IncidentInput: React.FC<IncidentInputProps> = ({ 
  onSimulate, 
  isLoading, 
  selectedTarget,
  liveLocation 
}) => {
  const [formData, setFormData] = useState<Partial<DisasterEvent>>({
    type: DisasterType.FLOOD,
    severity: SeverityLevel.HIGH,
    locationName: liveLocation?.locationName || 'Navi Mumbai, India',
    latitude: liveLocation?.lat || 19.1258,
    longitude: liveLocation?.lng || 73.0004,
    affectedRadiusKm: 15,
    description: 'Active hazard reported. Multi-agent cascade assessment requested.'
  });

  const [justImported, setJustImported] = useState(false);

  // Auto-import coordinates whenever commander touches/clicks on map or target updates
  useEffect(() => {
    if (selectedTarget) {
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(selectedTarget.lat.toFixed(5)),
        longitude: parseFloat(selectedTarget.lng.toFixed(5)),
        locationName: selectedTarget.locationName
      }));
      setJustImported(true);
      const timer = setTimeout(() => setJustImported(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [selectedTarget?.timestamp, selectedTarget?.lat, selectedTarget?.lng]);

  const handleUseLiveGPS = () => {
    if (liveLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: parseFloat(liveLocation.lat.toFixed(5)),
        longitude: parseFloat(liveLocation.lng.toFixed(5)),
        locationName: liveLocation.locationName
      }));
      setJustImported(true);
      setTimeout(() => setJustImported(false), 3500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(formData as DisasterEvent);
  };

  return (
    <div className="tactical-card flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-header flex items-center gap-2 m-0">
          <Warning size={18} weight="fill" className="text-primary" />
          INCIDENT DISPATCH
        </h2>
        {justImported && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            <Crosshair size={12} weight="bold" /> TARGET IMPORTED
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-bold">DISASTER TYPE</label>
          <select 
            className="w-full bg-background border border-border rounded p-1.5 text-xs text-foreground focus:border-primary outline-none"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as DisasterType})}
          >
            {Object.values(DisasterType).map(type => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block font-bold">SEVERITY LEVEL</label>
          <div className="flex gap-1 text-xs">
            {Object.values(SeverityLevel).map(sev => (
              <button
                type="button"
                key={sev}
                onClick={() => setFormData({...formData, severity: sev})}
                className={`flex-1 py-1 px-0 text-center rounded border text-[11px] font-bold ${
                  formData.severity === sev 
                    ? sev === 'CATASTROPHIC' || sev === 'CRITICAL'
                      ? 'bg-destructive/20 border-destructive text-destructive' 
                      : 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {sev.substring(0,3)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-muted-foreground flex items-center gap-1 font-bold">
              <MapPin size={13} /> LOCATION NAME
            </label>
            {liveLocation && (
              <button
                type="button"
                onClick={handleUseLiveGPS}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                title="Populate from live citizen GPS"
              >
                <Sparkle size={12} weight="bold" /> Use Live GPS
              </button>
            )}
          </div>
          <input 
            type="text" 
            className={`w-full bg-background border rounded p-1.5 text-xs text-foreground focus:border-primary outline-none transition-colors ${
              justImported ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-border'
            }`}
            value={formData.locationName || ''}
            onChange={e => setFormData({...formData, locationName: e.target.value})}
            placeholder="Tap on map or enter location"
            required
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground mb-0.5 block font-mono">LATITUDE</label>
            <input 
              type="number" step="0.0001"
              className={`w-full bg-background border rounded p-1.5 text-xs text-foreground font-mono focus:border-primary outline-none transition-colors ${
                justImported ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-border'
              }`}
              value={formData.latitude ?? ''}
              onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})}
              required
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground mb-0.5 block font-mono">LONGITUDE</label>
            <input 
              type="number" step="0.0001"
              className={`w-full bg-background border rounded p-1.5 text-xs text-foreground font-mono focus:border-primary outline-none transition-colors ${
                justImported ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-border'
              }`}
              value={formData.longitude ?? ''}
              onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground mb-1 block flex items-center justify-between font-bold">
            <span className="flex items-center gap-1"><Target size={13} /> AFFECTED RADIUS</span>
            <span className="text-primary font-mono">{formData.affectedRadiusKm} km</span>
          </label>
          <input 
            type="range" min="1" max="100"
            className="w-full accent-primary h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            value={formData.affectedRadiusKm || 15}
            onChange={e => setFormData({...formData, affectedRadiusKm: parseInt(e.target.value)})}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-auto w-full bg-primary hover:bg-amber-600 text-background font-orbitron font-bold py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {isLoading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full"></span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs">⚡ RUN SIMULATION ON TARGET</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default IncidentInput;
