import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Crosshair, 
  MagnifyingGlass, 
  X, 
  CheckCircle, 
  CircleNotch,
  ArrowClockwise
} from '@phosphor-icons/react';
import { searchLocations, LiveLocation } from '../../hooks/useLiveLocation';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LiveLocation;
  onSetLocation: (lat: number, lng: number, name?: string) => Promise<void> | void;
  onRequestGPS: () => Promise<any>;
  onResetGPS: () => Promise<boolean> | void;
}

export const LocationSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLocation,
  onSetLocation,
  onRequestGPS,
  onResetGPS
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ lat: number; lng: number; displayName: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCalibratingGPS, setIsCalibratingGPS] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const { light: hapticLight, medium: hapticMedium, success: hapticSuccess } = useHaptics();

  // Quick preset Indian cities / districts for 1-tap testing & fast selection
  const quickPresets = [
    { name: "Bhimavaram", lat: 16.5449, lng: 81.5212 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480 },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090 }
  ];

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocations(query);
      setResults(res);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectResult = async (lat: number, lng: number, name: string) => {
    hapticSuccess();
    await onSetLocation(lat, lng, name);
    setFeedbackMsg(`Location locked to ${name.split(',')[0]}!`);
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1200);
  };

  const handleCalibrateGPS = async () => {
    hapticMedium();
    setIsCalibratingGPS(true);
    setFeedbackMsg("Requesting high-accuracy hardware GPS...");
    const res = await onRequestGPS();
    setIsCalibratingGPS(false);
    if (res) {
      hapticSuccess();
      setFeedbackMsg(`GPS locked successfully: ${res.locationName || 'Current Location'}`);
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1500);
    } else {
      setFeedbackMsg("GPS denied or unavailable. You can search your city below.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-2xl relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
        
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <MapPin size={16} weight="fill" />
            Location Accuracy & Calibration
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="text-base font-extrabold text-slate-100 mb-1">
          Set Your Precise Location
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Emergency dispatch, flood models, and safe routes need your exact address or town.
        </p>

        {/* Current Active Location Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Currently Selected
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              currentLocation.isPinned 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : currentLocation.isLiveGPS 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            }`}>
              {currentLocation.isPinned ? "📌 PINNED" : currentLocation.isLiveGPS ? "🎯 LIVE GPS" : "🌐 NETWORK IP"}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-200 truncate">
            {currentLocation.locationName}
          </div>
          <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
            Coordinates: {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
            {currentLocation.accuracyMeters && ` (±${currentLocation.accuracyMeters}m)`}
          </div>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="mb-4 p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle size={16} weight="fill" className="text-amber-400 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
        )}

        {/* Action 1: Instant Hardware GPS Locate */}
        <button
          onClick={handleCalibrateGPS}
          disabled={isCalibratingGPS}
          className="touch-tactile w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 mb-4"
        >
          {isCalibratingGPS ? (
            <>
              <CircleNotch size={18} className="animate-spin text-slate-950" />
              <span>Acquiring Satellite GPS Fix...</span>
            </>
          ) : (
            <>
              <Crosshair size={18} weight="bold" />
              <span>Detect My Exact Hardware GPS (Locate Me)</span>
            </>
          )}
        </button>

        {/* Action 2: Search by Name/City */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <MagnifyingGlass size={14} className="text-amber-400" />
            Search City, Town, or Local Area:
          </label>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Bhimavaram, Madhapur, Indiranagar..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors pr-8"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Results */}
        {isSearching && (
          <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CircleNotch size={14} className="animate-spin text-amber-400" />
            <span>Searching map database...</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Search Results
            </span>
            {results.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(r.lat, r.lng, r.displayName)}
                className="touch-tactile w-full p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left flex items-start gap-2.5 transition-colors"
              >
                <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {r.displayName.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {r.displayName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick presets */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Quick City Select (1-Tap):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(city.lat, city.lng, `${city.name}, India`)}
                className="touch-tactile-sm px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Reset */}
        {currentLocation.isPinned && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">Custom pin active</span>
            <button
              onClick={async () => {
                hapticLight();
                if (onResetGPS) await onResetGPS();
                onClose();
              }}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <ArrowClockwise size={13} />
              Reset to Auto GPS
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
