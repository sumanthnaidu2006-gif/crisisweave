import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  FirstAid, 
  Drop, 
  Flashlight, 
  IdentificationBadge, 
  BatteryCharging, 
  Megaphone,
  Lifebuoy
} from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';

export const MobileGuidance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flood' | 'cbrn' | 'earthquake'>('flood');
  const { light: hapticLight, success: hapticSuccess } = useHaptics();
  const [checklist, setChecklist] = useState({
    water: false,
    meds: false,
    powerbank: false,
    docs: false,
    torch: false,
    whistle: false
  });

  // Load user checklist preference if saved, else default to all deselected
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crisisweave_gobag_checklist');
      if (saved) {
        try {
          setChecklist(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const toggleCheck = (item: keyof typeof checklist) => {
    const nextVal = !checklist[item];
    if (nextVal) {
      hapticSuccess();
    } else {
      hapticLight();
    }
    setChecklist(prev => {
      const updated = { ...prev, [item]: nextVal };
      if (typeof window !== 'undefined') {
        localStorage.setItem('crisisweave_gobag_checklist', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deselectAll = () => {
    hapticLight();
    const cleared = {
      water: false,
      meds: false,
      powerbank: false,
      docs: false,
      torch: false,
      whistle: false
    };
    setChecklist(cleared);
    if (typeof window !== 'undefined') {
      localStorage.setItem('crisisweave_gobag_checklist', JSON.stringify(cleared));
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Lifebuoy size={20} className="text-amber-400" />
          Life-Saving Guidelines
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simple survival instructions verified by disaster response agencies.
        </p>

        {/* Hazard Selector Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => {
              hapticLight();
              setActiveTab('flood');
            }}
            className={`touch-tactile-sm px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              activeTab === 'flood' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🌊 Flood & Cyclone
          </button>
          <button
            onClick={() => {
              hapticLight();
              setActiveTab('cbrn');
            }}
            className={`touch-tactile-sm px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              activeTab === 'cbrn' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🧪 Gas & Chemical
          </button>
          <button
            onClick={() => {
              hapticLight();
              setActiveTab('earthquake');
            }}
            className={`touch-tactile-sm px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              activeTab === 'earthquake' ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🏚️ Earthquake
          </button>
        </div>
      </div>

      {/* DOs & DONTs (Dead Simple) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-3">
          {activeTab === 'flood' && "🌊 Floods & Heavy Rain: Essential Rules"}
          {activeTab === 'cbrn' && "🧪 Toxic Gas / Chemical Leak: Essential Rules"}
          {activeTab === 'earthquake' && "🏚️ Earthquake: Essential Rules"}
        </h3>

        <div className="space-y-3 text-xs">
          {activeTab === 'flood' && (
            <>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                  DO THIS IMMEDIATELY:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• Turn off the main electrical breaker before water reaches outlets.</li>
                  <li>• Store 3 days of clean drinking water in sealed bottles.</li>
                  <li>• Move children, elderly, and medicines to the upper floor.</li>
                  <li>• Keep mobile phones charged in battery-saver mode.</li>
                </ul>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  <XCircle size={16} weight="fill" className="text-red-400" />
                  DO NOT DO THIS:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• NEVER walk or drive through moving floodwaters (15cm sweeps a car).</li>
                  <li>• Do not touch electrical cables or fallen utility poles.</li>
                  <li>• Do not drink tap or flood water — boil first.</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'cbrn' && (
            <>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                  DO THIS IMMEDIATELY:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• Cover mouth and nose with a damp cloth or wet towel.</li>
                  <li>• Close and tape all windows, doors, and AC vents (Shelter-in-place).</li>
                  <li>• Move crosswind or upwind — away from where the gas is blowing.</li>
                  <li>• Flush burning eyes immediately with cold, clean water.</li>
                </ul>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  <XCircle size={16} weight="fill" className="text-red-400" />
                  DO NOT DO THIS:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• Do not run downwind — you will breathe denser gas clouds.</li>
                  <li>• Do not use elevators or go to basements (gases are heavier than air).</li>
                  <li>• Do not eat uncovered food or drink exposed water.</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'earthquake' && (
            <>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" className="text-emerald-400" />
                  DROP, COVER & HOLD ON:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• Drop to your hands and knees under a sturdy desk or table.</li>
                  <li>• Cover your head and neck with your arms.</li>
                  <li>• If in bed, stay there and protect your head with a pillow.</li>
                  <li>• When shaking stops, take stairs (never elevators) to open ground.</li>
                </ul>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  <XCircle size={16} weight="fill" className="text-red-400" />
                  DO NOT DO THIS:
                </div>
                <ul className="space-y-1.5 text-slate-200">
                  <li>• Do not stand near glass windows, heavy mirrors, or hanging lamps.</li>
                  <li>• Do not rush into crowded stairwells during violent shaking.</li>
                  <li>• Do not light matches or gas stoves (risk of fractured gas pipes).</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CAN'T EVACUATE? PROTOCOLS */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Megaphone size={18} className="text-amber-400" />
          If You Cannot Evacuate
        </h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Follow these protocols until rescue teams reach your building:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">🚩</span>
            <div>
              <div className="font-bold text-slate-200">Signal for Help on Rooftop</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tie a bright red/orange cloth, sheet or torch to attract drone and helicopter rescue.</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">💧</span>
            <div>
              <div className="font-bold text-slate-200">Purify Rainwater</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Collect rainwater in clean containers. Boil for 1 minute or use chlorine purification tablets.</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/50 flex gap-2.5">
            <span className="text-base">🔋</span>
            <div>
              <div className="font-bold text-slate-200">Conserve Phone Battery</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Keep phone in Ultra Battery Saver mode. Use SMS instead of voice calls to keep bandwidth clear.</div>
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY GO-BAG CHECKLIST */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FirstAid size={18} className="text-emerald-400" />
            Quick Go-Bag Checklist
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {Object.values(checklist).filter(Boolean).length}/6 Packed
            </span>
            {Object.values(checklist).some(Boolean) && (
              <button
                onClick={deselectAll}
                className="text-[10px] text-slate-400 hover:text-amber-400 font-semibold underline transition-colors"
                title="Deselect all items"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => toggleCheck('water')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.water ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Drop size={18} />
            <span>Bottled Water</span>
          </button>

          <button
            onClick={() => toggleCheck('meds')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.meds ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <FirstAid size={18} />
            <span>Essential Meds</span>
          </button>

          <button
            onClick={() => toggleCheck('powerbank')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.powerbank ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <BatteryCharging size={18} />
            <span>Charged Powerbank</span>
          </button>

          <button
            onClick={() => toggleCheck('docs')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.docs ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <IdentificationBadge size={18} />
            <span>Govt IDs / Cash</span>
          </button>

          <button
            onClick={() => toggleCheck('torch')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.torch ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Flashlight size={18} />
            <span>Flashlight / Torch</span>
          </button>

          <button
            onClick={() => toggleCheck('whistle')}
            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors ${
              checklist.whistle ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Megaphone size={18} />
            <span>Whistle for Rescue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
