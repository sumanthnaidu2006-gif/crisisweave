import React from 'react';
import { 
  ShieldCheck, 
  Microphone, 
  MapPin, 
  SpeakerHigh, 
  CheckCircle, 
  XCircle, 
  CircleNotch,
  PhoneCall,
  Warning,
  X
} from '@phosphor-icons/react';
import { CallPermissionsState } from '../../hooks/useCallPermissions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetCallName?: string;
  permissions: CallPermissionsState;
  onAuthorizeAndProceed: () => Promise<void>;
  onProceedWithoutPermissions: () => void;
}

export const EmergencyCallPermissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetCallName = "108 Emergency Dispatch",
  permissions,
  onAuthorizeAndProceed,
  onProceedWithoutPermissions
}) => {
  if (!isOpen) return null;

  const { mic, gps, audio, isRequesting, hasAllGranted } = permissions;

  const renderStatusBadge = (state: string) => {
    switch (state) {
      case 'granted':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <CheckCircle size={12} weight="fill" />
            Granted
          </span>
        );
      case 'denied':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full">
            <XCircle size={12} weight="fill" />
            Denied
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Required
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/50 rounded-3xl p-5 flex flex-col shadow-2xl relative overflow-hidden text-left">
        
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-red-600/20 blur-3xl pointer-events-none" />

        {/* Top bar with close */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Call Permissions Setup
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border-2 border-red-500/80 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-600/30">
            <ShieldCheck size={28} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100 leading-tight">
              Authorize Emergency Call
            </h2>
            <p className="text-xs text-amber-400 font-medium">
              Target: {targetCallName}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          To ensure 108 rescue units receive your precise distress telemetry, please authorize the following device permissions:
        </p>

        {/* Permissions Items Checklist */}
        <div className="space-y-2.5 mb-5">
          {/* 🎙️ Microphone */}
          <div className="p-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                <Microphone size={18} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Microphone Access</div>
                <div className="text-[10px] text-slate-400">Live 2-way speech & AI voice triage</div>
              </div>
            </div>
            {renderStatusBadge(mic)}
          </div>

          {/* 📍 High Accuracy GPS */}
          <div className="p-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <MapPin size={18} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Precise GPS Location</div>
                <div className="text-[10px] text-slate-400">Exact coordinates sent to ambulance</div>
              </div>
            </div>
            {renderStatusBadge(gps)}
          </div>

          {/* 🔊 Audio / Speaker */}
          <div className="p-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <SpeakerHigh size={18} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Speaker & Audio Output</div>
                <div className="text-[10px] text-slate-400">Hear 108 operator voice clearly</div>
              </div>
            </div>
            {renderStatusBadge(audio)}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onAuthorizeAndProceed}
            disabled={isRequesting}
            className="touch-tactile w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-transform active:scale-95 disabled:opacity-70"
          >
            {isRequesting ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>Authorizing Device Permissions...</span>
              </>
            ) : hasAllGranted ? (
              <>
                <CheckCircle size={18} weight="fill" />
                <span>Connecting Emergency Call...</span>
              </>
            ) : (
              <>
                <PhoneCall size={18} weight="bold" />
                <span>Authorize All & Connect Call</span>
              </>
            )}
          </button>

          {/* Non-blocking safety fallback */}
          <button
            onClick={onProceedWithoutPermissions}
            className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Warning size={14} className="text-amber-400" />
            <span>Continue Call Without Permissions (Fallback)</span>
          </button>
        </div>

        <div className="mt-3 text-[10px] text-center text-slate-400">
          🔒 CrisisWeave strictly uses device permissions for real-time emergency triage.
        </div>

      </div>
    </div>
  );
};
