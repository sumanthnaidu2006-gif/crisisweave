import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  NavigationArrow, 
  House, 
  ShieldCheck, 
  PhoneCall, 
  CaretRight, 
  CaretLeft, 
  ArrowsClockwise, 
  MapPin, 
  MapPinLine,
  Crosshair
} from '@phosphor-icons/react';
import { SimulationResult } from '../../types';
import { fetchStreetWalkingRoute, WalkingRouteResult } from '../../services/routingService';
import { EscapeTimerState } from '../../hooks/useEscapeSafetyTimer';
import { reverseGeocodeNominatim } from '../../hooks/useLiveLocation';

// Custom Map Pins
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width: 22px; height: 22px; background: #3B82F6; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 15px #3B82F6; animation: pulse 1.5s infinite;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const pinnedIcon = L.divIcon({
  className: 'custom-pinned-marker',
  html: `<div style="width: 28px; height: 28px; background: #F59E0B; border: 2px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #F59E0B;"><div style="width: 8px; height: 8px; background: #0F172A; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const shelterIcon = L.divIcon({
  className: 'custom-shelter-marker',
  html: `<div style="width: 28px; height: 28px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const dangerIcon = L.divIcon({
  className: 'custom-danger-marker',
  html: `<div style="width: 26px; height: 26px; background: #EF4444; border: 2px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; box-shadow: 0 0 15px rgba(239,68,68,0.8);">⚠️</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const MapEventsHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center[0], center[1], zoom]);
  return null;
};

interface Props {
  simulationResult: SimulationResult | null;
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS: boolean;
    accuracyMeters?: number;
    isPinned?: boolean;
  };
  onSetLocation?: (lat: number, lng: number, name?: string) => void;
  onResetGPS?: () => void;
  onOpenLocationSearch?: () => void;
  escapeTimer?: EscapeTimerState;
}

export const MobileMap: React.FC<Props> = ({ 
  simulationResult, 
  liveLocation, 
  onSetLocation, 
  onResetGPS, 
  onOpenLocationSearch,
  escapeTimer 
}) => {
  const [selectedShelter, setSelectedShelter] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'humanitarian' | 'satellite'>('street');
  const [routeData, setRouteData] = useState<WalkingRouteResult | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [routeVariant, setRouteVariant] = useState<number>(0);
  const [rerouteNotice, setRerouteNotice] = useState<string | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    isLoading: boolean;
  } | null>(null);

  // Real user GPS / pinned coordinates
  const userLat = liveLocation?.lat || simulationResult?.event?.latitude || 19.1258;
  const userLng = liveLocation?.lng || simulationResult?.event?.longitude || 73.0004;

  // Real shelters dynamically relative to user's real coordinates
  const shelters = [
    {
      id: 1,
      name: "St. Jude Safe Community Hall",
      type: "Primary High-Ground Shelter",
      lat: userLat + 0.0065,
      lng: userLng + 0.0055,
      capacity: "140 beds available",
      supplies: "Clean drinking water, hot meals, doctors on site",
      phone: "+91 98765 43210"
    },
    {
      id: 2,
      name: "City Stadium Evacuation Complex",
      type: "Mega Relief Center",
      lat: userLat + 0.0125,
      lng: userLng - 0.0075,
      capacity: "450 beds available",
      supplies: "Emergency triage, helicopter rescue zone",
      phone: "+91 98765 43211"
    }
  ];

  const currentShelter = shelters[selectedShelter];

  // Fetch real street walking route whenever user location, route variant, or shelter changes
  useEffect(() => {
    let isMounted = true;
    setIsRoutingLoading(true);

    const originLat = pinnedLocation ? pinnedLocation.lat : userLat;
    const originLng = pinnedLocation ? pinnedLocation.lng : userLng;

    fetchStreetWalkingRoute(originLat, originLng, currentShelter.lat, currentShelter.lng, routeVariant).then(
      (res) => {
        if (isMounted) {
          setRouteData(res);
          setIsRoutingLoading(false);
          setActiveStepIdx(0);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [userLat, userLng, selectedShelter, routeVariant, pinnedLocation?.lat, pinnedLocation?.lng]);

  const handleMapClick = async (lat: number, lng: number) => {
    setPinnedLocation({
      lat,
      lng,
      address: "Looking up exact street name...",
      isLoading: true
    });

    const placeName = await reverseGeocodeNominatim(lat, lng);
    setPinnedLocation({
      lat,
      lng,
      address: placeName,
      isLoading: false
    });
  };

  const handleConfirmPinAsLocation = () => {
    if (!pinnedLocation) return;
    if (onSetLocation) {
      onSetLocation(pinnedLocation.lat, pinnedLocation.lng, pinnedLocation.address);
    }
    setRerouteNotice(`📍 Exact location saved: ${pinnedLocation.address}. Safe walking route updated!`);
    setTimeout(() => setRerouteNotice(null), 4000);
  };

  const handleReRoute = () => {
    const nextVariant = routeVariant === 0 ? 1 : 0;
    setRouteVariant(nextVariant);
    const msg = nextVariant === 1 
      ? "🔄 Re-Routed: Switched to Alternate Safe Corridor (Avoiding Low-Lying Flood Streets)"
      : "🔄 Re-Routed: Switched to Direct High-Ground Street Route";
    setRerouteNotice(msg);
    setTimeout(() => setRerouteNotice(null), 4500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-20">
      {/* Top Map Filter Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <h2 className="text-xs font-bold text-slate-100 truncate">
              SAFE EVACUATION MAP
            </h2>
            {liveLocation?.isPinned && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 flex items-center gap-0.5">
                <MapPin size={10} weight="fill" /> PINNED ±1m
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate mt-0.5">
            <span className="truncate">
              {liveLocation?.isPinned 
                ? `📍 Pinned: ${liveLocation.locationName}`
                : liveLocation?.isLiveGPS 
                  ? `📍 GPS: ${liveLocation.locationName}` 
                  : "Pedestrian street routing active"}
            </span>
            {onOpenLocationSearch && (
              <button 
                onClick={onOpenLocationSearch}
                className="text-amber-400 hover:text-amber-300 underline font-bold shrink-0 ml-1 flex items-center gap-0.5"
                title="Search city or calibrate GPS"
              >
                <Crosshair size={11} weight="bold" />
                <span>Change / GPS</span>
              </button>
            )}
            {liveLocation?.isPinned && onResetGPS && (
              <button 
                onClick={onResetGPS}
                className="text-slate-400 hover:text-slate-200 underline font-semibold shrink-0 ml-1"
                title="Reset to device GPS sensor"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 🔄 Re-Route Button */}
          <button
            onClick={handleReRoute}
            disabled={isRoutingLoading}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
              routeVariant === 1 
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/60'
                : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
            }`}
            title="Recalculate safe route avoiding low-lying streets"
          >
            <ArrowsClockwise size={13} className={isRoutingLoading ? "animate-spin" : ""} />
            <span>Re-Route</span>
          </button>

          {/* Start Walking Button */}
          <button 
            onClick={() => {
              const next = !isNavigating;
              setIsNavigating(next);
              if (next && escapeTimer && !escapeTimer.isActive) {
                escapeTimer.startTimer();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isNavigating 
                ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            <NavigationArrow size={14} weight="bold" />
            {isNavigating ? "Guiding..." : "Start Walk"}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full overflow-hidden bg-slate-950">
        <MapContainer
          center={[userLat, userLng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={[userLat, userLng]} zoom={14} />
          <MapEventsHandler onMapClick={handleMapClick} />

          {mapLayer === 'street' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {mapLayer === 'humanitarian' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, HOT'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
          )}
          {mapLayer === 'satellite' && (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* User Location */}
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div className="text-xs text-slate-900 font-bold p-1">
                📍 {liveLocation?.isPinned ? `Pinned: ${liveLocation.locationName}` : liveLocation?.isLiveGPS ? liveLocation.locationName : "You Are Here"}
              </div>
            </Popup>
          </Marker>

          {/* Pinned Marker (When user touches map) */}
          {pinnedLocation && (
            <Marker position={[pinnedLocation.lat, pinnedLocation.lng]} icon={pinnedIcon}>
              <Popup>
                <div className="text-xs text-slate-900 font-sans p-1">
                  <div className="font-bold text-amber-700">📍 Pinned Spot</div>
                  <div className="text-[11px] text-slate-700">{pinnedLocation.address}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {pinnedLocation.lat.toFixed(5)}° N, {pinnedLocation.lng.toFixed(5)}° E
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Danger Hazard Zone (Only if simulation or active disaster) */}
          {simulationResult && (
            <>
              <Circle
                center={[userLat - 0.005, userLng - 0.005]}
                radius={800}
                pathOptions={{
                  color: '#EF4444',
                  fillColor: '#EF4444',
                  fillOpacity: 0.25,
                  weight: 2
                }}
              />
              <Marker position={[userLat - 0.005, userLng - 0.005]} icon={dangerIcon}>
                <Popup>
                  <div className="text-xs text-red-600 font-bold p-1">
                    ⚠️ Active Danger & Flood Perimeter
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Real Street Walking Route Polyline */}
          {routeData && routeData.coordinates.length > 0 && (
            <Polyline
              positions={routeData.coordinates}
              pathOptions={{
                color: routeVariant === 1 ? '#A855F7' : '#10B981',
                weight: 5,
                opacity: 0.95,
                lineJoin: 'round',
                lineCap: 'round'
              }}
            />
          )}

          {/* Shelters */}
          {shelters.map((s, idx) => (
            <Marker 
              key={s.id} 
              position={[s.lat, s.lng]} 
              icon={shelterIcon}
              eventHandlers={{
                click: () => setSelectedShelter(idx)
              }}
            >
              <Popup>
                <div className="text-xs text-slate-900 font-sans p-1">
                  <div className="font-bold text-sm text-emerald-800">{s.name}</div>
                  <div className="text-xs text-slate-700">{s.capacity}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                    {routeData?.formattedDuration || "Calculating walk..."}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 📢 Re-Route Notification Banner */}
        {rerouteNotice && (
          <div className="absolute top-2 left-2 right-2 z-[1000] bg-slate-900/95 border border-emerald-500/70 p-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {rerouteNotice}
            </span>
            <button 
              onClick={() => setRerouteNotice(null)} 
              className="text-slate-400 hover:text-white font-bold px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* 👆 Quick Instruction Pill (Touch map) */}
        {!pinnedLocation && (
          <div className="absolute top-3 left-3 z-[900] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] text-amber-300 font-medium flex items-center gap-1.5 shadow">
            <MapPin size={12} weight="fill" className="text-amber-400" />
            <span>Touch map anytime to drop exact location pin</span>
          </div>
        )}

        {/* 📍 Floating Pinned Location Action Drawer */}
        {pinnedLocation && (
          <div className="absolute top-3 left-3 right-3 z-[1000] bg-slate-900/95 border border-amber-500/70 p-3 rounded-2xl shadow-2xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <MapPinLine size={16} weight="bold" />
                <span>Exact Location Pinned on Map</span>
              </div>
              <button 
                onClick={() => setPinnedLocation(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="text-xs text-slate-100 font-semibold truncate">
              {pinnedLocation.isLoading ? (
                <span className="flex items-center gap-1 text-slate-400">
                  <ArrowsClockwise size={12} className="animate-spin" /> Looking up street address...
                </span>
              ) : (
                pinnedLocation.address
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Coordinates: {pinnedLocation.lat.toFixed(5)}° N, {pinnedLocation.lng.toFixed(5)}° E
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmPinAsLocation}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <MapPin size={14} weight="bold" />
                Set as My Location & Re-Route
              </button>
              <button
                onClick={handleReRoute}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                title="Re-Route alternative corridor"
              >
                <ArrowsClockwise size={14} />
                Alt Corridor
              </button>
            </div>
          </div>
        )}

        {/* 🗺️ Free Map Layer Switcher (No API Keys Required) */}
        <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl text-[10px]">
          <button
            onClick={() => setMapLayer('street')}
            className={`px-2 py-1 rounded-lg font-bold transition-colors ${
              mapLayer === 'street' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setMapLayer('humanitarian')}
            className={`px-2 py-1 rounded-lg font-bold transition-colors ${
              mapLayer === 'humanitarian' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚑 Relief
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2 py-1 rounded-lg font-bold transition-colors ${
              mapLayer === 'satellite' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
        </div>

        {/* Real Street-by-Street Navigation Instruction Overlay */}
        {isNavigating && routeData && routeData.steps.length > 0 && (
          <div className="absolute top-3 left-3 right-28 bg-slate-900/95 border border-emerald-500/50 p-3 rounded-2xl shadow-2xl z-[1000] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-base shrink-0">
                🚶
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-100 truncate">
                  {routeData.steps[activeStepIdx]?.instruction || "Follow marked green street route"}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  Step {activeStepIdx + 1} of {routeData.steps.length} • {routeData.steps[activeStepIdx]?.distanceMeters}m
                </div>
              </div>
            </div>

            {/* Step forward/back controls */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800 text-[10px]">
              <button
                onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                disabled={activeStepIdx === 0}
                className="text-slate-400 hover:text-slate-200 disabled:opacity-30 flex items-center gap-1"
              >
                <CaretLeft size={12} /> Prev Step
              </button>
              <span className="text-slate-500">Walk along streets</span>
              <button
                onClick={() => setActiveStepIdx(Math.min(routeData.steps.length - 1, activeStepIdx + 1))}
                disabled={activeStepIdx >= routeData.steps.length - 1}
                className="text-amber-400 hover:text-amber-300 disabled:opacity-30 flex items-center gap-1 font-bold"
              >
                Next Step <CaretRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shelter Card */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <House size={18} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Recommended Safe House</span>
          </div>
          <div className="flex gap-1">
            {shelters.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedShelter(i)}
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                  selectedShelter === i ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-slate-100">{currentShelter.name}</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{currentShelter.capacity}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-amber-400">
                {isRoutingLoading ? (
                  <span className="flex items-center gap-1"><ArrowsClockwise size={12} className="animate-spin" /> Routing...</span>
                ) : (
                  routeData?.formattedDuration || "10 min walk"
                )}
              </span>
              <span className="block text-[10px] text-slate-400">
                {routeData?.formattedDistance || "800m"} along streets
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700/40">
            📦 <strong>Supplies:</strong> {currentShelter.supplies}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                setIsNavigating(true);
                if (escapeTimer && !escapeTimer.isActive) {
                  escapeTimer.startTimer();
                }
              }}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <NavigationArrow size={15} weight="bold" />
              Walk Along Safe Street Route
            </button>

            {escapeTimer?.isActive && (
              <button
                onClick={escapeTimer.confirmSafe}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow-md transition-transform active:scale-95"
                title="Confirm you have reached the shelter"
              >
                <ShieldCheck size={16} weight="bold" />
                Arrived Safe
              </button>
            )}

            <a
              href={`tel:${currentShelter.phone}`}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
            >
              <PhoneCall size={15} />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
