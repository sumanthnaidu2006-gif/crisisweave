import React, { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair } from '@phosphor-icons/react';
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

// Helper component to change view when location changes
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
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

const DisasterMap: React.FC<DisasterMapProps> = ({ 
  simulationResult, 
  liveLocation,
  onSelectLocation,
  selectedTarget 
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const defaultCenter: [number, number] = [19.1258, 73.0004]; // Navi Mumbai / User location
  const center: [number, number] = simulationResult 
    ? [simulationResult.event.latitude, simulationResult.event.longitude]
    : selectedTarget
      ? [selectedTarget.lat, selectedTarget.lng]
      : liveLocation
        ? [liveLocation.lat, liveLocation.lng]
        : defaultCenter;

  const color = simulationResult ? getDisasterColor(simulationResult.event.type) : '#EF4444';
  const radius = simulationResult ? simulationResult.event.affectedRadiusKm * 1000 : 0; // in meters

  const handleMapClick = async (lat: number, lng: number) => {
    setIsResolving(true);
    const locName = await reverseGeocodeNominatim(lat, lng);
    setIsResolving(false);
    
    if (onSelectLocation) {
      onSelectLocation(lat, lng, locName);
    }
    setImportStatus(`Target Loaded: ${lat.toFixed(4)}, ${lng.toFixed(4)} (${locName})`);
    setTimeout(() => setImportStatus(null), 4500);
  };

  const handleImportCitizenLocation = () => {
    if (liveLocation) {
      handleMapClick(liveLocation.lat, liveLocation.lng);
    }
  };

  return (
    <div className="tactical-card h-[400px] w-full p-0 overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={simulationResult ? 10 : 12} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0F172A', cursor: 'crosshair' }}
        zoomControl={false}
      >
        <ChangeView center={center} zoom={simulationResult ? 10 : 12} />
        <MapClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Tactical Target Marker placed by Admin Click/Touch */}
        {selectedTarget && (
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

        {/* Disaster Impact Zones */}
        {simulationResult && (
          <>
            {/* Outer Zone */}
            <Circle 
              center={center} 
              radius={radius} 
              pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15, weight: 1 }} 
            />
            {/* Mid Zone */}
            <Circle 
              center={center} 
              radius={radius * 0.6} 
              pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.15, weight: 1 }} 
            />
            {/* Inner Zone */}
            <Circle 
              center={center} 
              radius={radius * 0.2} 
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.2, weight: 2 }} 
            >
              <Popup className="tactical-popup">
                <div className="bg-card text-foreground p-2 border border-border rounded">
                  <h3 className="font-orbitron font-bold text-primary">{simulationResult.event.locationName}</h3>
                  <p className="text-sm">Type: {simulationResult.event.type}</p>
                  <p className="text-sm">Severity: {simulationResult.event.severity}</p>
                </div>
              </Popup>
            </Circle>
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

        {/* 1-Tap Quick Import Citizen Live Location */}
        {liveLocation && (
          <button
            onClick={handleImportCitizenLocation}
            className="pointer-events-auto bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg border border-blue-400/50 transition-colors"
            title="Import live citizen device coordinates into target"
          >
            <MapPin size={14} weight="fill" />
            <span>Import Citizen GPS</span>
          </button>
        )}
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
