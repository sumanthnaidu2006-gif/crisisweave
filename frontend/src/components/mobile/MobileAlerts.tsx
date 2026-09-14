import React, { useState, useEffect } from 'react';
import { 
  BellRinging, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Waves, 
  Clock, 
  Trash,
  CheckCircle,
  ShieldCheck
} from '@phosphor-icons/react';
import { getStoredAlerts, clearAllAlerts } from '../../services/alertStore';
import { StoredAlert } from '../../types';
import { useLiveWeather } from '../../hooks/useLiveWeather';

interface Props {
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS: boolean;
  };
}

export const MobileAlerts: React.FC<Props> = ({ liveLocation }) => {
  const [alerts, setAlerts] = useState<StoredAlert[]>([]);
  const userLat = liveLocation?.lat || 17.3850;
  const userLng = liveLocation?.lng || 78.4867;
  const liveWeather = useLiveWeather(userLat, userLng);

  useEffect(() => {
    setAlerts(getStoredAlerts());
  }, []);

  const handleClearHistory = () => {
    clearAllAlerts();
    setAlerts([]);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Live Sensor Gauges */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CloudRain size={20} className="text-cyan-400" />
            Live Weather & Environmental Sensors
          </h2>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Online
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Thermometer size={16} className="text-amber-400" />
              <span>Live Temperature</span>
            </div>
            <div className="text-base font-bold text-slate-100 mt-1">
              {liveWeather.isLoading ? '...' : liveWeather.formattedTemp}
            </div>
            <div className="text-[10px] text-amber-300/90 truncate">{liveWeather.condition}</div>
          </div>

          <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CloudRain size={16} className="text-cyan-400" />
              <span>Precipitation</span>
            </div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              {liveWeather.isLoading ? '...' : liveWeather.precipitation}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Radar sensor</div>
          </div>

          <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wind size={16} className="text-purple-400" />
              <span>Wind Speed</span>
            </div>
            <div className="text-base font-bold text-slate-100 mt-1">
              {liveWeather.isLoading ? '...' : liveWeather.windSpeed}
            </div>
            <div className="text-[10px] text-slate-400">Live anemometer</div>
          </div>

          <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Waves size={16} className="text-blue-400" />
              <span>Humidity & Rivers</span>
            </div>
            <div className="text-base font-bold text-slate-100 mt-1">
              {liveWeather.isLoading ? '...' : liveWeather.humidity}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Safe River Level (1.8m)</div>
          </div>
        </div>
      </div>

      {/* 📥 STORED ALERTS & PAST NOTICES HISTORY */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRinging size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Stored Alert History
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              {alerts.length}
            </span>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash size={14} />
              Clear History
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800 text-xs space-y-1">
            <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-1" />
            <div className="font-semibold text-slate-300">No Disaster Alerts Recorded</div>
            <p className="text-[11px]">
              When any disaster happens or a test warning is triggered, a record is stored here so you never miss an alert.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                  item.severity === 'CRITICAL' || item.severity === 'HIGH'
                    ? 'bg-red-950/30 border-red-500/40 text-red-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{item.title}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {item.timestamp}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  {item.advice}
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-700/40">
                  <span>📍 {item.location}</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} weight="fill" />
                    Stored Locally
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIERED EARLY WARNING PROTOCOL GUIDE */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          How CrisisWeave Warns You Early
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">🟡</span>
            <div>
              <div className="font-bold text-yellow-300">1 to 2 Weeks Before (Watch)</div>
              <div className="text-[11px] text-slate-400">Tracks cyclone/hurricane formation in the ocean or heatwave pressure systems.</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">🟠</span>
            <div>
              <div className="font-bold text-amber-300">3 to 7 Days Before (Warning)</div>
              <div className="text-[11px] text-slate-400">Monsoon rainfall forecasts, river crest timelines, and emergency supply pre-positioning.</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">🔴</span>
            <div>
              <div className="font-bold text-red-300">24 to 72 Hours Before (Emergency)</div>
              <div className="text-[11px] text-slate-400">Mandatory evacuation orders, mass SMS to all phones, live cascade tracking.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
