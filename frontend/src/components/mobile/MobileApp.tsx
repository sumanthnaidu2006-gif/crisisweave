import React, { useState } from 'react';
import { 
  House, 
  MapPin, 
  Lifebuoy, 
  PhoneCall, 
  BellRinging, 
  Brain,
  DeviceMobile,
  Desktop,
  ArrowsClockwise,
  SpeakerHigh,
  SpeakerSlash
} from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';
import { SimulationResult, DisasterEvent } from '../../types';
import { MobileHome } from './MobileHome';
import { MobileMap } from './MobileMap';
import { MobileGuidance } from './MobileGuidance';
import { MobileContacts } from './MobileContacts';
import { MobileAlerts } from './MobileAlerts';
import { MobileAIBrain } from './MobileAIBrain';
import { AICallModal } from './AICallModal';
import { EscapeSafetyBanner } from './EscapeSafetyBanner';
import { DeviceTelemetryModal } from './DeviceTelemetryModal';
import { EmergencySyncBanner } from '../common/EmergencySyncBanner';
import { ControllerBroadcast } from '../../services/syncService';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import { useEscapeSafetyTimer } from '../../hooks/useEscapeSafetyTimer';
import { useCallPermissions } from '../../hooks/useCallPermissions';
import { EmergencyCallPermissionModal } from './EmergencyCallPermissionModal';
import { LocationSearchModal } from '../common/LocationSearchModal';

interface Props {
  simulationResult: SimulationResult | null;
  broadcast?: ControllerBroadcast | null;
  onSimulate: (event: DisasterEvent) => void;
  onLoadScenario: (id: string) => void;
  onClearAlert: () => void;
  onSwitchToDesktop: () => void;
  onSwitchMode?: (mode: 'mobile' | 'desktop' | 'split') => void;
  isLoading: boolean;
  compactView?: boolean;
  embedded?: boolean;
}

export const MobileApp: React.FC<Props> = ({
  simulationResult,
  broadcast,
  onSimulate,
  onLoadScenario,
  onClearAlert,
  onSwitchToDesktop,
  onSwitchMode,
  isLoading,
  compactView = false,
  embedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'guidance' | 'contacts' | 'alerts' | 'brain'>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isAICallOpen, setIsAICallOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [autoTriggerReason, setAutoTriggerReason] = useState<string | null>(null);

  // Call Permissions Manager (Zero prompts at startup, full authorization on call)
  const { permissions, requestCallPermissions } = useCallPermissions();
  const [pendingCall, setPendingCall] = useState<{ number: string; name: string; isAI?: boolean } | null>(null);
  const [isCallPermissionModalOpen, setIsCallPermissionModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const liveLocation = useLiveLocation();
  const deviceStatus = useDeviceStatus();
  const { isEnabled: hapticsEnabled, toggle: toggleHaptics, light: hapticLight, medium: hapticMedium } = useHaptics();

  const handleInitiateCall = (target: { number: string; name: string; isAI?: boolean }) => {
    // If all required call permissions are already granted, proceed immediately
    if (permissions.hasAllGranted) {
      if (target.isAI) {
        setAutoTriggerReason(null);
        setIsAICallOpen(true);
      } else {
        window.location.href = `tel:${target.number}`;
      }
      return;
    }

    // Otherwise, show the emergency call permissions authorization modal
    setPendingCall(target);
    setIsCallPermissionModalOpen(true);
  };

  const handleAuthorizeCallPermissions = async () => {
    // Request microphone, precise device GPS, and audio context in one unified interaction
    await requestCallPermissions(liveLocation.requestDeviceGPS);
    setIsCallPermissionModalOpen(false);

    if (pendingCall?.isAI) {
      setIsAICallOpen(true);
    } else if (pendingCall?.number) {
      window.location.href = `tel:${pendingCall.number}`;
    }
  };

  const handleProceedWithoutPermissions = () => {
    setIsCallPermissionModalOpen(false);
    if (pendingCall?.isAI) {
      setIsAICallOpen(true);
    } else if (pendingCall?.number) {
      window.location.href = `tel:${pendingCall.number}`;
    }
  };

  const escapeTimer = useEscapeSafetyTimer((reason) => {
    setAutoTriggerReason(reason);
    handleInitiateCall({ number: '108', name: '108 Automatic Evacuation Timeout Dispatch', isAI: true });
  }, liveLocation.locationName);

  const hasActiveAlert = !!simulationResult;

  return (
    <div className={`bg-slate-950 text-slate-100 flex flex-col items-center ${
      embedded ? 'w-full h-full' : compactView ? 'w-full h-full' : isPhoneFrame ? 'min-h-screen py-2 md:py-5' : 'min-h-screen'
    }`}>
      {/* Top Device View Mode Switcher (When not in split or embedded view) */}
      {!compactView && !embedded && (
        <div className="hidden md:flex items-center gap-2 mb-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300 shadow-xl">
          <span className="font-semibold text-amber-400">View:</span>
          <button
            onClick={() => onSwitchMode?.('mobile')}
            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center gap-1.5 shadow"
          >
            <DeviceMobile size={14} />
            Citizen App
          </button>
          <button
            onClick={() => onSwitchMode ? onSwitchMode('desktop') : onSwitchToDesktop()}
            className="px-2.5 py-1 hover:bg-slate-800 text-slate-300 font-medium rounded-full flex items-center gap-1.5 transition-colors"
          >
            <Desktop size={14} />
            Command Center
          </button>
          <button
            onClick={() => onSwitchMode?.('split')}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-full flex items-center gap-1.5 transition-colors"
          >
            ⚡ Combined Dual-View
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded"
          >
            {isPhoneFrame ? "Full Width" : "Phone Frame"}
          </button>
        </div>
      )}

      {/* Main Mobile App Container */}
      <div 
        className={`w-full bg-slate-950 flex flex-col relative overflow-hidden transition-all ${
          embedded
            ? 'w-full h-full'
            : compactView 
            ? 'max-w-[420px] h-[820px] rounded-[40px] border-[8px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50'
            : isPhoneFrame 
            ? 'max-w-md h-[94vh] md:h-[844px] md:rounded-[44px] border-0 md:border-[10px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50' 
            : 'max-w-2xl min-h-screen border-x border-slate-800'
        }`}
      >
        {/* Mobile Phone Status Bar & Header */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 pt-3 pb-2.5 shrink-0 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-black tracking-widest text-sm font-orbitron">
                ⚡ CRISISWEAVE
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                hasActiveAlert 
                  ? 'bg-red-600/20 text-red-400 border-red-600/30 animate-pulse'
                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30'
              }`}>
                {hasActiveAlert ? 'HAZARD DETECTED' : 'SYSTEM SAFE'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {liveLocation.accuracyMeters ? `GPS ±${Math.round(liveLocation.accuracyMeters)}m` : 'Live GPS'}
              </span>
              <span>•</span>
              {/* Sensory Haptic Toggle Button */}
              <button
                onClick={() => toggleHaptics()}
                className={`touch-tactile-sm p-1 rounded-lg border transition-colors ${
                  hapticsEnabled 
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40' 
                    : 'bg-slate-900 text-slate-500 border-slate-700'
                }`}
                title={hapticsEnabled ? "Haptics & Sensory Feedback: Enabled (Tap to mute)" : "Haptics & Sensory Feedback: Muted (Tap to enable)"}
              >
                {hapticsEnabled ? <SpeakerHigh size={13} weight="bold" /> : <SpeakerSlash size={13} />}
              </button>
              <span>•</span>
              {/* Real Phone Battery & Signal (Opens Detailed Telemetry & Storage Modal) */}
              <button 
                onClick={() => {
                  hapticMedium();
                  setIsTelemetryOpen(true);
                }}
                className="touch-tactile-sm flex items-center gap-1.5 hover:bg-slate-800 transition-colors bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700/70"
                title="Tap to inspect phone battery, signal speed, storage quota, and RAM"
              >
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  📶 {deviceStatus.effectiveType}
                </span>
                <span className="text-slate-600">|</span>
                <span className={`text-[10px] font-mono font-bold ${
                  (deviceStatus.batteryLevel || 0) < 20 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {deviceStatus.isCharging ? '⚡' : ''}{deviceStatus.formattedBattery} 🔋
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
          {/* 🚨 OFFICIAL CONTROLLER LIVE EMERGENCY BROADCAST BANNER */}
          {broadcast && (
            <div className="mb-3">
              <EmergencySyncBanner 
                broadcast={broadcast}
                onDismiss={() => {}}
                onNavigateToMap={() => setActiveTab('map')}
              />
            </div>
          )}

          {/* ⏱️ 3-MINUTE EVACUATION ESCAPE SAFETY WATCH BANNER & 2 WARNINGS */}
          <EscapeSafetyBanner 
            timer={escapeTimer} 
            onOpenAICall={() => {
              handleInitiateCall({ number: '108', name: '108 AI Emergency Dispatch', isAI: true });
            }} 
          />

          {isLoading && (
            <div className="p-3 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-300 animate-pulse">
              <ArrowsClockwise size={16} className="animate-spin" />
              <span>Simulating crisis swarm with PRISM AI...</span>
            </div>
          )}

          {activeTab === 'home' && (
            <MobileHome 
              simulationResult={simulationResult}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onTriggerAlert={(mockEvent) => onSimulate(mockEvent)}
              onClearAlert={onClearAlert}
              onTriggerAICall={() => {
                handleInitiateCall({ number: '108', name: '108 AI Emergency Dispatch', isAI: true });
              }}
              onInitiateCall={handleInitiateCall}
              liveLocation={liveLocation}
              escapeTimer={escapeTimer}
              deviceStatus={deviceStatus}
              onOpenLocationSearch={() => setIsLocationModalOpen(true)}
            />
          )}

          {activeTab === 'map' && (
            <MobileMap 
              simulationResult={simulationResult} 
              liveLocation={liveLocation}
              onSetLocation={(lat, lng, name) => liveLocation.setManualPin(lat, lng, name)}
              onResetGPS={() => liveLocation.resetToDeviceGPS()}
              onOpenLocationSearch={() => setIsLocationModalOpen(true)}
              escapeTimer={escapeTimer}
            />
          )}

          {activeTab === 'guidance' && (
            <MobileGuidance />
          )}

          {activeTab === 'contacts' && (
            <MobileContacts 
              onTriggerAICall={() => {
                handleInitiateCall({ number: '108', name: '108 AI Emergency Dispatch', isAI: true });
              }} 
              onInitiateCall={handleInitiateCall}
            />
          )}

          {activeTab === 'alerts' && (
            <MobileAlerts liveLocation={liveLocation} />
          )}

          {activeTab === 'brain' && (
            <MobileAIBrain 
              simulationResult={simulationResult}
              onLoadScenario={onLoadScenario}
              onSwitchToAdvanced={onSwitchToDesktop}
              isLoading={isLoading}
              locationName={liveLocation.locationName}
              lat={liveLocation.lat}
              lng={liveLocation.lng}
            />
          )}
        </div>

        {/* 📍 Precision Location Search & GPS Calibration Modal */}
        <LocationSearchModal 
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={liveLocation}
          onSetLocation={(lat, lng, name) => liveLocation.setManualPin(lat, lng, name)}
          onRequestGPS={liveLocation.requestDeviceGPS}
          onResetGPS={liveLocation.resetToDeviceGPS}
        />

        {/* 🛡️ Emergency Call Permissions Authorization Gate Modal */}
        <EmergencyCallPermissionModal 
          isOpen={isCallPermissionModalOpen}
          onClose={() => {
            setIsCallPermissionModalOpen(false);
            setPendingCall(null);
          }}
          targetCallName={pendingCall?.name || "108 Emergency Dispatch"}
          permissions={permissions}
          onAuthorizeAndProceed={handleAuthorizeCallPermissions}
          onProceedWithoutPermissions={handleProceedWithoutPermissions}
        />

        {/* AI Voice Call Modal (Simulates or Auto-Dispatches to 108) */}
        <AICallModal 
          isOpen={isAICallOpen} 
          onClose={() => {
            setIsAICallOpen(false);
            setAutoTriggerReason(null);
          }} 
          disasterName={simulationResult?.event?.type || "Flood / Disaster Hazard"}
          locationName={liveLocation.locationName}
          isAutoTriggered={!!autoTriggerReason}
          reason={autoTriggerReason || undefined}
          batteryLevel={deviceStatus.batteryLevel}
          signalStrength={deviceStatus.signalStrengthText}
          lat={liveLocation.lat}
          lng={liveLocation.lng}
          accuracyMeters={liveLocation.accuracyMeters}
          micAuthorized={permissions.mic === 'granted'}
          gpsAuthorized={permissions.gps === 'granted' || liveLocation.isLiveGPS}
        />

        {/* Live Device Hardware & Storage Telemetry Modal */}
        <DeviceTelemetryModal 
          isOpen={isTelemetryOpen} 
          onClose={() => setIsTelemetryOpen(false)} 
          device={deviceStatus} 
        />

        {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
        <nav className="sticky bottom-0 bg-slate-900/95 border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-30 backdrop-blur-md shadow-lg">
          <button
            onClick={() => {
              hapticLight();
              setActiveTab('home');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'home' ? 'text-red-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <House size={22} weight={activeTab === 'home' ? 'fill' : 'regular'} />
            <span className="text-[10px]">SOS</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveTab('map');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'map' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin size={22} weight={activeTab === 'map' ? 'fill' : 'regular'} />
            <span className="text-[10px]">Safe Map</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveTab('guidance');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'guidance' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lifebuoy size={22} weight={activeTab === 'guidance' ? 'fill' : 'regular'} />
            <span className="text-[10px]">Guidance</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveTab('contacts');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'contacts' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall size={22} weight={activeTab === 'contacts' ? 'fill' : 'regular'} />
            <span className="text-[10px]">Emergency</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveTab('alerts');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'alerts' ? 'text-purple-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRinging size={22} weight={activeTab === 'alerts' ? 'fill' : 'regular'} />
            <span className="text-[10px]">Alerts</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveTab('brain');
            }}
            className={`touch-tactile-sm flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              activeTab === 'brain' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain size={22} weight={activeTab === 'brain' ? 'fill' : 'regular'} />
            <span className="text-[10px]">AI Swarm</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
