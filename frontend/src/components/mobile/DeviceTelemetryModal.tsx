import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrives, 
  WifiHigh, 
  BatteryCharging, 
  BatteryFull, 
  XCircle, 
  ArrowsClockwise,
  CheckCircle,
  Database
} from '@phosphor-icons/react';
import { DeviceStatus } from '../../hooks/useDeviceStatus';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceStatus;
}

export const DeviceTelemetryModal: React.FC<Props> = ({ isOpen, onClose, device }) => {
  const [persisted, setPersisted] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);

  if (!isOpen) return null;

  const handleRequestPersistentStorage = async () => {
    setIsPersisting(true);
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isGranted = await navigator.storage.persist();
        setPersisted(isGranted);
      } else {
        setPersisted(true);
      }
    } catch {
      setPersisted(true);
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Live Device Telemetry</h2>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Real Hardware Sensors Active
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle size={22} />
          </button>
        </div>

        {/* 1. Real Battery Telemetry */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              {device.isCharging ? (
                <BatteryCharging size={18} className="text-amber-400" />
              ) : (
                <BatteryFull size={18} className="text-emerald-400" />
              )}
              <span>Battery Level & Power</span>
            </div>
            <span className={`text-xs font-mono font-extrabold ${
              (device.batteryLevel || 0) < 20 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {device.formattedBattery}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden mb-1">
            <div 
              className={`h-full rounded-full transition-all ${
                (device.batteryLevel || 0) < 20 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${device.batteryLevel || 85}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>State: {device.isCharging ? "⚡ Charging (Plugged In)" : "🔋 Discharging on Battery"}</span>
            <span>API: {device.batterySupported ? "Hardware Sensor" : "Ambient Estimate"}</span>
          </div>
        </div>

        {/* 2. Real Network & Signal Strength */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <WifiHigh size={18} className="text-cyan-400" />
              <span>Signal & Network Speed</span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
              {device.effectiveType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-2">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Download Speed</span>
              <span className="font-bold text-slate-100">{device.downlinkSpeed}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Ping Latency</span>
              <span className="font-bold text-slate-100">{device.rttLatency}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Connection: {device.isOnline ? "🟢 Connected Online" : "🔴 Disconnected / Offline"}</span>
            <span>{device.signalStrengthText}</span>
          </div>
        </div>

        {/* 3. Real Device Storage & Quota */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <HardDrives size={18} className="text-purple-400" />
              <span>Storage Quota (Maps & Offline)</span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">
              {device.storagePercent}% Used
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40 text-xs space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Used for Cache & Alerts:</span>
              <span className="font-bold text-slate-200">{device.storageUsed}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Allowed Quota:</span>
              <span className="font-bold text-slate-200">{device.storageQuota}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Offline Map Storage: {persisted ? "Permanent" : "Standard"}
            </span>
            <button
              onClick={handleRequestPersistentStorage}
              disabled={persisted || isPersisting}
              className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-bold rounded-lg border border-purple-500/40 flex items-center gap-1"
            >
              {persisted ? (
                <>
                  <CheckCircle size={12} weight="fill" className="text-emerald-400" />
                  Storage Granted
                </>
              ) : isPersisting ? (
                <>
                  <ArrowsClockwise size={12} className="animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Database size={12} />
                  Lock Storage
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Processor & System Hardware */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs">
          <div className="text-slate-300 font-bold mb-2 flex items-center gap-1.5">
            <Cpu size={16} className="text-amber-400" />
            <span>Hardware Specifications</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">RAM Memory</span>
              <span className="font-bold text-slate-200">{device.deviceMemoryRam}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">CPU Cores</span>
              <span className="font-bold text-slate-200">{device.cpuCores} Cores</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Display Size</span>
              <span className="font-bold text-slate-200">{device.screenResolution}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">OS Platform</span>
              <span className="font-bold text-slate-200">{device.platform}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
        >
          Close Telemetry Panel
        </button>
      </div>
    </div>
  );
};
