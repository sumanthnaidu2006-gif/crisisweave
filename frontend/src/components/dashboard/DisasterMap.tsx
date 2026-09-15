import React, { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair, Target } from '@phosphor-icons/react';
import { SimulationResult, DisasterType } from '../../types';
import { reverseGeocodeNominatim } from '../../hooks/useLiveLocation';

interface DisasterMapProps {
  simulationResult: SimulationResult | null;
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS?: boolean;
    isPinned?: boolean;
  };
  onSelectLocation?: (lat: number, lng: number, locationName: string) => void;
  selectedTarget?: {
    lat: number;
    lng: number;
    locationName: string;
  } | null;
}

// Tactical Targeting Reticle Pin for Admin Map
const targetReticleIcon = L.divIcon({
  className: 'custom-target-marker',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: crosshair;">
      <div style="position: absolute; width: 40px; height: 40px; border: 2px dashed #EF4444; border-radius: 50%; animation: spin 4s linear infinite;"></div>
      <div style="position: absolute; width: 22px; height: 22px; background: rgba(239, 68, 68, 0.4); border: 2px solid #EF4444; border-radius: 50%;"></div>
      <div style="position: absolute; width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px #FFFFFF;"></div>
      <div style="position: absolute; top: -14px; background: #EF4444; color: #FFFFFF; font-size: 8px; font-weight: 900; font-family: monospace; padding: 1px 4px; border-radius: 3px; letter-spacing: 1px;">TARGET</div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Citizen Live Marker
const citizenMarkerIcon = L.divIcon({
  className: 'custom-citizen-marker',
  html: `
    <div style="width: 26px; height: 26px; background: #3B82F6; border: 3px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #3B82F6; animation: pulse 1.8s infinite;">
      <div style="font-size: 11px;">📱</div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Helper component to change view when location changes with smooth flyTo & invalidateSize
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true });
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [center[0], center[1], zoom, map]);
  return null;
};

// Map click event listener to capture touch/click coordinates
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const getDisasterColor = (type: DisasterType) => {
  switch (type) {
    case DisasterType.CHEMICAL_LEAK: return '#F59E0B'; // Amber
    case DisasterType.NUCLEAR_ACCIDENT: return '#10B981'; // Green
    case DisasterType.FLOOD: return '#3B82F6'; // Blue
    case DisasterType.WILDFIRE:
    case DisasterType.EXPLOSION: return '#EF4444'; // Red
    default: return '#EF4444';
  }
};

const getZoomForRadius = (radiusKm: number): number => {
  if (radiusKm >= 150) return 6;
  if (radiusKm >= 80) return 7;
  if (radiusKm >= 30) return 9;
  if (radiusKm >= 15) return 10;
  if (radiusKm >= 5) return 11;
  return 12;
};

const createDisasterEpicenterIcon = (type: DisasterType) => {
  let symbol = '⚠️';
  let color = '#EF4444';
  if (type === DisasterType.CHEMICAL_LEAK) { symbol = '☣️'; color = '#F59E0B'; }
  else if (type === DisasterType.NUCLEAR_ACCIDENT) { symbol = '☢️'; color = '#10B981'; }
  else if (type === DisasterType.FLOOD) { symbol = '🌊'; color = '#3B82F6'; }
  else if (type === DisasterType.WILDFIRE) { symbol = '🔥'; color = '#EF4444'; }
  else if (type === DisasterType.EARTHQUAKE) { symbol = '🌋'; color = '#E11D48'; }

  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 44px; height: 44px; border: 2px solid ${color}; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.65;"></div>
        <div style="position: absolute; width: 32px; height: 32px; background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${color}; font-size: 15px;">
          ${symbol}
        </div>
        <div style="position: absolute; top: -14px; background: ${color}; color: #0f172a; font-size: 8px; font-weight: 900; font-family: monospace; padding: 1px 4px; border-radius: 3px; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          EPICENTER
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const DisasterMap: React.FC<DisasterMapProps> = ({ 
  simulationResult, 
  liveLocation,
  onSelectLocation,
  selectedTarget 
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeFocus, setActiveFocus] = useState<'epicenter' | 'target' | 'citizen' | null>(null);

  const defaultCenter: [number, number] = [19.1258, 73.0004]; // Navi Mumbai / User location
  
  const simLat = simulationResult?.event ? Number(simulationResult.event.latitude) : null;
  const simLng = simulationResult?.event ? Number(simulationResult.event.longitude) : null;
  const hasSim = simLat !== null && simLng !== null && !isNaN(simLat) && !isNaN(simLng);

  const center: [number, number] = activeFocus === 'citizen' && liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : activeFocus === 'target' && selectedTarget
      ? [selectedTarget.lat, selectedTarget.lng]
      : hasSim
        ? [simLat!, simLng!]
        : selectedTarget
          ? [selectedTarget.lat, selectedTarget.lng]
          : liveLocation
            ? [liveLocation.lat, liveLocation.lng]
            : defaultCenter;

  const simRadiusKm = simulationResult?.event?.affectedRadiusKm ? Number(simulationResult.event.affectedRadiusKm) : 15;
  const zoom = hasSim && activeFocus !== 'citizen'
    ? getZoomForRadius(simRadiusKm)
    : selectedTarget && !hasSim
      ? 12
      : 12;

  const color = simulationResult ? getDisasterColor(simulationResult.event.type) : '#EF4444';
  const radius = hasSim ? simRadiusKm * 1000 : 0; // in meters

  const handleMapClick = async (lat: number, lng: number) => {
    setActiveFocus('target');
    setIsResolving(true);
    const locName = await reverseGeocodeNominatim(lat, lng);
    setIsResolving(false);
    
    if (onSelectLocation) {
      onSelectLocation(lat, lng, locName);
    }
    setImportStatus(`Target: ${lat.toFixed(4)}, ${lng.toFixed(4)} (${locName})`);
    setTimeout(() => setImportStatus(null), 4500);
  };

  const handleImportCitizenLocation = () => {
    if (liveLocation) {
      setActiveFocus('citizen');
      handleMapClick(liveLocation.lat, liveLocation.lng);
    }
  };

  const handleFocusEpicenter = () => {
    if (hasSim) {
      setActiveFocus('epicenter');
    }
  };

  // Determine whether to display target marker (hide if right on epicenter to avoid overlapping clutter)
  const isTargetAtEpicenter = hasSim && selectedTarget && 
    Math.abs(selectedTarget.lat - simLat!) < 0.001 && 
    Math.abs(selectedTarget.lng - simLng!) < 0.001;

  return (
    <div className="tactical-card h-[400px] w-full p-0 overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0F172A', cursor: 'crosshair' }}
        zoomControl={false}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Tactical Target Marker placed by Commander Click/Touch */}
        {selectedTarget && !isTargetAtEpicenter && (
          <Marker position={[selectedTarget.lat, selectedTarget.lng]} icon={targetReticleIcon}>
            <Popup className="tactical-popup">
              <div className="bg-slate-900 text-slate-100 p-2 border border-red-500 rounded text-xs font-mono">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <Crosshair size={14} weight="bold" /> TARGET ACQUIRED
                </div>
                <div className="text-slate-200 mt-1 font-sans">{selectedTarget.locationName}</div>
                <div className="text-amber-400 mt-0.5">
                  {selectedTarget.lat.toFixed(5)}° N, {selectedTarget.lng.toFixed(5)}° E
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                  ✓ Coordinates auto-filled in Incident Form
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Citizen Live Pin on Admin Map */}
        {liveLocation && (
          <Marker position={[liveLocation.lat, liveLocation.lng]} icon={citizenMarkerIcon}>
            <Popup className="tactical-popup">
              <div className="bg-slate-900 text-slate-100 p-2 border border-blue-500 rounded text-xs">
                <div className="font-bold text-blue-400">📱 Citizen Live Field Device</div>
                <div className="text-slate-300 mt-0.5">{liveLocation.locationName}</div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                  {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Disaster Impact Zones & Epicenter Pin */}
        {hasSim && simulationResult && (
          <>
            {/* Outer Perimeter */}
            <Circle 
              center={[simLat!, simLng!]} 
              radius={radius} 
              pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15, weight: 1.5 }} 
            />
            {/* Mid High-Risk Zone */}
            <Circle 
              center={[simLat!, simLng!]} 
              radius={radius * 0.6} 
              pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.18, weight: 1.5 }} 
            />
            {/* Inner Core Danger Zone */}
            <Circle 
              center={[simLat!, simLng!]} 
              radius={radius * 0.25} 
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.28, weight: 2 }} 
            />

            {/* HIGH-TECH EPICENTER MARKER */}
            <Marker 
              position={[simLat!, simLng!]} 
              icon={createDisasterEpicenterIcon(simulationResult.event.type)}
            >
              <Popup className="tactical-popup">
                <div className="bg-slate-900 text-slate-100 p-2.5 border border-amber-500/80 rounded-xl text-xs max-w-xs shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1.5">
                    <span className="font-orbitron font-bold text-amber-400 text-sm">
                      {simulationResult.event.locationName}
                    </span>
                    <span className="text-[10px] font-mono font-black bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded">
                      {simulationResult.event.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans leading-tight mb-1.5">
                    {simulationResult.event.description}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-950/80 p-1.5 rounded border border-slate-800">
                    <div><span className="text-slate-500">TYPE:</span> <strong className="text-amber-300">{simulationResult.event.type}</strong></div>
                    <div><span className="text-slate-500">RADIUS:</span> <strong className="text-red-400">{simRadiusKm} km</strong></div>
                    <div><span className="text-slate-500">AFFECTED:</span> <strong className="text-cyan-400">{simulationResult.estimatedTotalAffected?.toLocaleString() || 'Surge'}</strong></div>
                    <div><span className="text-slate-500">SWARM:</span> <strong className="text-emerald-400">{Math.round((simulationResult.prismConfidence || 0.9) * 100)}% Conf</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Top Interactive Target Pin HUD */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur border border-border p-2 rounded-xl text-xs pointer-events-auto flex items-center gap-2 shadow-xl">
          <Crosshair size={16} className="text-red-400 animate-pulse" weight="bold" />
          <div className="font-mono text-[11px]">
            {isResolving ? (
              <span className="text-amber-400 animate-pulse">Resolving location name...</span>
            ) : importStatus ? (
              <span className="text-emerald-400 font-bold">{importStatus}</span>
            ) : selectedTarget ? (
              <span className="text-slate-200">
                <strong className="text-red-400">PIN:</strong> {selectedTarget.locationName} ({selectedTarget.lat.toFixed(4)}, {selectedTarget.lng.toFixed(4)})
              </span>
            ) : (
              <span className="text-slate-300">
                <strong className="text-amber-400">TOUCH / CLICK MAP:</strong> Place pin to import coordinates
              </span>
            )}
          </div>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {hasSim && (
            <button
              onClick={handleFocusEpicenter}
              className="bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg border border-red-400/50 transition-colors"
              title="Recenter map on disaster epicenter"
            >
              <Target size={13} weight="bold" />
              <span>Epicenter</span>
            </button>
          )}
          {liveLocation && (
            <button
              onClick={handleImportCitizenLocation}
              className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg border border-blue-400/50 transition-colors"
              title="Import live citizen device coordinates into target"
            >
              <MapPin size={13} weight="fill" />
              <span>Citizen GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-card/85 backdrop-blur border border-border p-2 rounded text-[10px] space-y-1">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Critical Core</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> High Risk</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Affected Perimeter</div>
      </div>
    </div>
  );
};

export default DisasterMap;
