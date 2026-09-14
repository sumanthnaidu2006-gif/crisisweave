import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  ShieldCheck, 
  CalendarCheck, 
  BellRinging, 
  Brain, 
  CheckCircle,
  ArrowsClockwise,
  Warning
} from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';
import { fetchLive14DayForecast, DayForecast, FourteenDayPrediction } from '../../services/forecastEngine';
import { saveAlert } from '../../services/alertStore';
import { SimulationResult } from '../../types';

interface Props {
  lat?: number;
  lng?: number;
  locationName?: string;
  simulationResult?: SimulationResult | null;
  onSelectDay?: (day: DayForecast) => void;
  compact?: boolean;
}

export const FourteenDayForecastView: React.FC<Props> = ({
  lat = 19.0760,
  lng = 72.8777,
  locationName = 'Current Region',
  simulationResult = null,
  onSelectDay
}) => {
  const [forecast, setForecast] = useState<FourteenDayPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [savedAlertIds, setSavedAlertIds] = useState<Set<number>>(new Set());

  const { success: hapticSuccess, light: hapticLight } = useHaptics();

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchLive14DayForecast(lat, lng, locationName, simulationResult);
    setForecast(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [lat, lng, locationName, simulationResult]);

  const selectedDay = forecast?.days.find(d => d.dayNumber === selectedDayNum) || forecast?.days[0];

  const handleSaveAlert = (alertItem: { dayNumber: number; title: string; severity: any; message: string; date: string }) => {
    hapticSuccess();
    saveAlert({
      title: `${alertItem.title} (${alertItem.date})`,
      type: simulationResult?.event?.type || 'WEATHER_ALERT',
      severity: alertItem.severity,
      location: locationName,
      advice: alertItem.message
    });
    setSavedAlertIds(prev => new Set(prev).add(alertItem.dayNumber));
  };

  const getSeverityBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MODERATE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  if (isLoading || !forecast) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
        <ArrowsClockwise size={28} className="text-amber-400 animate-spin" />
        <span className="text-xs font-bold text-slate-200">
          Connecting to Real-Time Satellite & Hydrology Sensors...
        </span>
        <span className="text-[10px] text-slate-400">
          Fetching live Open-Meteo 14-day atmospheric data for {locationName} ({lat.toFixed(4)}°, {lng.toFixed(4)}°)
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Status Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Real-Time 14-Day Weather & Hazard Forecast
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Satellite
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{locationName} • Open-Meteo Meteorological Feed</p>
            </div>
          </div>

          <button
            onClick={loadData}
            title="Refresh Live Forecast"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
          >
            <ArrowsClockwise size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Live Flood Threat Verification Banner */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
          forecast.floodThreatActive 
            ? 'bg-red-950/40 border-red-500/40 text-red-200' 
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}>
          {forecast.floodThreatActive ? (
            <Warning size={20} className="text-red-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{forecast.floodThreatActive ? 'FLOOD RISK DETECTED' : 'CURRENT STATUS: SAFE • ZERO FLOOD THREAT'}</span>
              <span className="text-[10px] font-mono opacity-80">
                Peak Rain: {forecast.maxPrecipitationMm}mm (Day {forecast.peakRiskDay})
              </span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {forecast.overallThreatSummary}
            </p>
          </div>
        </div>

        {/* Proactive Forecast Alerts (Derived from Real Meteorological Thresholds) */}
        <div className="pt-1">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BellRinging size={14} className="text-amber-400" />
            Active Swarm Advisories (Next 14 Days)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {forecast.cumulativeAlerts.map((alt) => {
              const isSaved = savedAlertIds.has(alt.dayNumber);
              return (
                <div
                  key={alt.dayNumber}
                  className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getSeverityBadge(alt.severity)}`}>
                        Day {alt.dayNumber} • {alt.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">{alt.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 line-clamp-2 leading-snug">{alt.message}</p>
                  </div>

                  <button
                    onClick={() => handleSaveAlert(alt)}
                    disabled={isSaved}
                    className={`touch-tactile shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isSaved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {isSaved ? 'Broadcasted' : 'Broadcast'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 14-Day Interactive Timeline Reel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Day-by-Day Forecast Timeline (Real Satellite Data)
          </span>
          <span className="text-[10px] text-slate-500">Tap any day to inspect real sensor readings</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {forecast.days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNum;
            const isCritical = day.hazardRisk === 'CRITICAL';
            const isHigh = day.hazardRisk === 'HIGH';

            return (
              <button
                key={day.dayNumber}
                onClick={() => {
                  hapticLight();
                  setSelectedDayNum(day.dayNumber);
                  onSelectDay?.(day);
                }}
                className={`touch-tactile shrink-0 w-24 p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 shadow-lg scale-105'
                    : isCritical
                    ? 'bg-red-950/30 border-red-500/40 hover:border-red-400'
                    : isHigh
                    ? 'bg-slate-900 border-amber-500/30 hover:border-amber-400/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400">
                  {day.dayName}
                </span>
                <span className="text-[9px] text-slate-500">
                  {day.dateLabel}
                </span>

                <span className="text-2xl my-0.5">{day.weatherIcon}</span>

                <span className="text-[10px] font-bold text-slate-200">
                  {day.tempMaxC}° / {day.tempMinC}°
                </span>

                <div className="w-full flex items-center justify-center gap-1 text-[9px] text-blue-400 font-mono">
                  <CloudRain size={10} />
                  <span>{day.rainfallMm}mm</span>
                </div>

                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase w-full truncate border ${getSeverityBadge(day.hazardRisk)}`}>
                  {day.hazardRisk}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Expanded Detail Card */}
      {selectedDay && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedDay.weatherIcon}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  Day {selectedDay.dayNumber}: {selectedDay.dayName} ({selectedDay.dateLabel})
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getSeverityBadge(selectedDay.hazardRisk)}`}>
                    {selectedDay.hazardRisk} RISK
                  </span>
                </h4>
                <p className="text-xs text-amber-400 font-medium">{selectedDay.weatherCondition}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Risk Trend</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {selectedDay.riskTrend}
              </span>
            </div>
          </div>

          {/* Atmospheric Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <CloudRain size={18} className="text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Rainfall</span>
                <span className="font-bold text-slate-200">{selectedDay.rainfallMm} mm</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind size={18} className="text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Wind Gusts</span>
                <span className="font-bold text-slate-200">{selectedDay.windSpeedKmh} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Thermometer size={18} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Temp & Hum</span>
                <span className="font-bold text-slate-200">{selectedDay.tempMaxC}°C / {selectedDay.humidityPercent}%</span>
              </div>
            </div>
          </div>

          {/* Predicted Milestones & Precautions */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Brain size={14} className="text-purple-400" />
              Specialist Agent Analysis ({selectedDay.agentSpecialist}):
            </h5>
            <ul className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {selectedDay.predictedEvents.map((evt, eIdx) => (
                <li key={eIdx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{evt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-400" />
              Actionable Guidance For People:
            </h5>
            <ul className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {selectedDay.recommendedPrecautions.map((prec, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2 text-emerald-300 text-[11px]">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
