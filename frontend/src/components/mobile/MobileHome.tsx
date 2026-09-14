import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Warning, 
  CheckCircle, 
  MapPin, 
  Broadcast, 
  FirstAid, 
  PaperPlaneTilt,
  BellRinging,
  CloudSun,
  XCircle,
  Robot,
  Hourglass
} from '@phosphor-icons/react';
import { SimulationResult, DisasterType, SeverityLevel } from '../../types';
import { saveAlert } from '../../services/alertStore';
import { useLiveWeather } from '../../hooks/useLiveWeather';
import { EscapeTimerState } from '../../hooks/useEscapeSafetyTimer';
import { DeviceStatus } from '../../hooks/useDeviceStatus';

interface Props {
  simulationResult: SimulationResult | null;
  onNavigateTab: (tab: string) => void;
  onTriggerAlert: (alertData: any) => void;
  onClearAlert: () => void;
  onTriggerAICall?: () => void;
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS: boolean;
  };
  escapeTimer?: EscapeTimerState;
  deviceStatus?: DeviceStatus;
}

export const MobileHome: React.FC<Props> = ({ 
  simulationResult, 
  onNavigateTab, 
  onTriggerAlert,
  onClearAlert,
  onTriggerAICall,
  liveLocation,
  escapeTimer,
  deviceStatus
}) => {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quickMsgSent, setQuickMsgSent] = useState<string | null>(null);

  const userLat = liveLocation?.lat || 19.1258;
  const userLng = liveLocation?.lng || 73.0004;
  const liveWeather = useLiveWeather(userLat, userLng);

  const hasActiveAlert = !!simulationResult;

  const handleSosClick = () => {
    if (sosActive) {
      setSosActive(false);
      setCountdown(null);
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setSosActive(true);
          // Automatically save SOS alert to history
          saveAlert({
            title: "Emergency Distress Beacon Activated",
            type: "CITIZEN_SOS",
            severity: "CRITICAL",
            location: liveLocation?.locationName || simulationResult?.event?.locationName || "Current GPS Location",
            advice: "User triggered SOS beacon. GPS location transmitted to rescue services."
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuickDistress = (msg: string) => {
    setQuickMsgSent(msg);
    saveAlert({
      title: "Distress Message Sent: " + msg,
      type: "SMS_BROADCAST",
      severity: "HIGH",
      location: liveLocation?.locationName || simulationResult?.event?.locationName || "Current GPS Location",
      advice: `Message: "${msg}" broadcast to emergency contacts and 108 helpline.`
    });
    setTimeout(() => setQuickMsgSent(null), 3500);
  };

  // Live Hazard Incident Reporting using Citizen's Actual Live Coordinates
  const reportLiveHazard = (type: DisasterType, name: string, advice: string) => {
    const locName = liveLocation?.locationName || "Current Location";
    const hazardEvent = {
      id: 'hazard-' + Date.now(),
      type: type,
      severity: SeverityLevel.HIGH,
      locationName: locName,
      latitude: userLat,
      longitude: userLng,
      affectedRadiusKm: 5,
      description: `Active ${name} emergency reported at ${locName}. Immediate citizen safety protocols activated.`,
      timestamp: new Date().toISOString()
    };

    // Save alert into persistent history
    saveAlert({
      title: `${name} Warning Issued`,
      type: type,
      severity: "HIGH",
      location: locName,
      advice: advice
    });

    onTriggerAlert(hazardEvent);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 🟢 PEACEFUL STATE: When NO disaster is active (Default Fresh Experience) */}
      {!hasActiveAlert ? (
        <div className="space-y-4">
          {/* Location & All-Clear Header */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck size={24} weight="fill" />
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <MapPin size={12} weight="bold" />
                  <span className="truncate max-w-[190px]">{liveLocation?.locationName || "Detecting Live GPS..."}</span>
                  {liveLocation?.isLiveGPS && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-mono shrink-0">
                      LIVE GPS
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-100">
                  All Clear — No Hazards Nearby
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded-full border border-emerald-500/30 shrink-0">
              Safe Zone
            </span>
          </div>

          {/* Calm Weather & Environmental Conditions */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CloudSun size={24} className="text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">
                  {liveWeather.isLoading ? 'Checking Live Weather...' : `${liveWeather.formattedTemp} • ${liveWeather.condition}`}
                </div>
                <div className="text-[11px] text-slate-400">
                  Wind: {liveWeather.windSpeed} • Humidity: {liveWeather.humidity} • Rivers: Normal
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Live Weather
              </span>
              {deviceStatus && (
                <span className="text-[9px] text-slate-400 font-mono">
                  {deviceStatus.isCharging ? '⚡' : ''}{deviceStatus.formattedBattery} • {deviceStatus.effectiveType}
                </span>
              )}
            </div>
          </div>

          {/* Simple Ready SOS Button */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl">
            <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
              Emergency Distress Button
            </div>

            <button
              onClick={handleSosClick}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all active:scale-95 ${
                sosActive
                  ? 'bg-red-600 ring-8 ring-red-500/50 animate-pulse'
                  : countdown !== null
                  ? 'bg-amber-600 ring-8 ring-amber-500/50'
                  : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 ring-4 ring-red-500/20 shadow-red-500/20'
              }`}
            >
              {countdown !== null ? (
                <div>
                  <span className="text-4xl font-black">{countdown}</span>
                  <span className="block text-[10px] font-medium mt-1">Tap to Cancel</span>
                </div>
              ) : sosActive ? (
                <div>
                  <Broadcast size={32} className="mx-auto animate-spin mb-1" />
                  <span className="text-xs font-bold">SOS SENT</span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-black tracking-wider">SOS</span>
                  <span className="block text-[10px] font-semibold text-red-100 mt-0.5">PRESS IN DANGER</span>
                </div>
              )}
            </button>

            <p className="text-[11px] text-slate-400 mt-4 max-w-xs">
              {sosActive 
                ? "🚨 Responders & family notified with live GPS." 
                : "Press only in case of personal danger or accident. Notifies 108 & family immediately."}
            </p>

            {sosActive && (
              <button
                onClick={() => setSosActive(false)}
                className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
              >
                Cancel False Alarm
              </button>
            )}
          </div>

          {/* 1-Tap Emergency Speed Dial */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1-Tap Emergency Call
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:108"
                className="p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-center flex flex-col items-center gap-1 transition-transform active:scale-95"
              >
                <span className="text-xl">🚑</span>
                <span className="text-xs font-bold text-red-200">108</span>
                <span className="text-[9px] text-slate-400">Ambulance</span>
              </a>

              <a
                href="tel:101"
                className="p-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-center flex flex-col items-center gap-1 transition-transform active:scale-95"
              >
                <span className="text-xl">🚒</span>
                <span className="text-xs font-bold text-amber-200">101</span>
                <span className="text-[9px] text-slate-400">Fire & Rescue</span>
              </a>

              <a
                href="tel:100"
                className="p-3 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 rounded-xl text-center flex flex-col items-center gap-1 transition-transform active:scale-95"
              >
                <span className="text-xl">👮</span>
                <span className="text-xs font-bold text-blue-200">100</span>
                <span className="text-[9px] text-slate-400">Police</span>
              </a>
            </div>
          </div>

          {/* 🚨 REPORT ACTIVE HAZARD & CITIZEN BROADCAST */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Broadcast size={15} className="text-red-400" weight="fill" />
                Report Active Hazard & Incident Alert
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Broadcast an immediate incident at your live GPS coordinates ({userLat.toFixed(4)}, {userLng.toFixed(4)}) to deploy the 10-Agent Swarm and activate shelter routing:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => reportLiveHazard(DisasterType.FLOOD, "Flash Flood", "Water levels rising. Move to 2nd floor or higher ground immediately.")}
                className="p-3 bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-left transition-colors"
              >
                <span className="text-base block mb-0.5">🌊</span>
                <span className="text-xs font-bold text-slate-200 block">Report Flash Flood</span>
                <span className="text-[10px] text-slate-400">Rising water / inundation</span>
              </button>

              <button
                onClick={() => reportLiveHazard(DisasterType.CHEMICAL_LEAK, "Gas Leak", "Toxic fumes detected. Cover mouth with wet towel and stay indoors.")}
                className="p-3 bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/50 rounded-xl text-left transition-colors"
              >
                <span className="text-base block mb-0.5">🧪</span>
                <span className="text-xs font-bold text-slate-200 block">Report Chemical Leak</span>
                <span className="text-[10px] text-slate-400">Toxic gas / fumes</span>
              </button>

              <button
                onClick={() => reportLiveHazard(DisasterType.CYCLONE, "Cyclone Warning", "High wind speeds approaching. Stay away from windows and power lines.")}
                className="p-3 bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-colors"
              >
                <span className="text-base block mb-0.5">🌀</span>
                <span className="text-xs font-bold text-slate-200 block">Report Cyclone Storm</span>
                <span className="text-[10px] text-slate-400">High wind & gale warning</span>
              </button>

              <button
                onClick={() => reportLiveHazard(DisasterType.EARTHQUAKE, "Earthquake Warning", "Tremors detected. Drop, cover under sturdy desk, hold on.")}
                className="p-3 bg-slate-800/80 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 rounded-xl text-left transition-colors"
              >
                <span className="text-base block mb-0.5">🏚️</span>
                <span className="text-xs font-bold text-slate-200 block">Report Earthquake</span>
                <span className="text-[10px] text-slate-400">Structural damage / tremor</span>
              </button>
            </div>

            {/* Evacuation Watch Trigger */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Hourglass size={14} weight="bold" />
                  3-Min Evacuation Watch
                </div>
                <div className="text-[10px] text-slate-400">
                  2 spoken warnings in 3 mins, then auto-dispatches AI voice distress call
                </div>
              </div>

              {escapeTimer?.isActive ? (
                <button
                  onClick={escapeTimer.confirmSafe}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 shrink-0"
                >
                  <ShieldCheck size={14} weight="bold" />
                  I'm Safe ({escapeTimer.formattedTime})
                </button>
              ) : (
                <button
                  onClick={escapeTimer?.startTimer}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-transform active:scale-95 shrink-0"
                >
                  <Hourglass size={14} weight="bold" />
                  Start Watch
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 🔴 ACTIVE EMERGENCY STATE: When an alert IS triggered */
        <div className="space-y-4">
          {/* Active Alert Banner with Clear Option */}
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-2xl text-red-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <div>
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    ACTIVE HAZARD DETECTED
                  </div>
                  <div className="text-base font-bold text-slate-100">
                    {simulationResult?.event?.type || "EMERGENCY"} WARNING
                  </div>
                </div>
              </div>

              <button
                onClick={onClearAlert}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1 transition-colors"
              >
                <XCircle size={14} />
                Clear Alert
              </button>
            </div>

            <div className="text-xs text-red-200 leading-relaxed bg-red-900/30 p-2.5 rounded-xl border border-red-500/20 flex items-start gap-2">
              <Warning size={18} className="text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Action Needed:</strong> {simulationResult?.publicAlertText || "Active hazard in your perimeter. Move to upper elevation or safe shelter immediately."}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Saved to Alert History</span>
              <button 
                onClick={() => onNavigateTab('alerts')}
                className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <BellRinging size={13} />
                View in Alert History →
              </button>
            </div>
          </div>

          {/* 🤖 AI VOICE CALL TO 108 (When stuck in disaster) */}
          <div className="p-3.5 bg-gradient-to-r from-red-950/70 to-purple-950/70 border border-red-500/50 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 font-bold shrink-0">
                <Robot size={22} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-100">Stuck & Cannot Speak?</div>
                <div className="text-[10px] text-red-300">AI calls 108 & speaks your GPS coordinates</div>
              </div>
            </div>

            <button
              onClick={onTriggerAICall}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/40 flex items-center gap-1.5 transition-transform active:scale-95 shrink-0 ml-2"
            >
              <Robot size={16} weight="bold" />
              AI Call 108
            </button>
          </div>

          {/* ⏱️ 3-MINUTE EVACUATION SAFETY WATCH (2 Warnings & Auto Call) */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <Hourglass size={20} weight="bold" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>3-Min Evacuation Watch</span>
                  {escapeTimer?.isActive && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded font-bold">
                      {escapeTimer.formattedTime}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  {escapeTimer?.isActive 
                    ? "2 warnings in 3 mins. Auto-calls 108 if not checked in." 
                    : "Counts down 3 mins. Auto-calls 108 if trapped."}
                </div>
              </div>
            </div>

            {escapeTimer?.isActive ? (
              <button
                onClick={escapeTimer.confirmSafe}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0 ml-2 transition-transform active:scale-95"
              >
                <ShieldCheck size={16} weight="bold" />
                I'm Safe
              </button>
            ) : (
              <button
                onClick={escapeTimer?.startTimer}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0 ml-2 transition-transform active:scale-95"
              >
                <Hourglass size={16} weight="bold" />
                Start Watch
              </button>
            )}
          </div>

          {/* BIG SOS IN ACTIVE EMERGENCY */}
          <div className="p-6 bg-slate-900 border border-red-500/40 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 animate-pulse">
              🚨 Active Danger Mode
            </div>

            <button
              onClick={handleSosClick}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all active:scale-95 ${
                sosActive
                  ? 'bg-red-600 ring-8 ring-red-500/50 animate-pulse'
                  : countdown !== null
                  ? 'bg-amber-600 ring-8 ring-amber-500/50'
                  : 'bg-gradient-to-br from-red-500 to-red-700 ring-4 ring-red-500/40 shadow-red-500/30'
              }`}
            >
              {countdown !== null ? (
                <div>
                  <span className="text-4xl font-black">{countdown}</span>
                  <span className="block text-[10px] font-medium mt-1">Tap to Cancel</span>
                </div>
              ) : sosActive ? (
                <div>
                  <Broadcast size={32} className="mx-auto animate-spin mb-1" />
                  <span className="text-xs font-bold">HELP DISPATCHED</span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-black tracking-wider">SOS</span>
                  <span className="block text-[10px] font-semibold text-red-100 mt-0.5">CALL RESCUE</span>
                </div>
              )}
            </button>

            <p className="text-[11px] text-slate-300 mt-4 max-w-xs">
              {sosActive 
                ? "🚨 Responders have received your GPS coordinates."
                : "Tap to broadcast your distress beacon to emergency services."}
            </p>
          </div>

          {/* Toast */}
          {quickMsgSent && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-xs text-amber-200 flex items-center gap-2">
              <CheckCircle size={16} className="text-amber-400 shrink-0" />
              <span>Alert sent and logged to history: <strong>"{quickMsgSent}"</strong></span>
            </div>
          )}

          {/* WHAT TO DO RIGHT NOW */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <FirstAid size={18} className="text-amber-400" />
              What Should I Do Right Now?
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <div className="font-bold text-slate-200">Move to 2nd Floor or High Ground</div>
                  <div className="text-[11px] text-slate-400">Do not remain on ground floor or in basements.</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <div className="font-bold text-slate-200">Pack Vital Bag</div>
                  <div className="text-[11px] text-slate-400">Medicines, water bottles, IDs, and powerbank.</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <div className="font-bold text-slate-200">Evacuate to Marked Shelter</div>
                  <div className="text-[11px] text-slate-400">St. Mary Shelter is 850m away with food and medical team.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('map')}
              className="w-full mt-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <MapPin size={16} weight="bold" />
              Open Safe Route on Map
            </button>
          </div>

          {/* 1-TAP DISTRESS MESSAGES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <PaperPlaneTilt size={16} className="text-red-400" />
              1-Tap Emergency Distress SMS
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDistress("I am trapped inside building - Need rescue")}
                className="p-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-left"
              >
                <span className="text-sm block">🚨</span>
                <span className="text-xs font-bold text-red-200 block">I am Trapped</span>
              </button>

              <button
                onClick={() => handleQuickDistress("Medical emergency - Someone injured")}
                className="p-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl text-left"
              >
                <span className="text-sm block">🏥</span>
                <span className="text-xs font-bold text-purple-200 block">Injured / Hurt</span>
              </button>

              <button
                onClick={() => handleQuickDistress("Surrounded by rising water - Rooftop rescue")}
                className="p-2.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl text-left"
              >
                <span className="text-sm block">🌊</span>
                <span className="text-xs font-bold text-cyan-200 block">Water Rising</span>
              </button>

              <button
                onClick={() => handleQuickDistress("Children here - Need drinking water & food")}
                className="p-2.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-left"
              >
                <span className="text-sm block">🍼</span>
                <span className="text-xs font-bold text-amber-200 block">Need Food/Water</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
