import React, { useEffect } from 'react';
import { 
  Hourglass, 
  CheckCircle, 
  PlusCircle, 
  ShieldCheck, 
  XCircle,
  Robot
} from '@phosphor-icons/react';
import { EscapeTimerState } from '../../hooks/useEscapeSafetyTimer';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  timer: EscapeTimerState;
  onOpenAICall: () => void;
}

export const EscapeSafetyBanner: React.FC<Props> = ({ timer, onOpenAICall }) => {
  const { success: hapticSuccess, medium: hapticMedium, light: hapticLight, warning: hapticWarning } = useHaptics();

  // Trigger warning haptic when a warning becomes active
  useEffect(() => {
    if (timer.warningLevel === 'warning_2') {
      hapticWarning();
    } else if (timer.warningLevel === 'warning_1') {
      hapticWarning();
    }
  }, [timer.warningLevel]);

  if (!timer.isActive && timer.warningLevel === 'none') return null;

  const isWarning2 = timer.warningLevel === 'warning_2';
  const isWarning1 = timer.warningLevel === 'warning_1';

  return (
    <div className="space-y-2 mb-3">
      {/* 🔴 HIGH PRIORITY WARNING MODAL (When Warning 1 or 2 triggers) */}
      {timer.warningMessage && (
        <div className={`p-4 rounded-2xl border-2 shadow-2xl animate-fade-in ${
          isWarning2 
            ? 'bg-red-950/95 border-red-500 text-red-100 ring-4 ring-red-500/50' 
            : 'bg-amber-950/90 border-amber-500 text-amber-100 ring-2 ring-amber-500/30'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                isWarning2 ? 'bg-red-500 text-white animate-bounce' : 'bg-amber-500 text-slate-950'
              }`}>
                {isWarning2 ? '2' : '1'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest block font-bold text-amber-300">
                  {isWarning2 ? '🚨 FINAL SAFETY WARNING (60s LEFT)' : '⚠️ EVACUATION CHECK-IN (WARNING 1 OF 2)'}
                </span>
                <span className="text-sm font-extrabold text-white">
                  {isWarning2 ? 'Are You Safe? AI Call Dispatches in 60s' : 'Confirm You Are Still Escaping'}
                </span>
              </div>
            </div>

            <button 
              onClick={timer.dismissWarning}
              className="text-slate-400 hover:text-white"
            >
              <XCircle size={18} />
            </button>
          </div>

          <p className="text-xs mt-2 leading-relaxed opacity-95">
            {timer.warningMessage}
          </p>

          <div className="flex items-center gap-2 mt-3.5">
            <button
              onClick={() => {
                hapticSuccess();
                timer.confirmSafe();
              }}
              className="touch-tactile flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle size={16} weight="bold" />
              I AM SAFE / CHECK IN
            </button>

            <button
              onClick={() => {
                hapticMedium();
                timer.extendTimer(60);
              }}
              className="touch-tactile-sm px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 flex items-center gap-1"
            >
              <PlusCircle size={15} />
              +1 Min
            </button>

            <button
              onClick={() => {
                hapticMedium();
                onOpenAICall();
              }}
              className="touch-tactile px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              title="Call 108 immediately"
            >
              <Robot size={15} weight="bold" />
              Call 108
            </button>
          </div>
        </div>
      )}

      {/* ⏱️ PERSISTENT ESCAPE TIMER STATUS BAR */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-lg transition-colors ${
        isWarning2
          ? 'bg-red-950/60 border-red-500/80 text-red-200'
          : isWarning1
          ? 'bg-amber-950/50 border-amber-500/70 text-amber-200'
          : 'bg-slate-900/90 border-slate-800 text-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
            isWarning2
              ? 'bg-red-500/30 text-red-300 animate-pulse border border-red-500'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <Hourglass size={16} weight="bold" className="animate-spin" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>Evacuation Safety Watch</span>
              {timer.secondsRemaining <= 60 && (
                <span className="text-[9px] bg-red-500/30 text-red-300 font-bold px-1.5 py-0.2 rounded animate-pulse">
                  URGENT
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className="font-mono text-amber-400 font-extrabold">{timer.formattedTime}</span>
              <span className="text-slate-400 text-[11px]">until auto AI 108 call</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              hapticSuccess();
              timer.confirmSafe();
            }}
            className="touch-tactile px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1"
          >
            <ShieldCheck size={14} weight="bold" />
            I'm Safe
          </button>

          <button
            onClick={() => {
              hapticLight();
              timer.cancelTimer();
            }}
            className="touch-tactile-sm p-1.5 text-slate-500 hover:text-slate-300 text-xs"
            title="Cancel Watch"
          >
            <XCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
