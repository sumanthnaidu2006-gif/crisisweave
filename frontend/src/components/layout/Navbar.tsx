import React from 'react';
import { ShieldCheck, DeviceMobile, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';

interface NavbarProps {
  onOpenMobilePopup?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenMobilePopup }) => {
  const [time, setTime] = React.useState(new Date().toUTCString());
  const { isEnabled: hapticsEnabled, toggle: toggleHaptics, medium: hapticMedium } = useHaptics();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="h-14 w-full bg-slate-950/95 border-b border-slate-800/90 backdrop-blur-md flex items-center justify-between px-4 fixed top-0 z-50">
      <div className="flex items-center gap-3">
        <ShieldCheck size={28} weight="fill" className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
        <h1 className="font-orbitron font-extrabold text-xl text-amber-400 tracking-wider">
          CRISISWEAVE
        </h1>
        <span className="text-xs text-slate-400 ml-2 hidden sm:block border-l border-slate-800 pl-3 font-medium">
          Anticipate · Analyze · Respond
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Haptics & Sensory Audio Toggle */}
        <button
          onClick={() => toggleHaptics()}
          className={`touch-tactile-sm flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            hapticsEnabled 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/40' 
              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title={hapticsEnabled ? "Haptics & Sensory Audio: Enabled (Click to mute)" : "Haptics & Sensory Audio: Muted (Click to enable)"}
        >
          {hapticsEnabled ? (
            <>
              <SpeakerHigh size={15} weight="bold" />
              <span className="hidden sm:inline font-bold">HAPTICS ON</span>
            </>
          ) : (
            <>
              <SpeakerSlash size={15} />
              <span className="hidden sm:inline font-bold">MUTED</span>
            </>
          )}
        </button>

        {onOpenMobilePopup && (
          <button
            onClick={() => {
              hapticMedium();
              onOpenMobilePopup();
            }}
            className="touch-tactile flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm"
            title="Pop up Citizen Mobile App"
          >
            <DeviceMobile size={16} weight="bold" />
            <span className="hidden sm:inline">Citizen Mobile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        )}

        <div className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 hidden md:block">
          {time}
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 status-pulse"></div>
          <span className="text-[11px] text-emerald-400 font-bold tracking-widest uppercase font-mono">SWARM LIVE</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
