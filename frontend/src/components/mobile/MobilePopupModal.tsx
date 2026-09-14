import React, { useEffect } from 'react';
import { 
  X, 
  Minus, 
  ArrowsOut, 
  Columns, 
  DeviceMobile 
} from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';
import { MobileApp } from './MobileApp';
import { SimulationResult, DisasterEvent } from '../../types';

interface MobilePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onSwitchMode: (mode: 'mobile' | 'desktop' | 'split') => void;
  simulationResult: SimulationResult | null;
  broadcast?: any;
  onSimulate: (event: DisasterEvent) => void;
  onLoadScenario: (id: string) => void;
  onClearAlert: () => void;
  isLoading: boolean;
}

export const MobilePopupModal: React.FC<MobilePopupModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  onSwitchMode,
  simulationResult,
  broadcast,
  onSimulate,
  onLoadScenario,
  onClearAlert,
  isLoading,
}) => {
  const { light: hapticLight, medium: hapticMedium } = useHaptics();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        hapticLight();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Card Container */}
      <div 
        className="relative flex flex-col items-center max-w-[460px] w-full max-h-[96vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar over Phone */}
        <div className="w-full max-w-[420px] mb-2 px-3 py-1.5 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-xl flex items-center justify-between backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <DeviceMobile size={15} className="text-amber-400" weight="bold" />
              <span className="text-xs font-bold text-slate-200 tracking-wide">
                Citizen Mobile App
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
              POPUP
            </span>
          </div>

          {/* Controls: Split, Fullscreen, Minimize, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                hapticMedium();
                onClose();
                onSwitchMode('split');
              }}
              title="Dock side-by-side (Combined Dual View)"
              className="touch-tactile-sm p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1 px-1.5"
            >
              <Columns size={14} weight="bold" />
              <span className="hidden sm:inline text-[11px]">Split</span>
            </button>

            <button
              onClick={() => {
                hapticMedium();
                onClose();
                onSwitchMode('mobile');
              }}
              title="Fullscreen Mobile View"
              className="touch-tactile-sm p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1 px-1.5"
            >
              <ArrowsOut size={14} weight="bold" />
              <span className="hidden sm:inline text-[11px]">Full</span>
            </button>

            {onMinimize && (
              <button
                onClick={() => {
                  hapticLight();
                  onMinimize();
                }}
                title="Minimize to floating widget"
                className="touch-tactile-sm p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Minus size={15} weight="bold" />
              </button>
            )}

            <button
              onClick={() => {
                hapticLight();
                onClose();
              }}
              title="Close popup (Explore Command Center)"
              className="touch-tactile-sm p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Realistic Smartphone Chassis */}
        <div className="relative w-full max-w-[420px] h-[82vh] max-h-[820px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-slate-700/60 overflow-hidden flex flex-col">
          {/* Top Notch / Speaker Grill Mockup */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black/90 px-4 py-1 rounded-full border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-cyan-500/60"></div>
            </div>
            <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          </div>

          {/* Interactive Mobile App View */}
          <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
            <MobileApp
              simulationResult={simulationResult}
              broadcast={broadcast}
              onSimulate={onSimulate}
              onLoadScenario={onLoadScenario}
              onClearAlert={onClearAlert}
              onSwitchToDesktop={() => {
                onClose();
                onSwitchMode('desktop');
              }}
              onSwitchMode={(mode) => {
                onClose();
                onSwitchMode(mode);
              }}
              isLoading={isLoading}
              embedded={true}
            />
          </div>

          {/* Bottom Home Swipe Bar Indicator */}
          <div className="h-3.5 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-600/60 rounded-full"></div>
          </div>
        </div>

        {/* Quick Hint / Close helper */}
        <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center gap-2">
          <span>Click outside or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">Esc</kbd> to view Command Center</span>
        </div>
      </div>
    </div>
  );
};
