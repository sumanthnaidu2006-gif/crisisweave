import React, { useState } from 'react';
import { 
  Brain, 
  Cpu, 
  CheckCircle, 
  ChartLineUp, 
  ArrowRight,
  ChatCircleDots,
  CalendarCheck,
  Sparkle
} from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';
import { SimulationResult } from '../../types';
import { AISwarmChat } from '../common/AISwarmChat';
import { FourteenDayForecastView } from '../common/FourteenDayForecastView';

interface Props {
  simulationResult: SimulationResult | null;
  onLoadScenario: (id: string) => void;
  onSwitchToAdvanced: () => void;
  isLoading: boolean;
  locationName?: string;
  lat?: number;
  lng?: number;
  initialSection?: 'qa' | 'forecast14' | 'agents' | 'cases';
}

export const MobileAIBrain: React.FC<Props> = ({ 
  simulationResult, 
  onLoadScenario, 
  onSwitchToAdvanced,
  isLoading,
  locationName = 'Current Location',
  lat = 19.0760,
  lng = 72.8777,
  initialSection = 'qa'
}) => {
  const [activeSection, setActiveSection] = useState<'qa' | 'forecast14' | 'agents' | 'cases'>(initialSection);
  const { medium: hapticMedium, light: hapticLight } = useHaptics();

  const currentLocation = simulationResult?.event?.locationName || locationName;
  const currentLat = simulationResult?.event?.latitude || lat;
  const currentLng = simulationResult?.event?.longitude || lng;

  // Simple human summaries for the agents
  const agentSummaries = [
    { name: "Meteorology Agent", icon: "🌦️", role: "Weather & Rain", status: "Rain peak passed; winds shifting NW" },
    { name: "Hydrology Agent", icon: "🌊", role: "Flood & River", status: "River cresting at 8 PM; 3 bridges at risk" },
    { name: "Healthcare Agent", icon: "🏥", role: "Hospitals & Meds", status: "City Hospital at 82% capacity; triage active" },
    { name: "Evacuation Agent", icon: "🚨", role: "Safe Corridors", status: "North Highway 44 cleared for evacuees" },
    { name: "Utilities Agent", icon: "⚡", role: "Power & Water", status: "Substation B shutdown to prevent short circuits" },
    { name: "Logistics Agent", icon: "📦", role: "Aid & Food", status: "24 aid trucks rerouted via eastern ring road" },
    { name: "CBRN / Toxins Agent", icon: "🧪", role: "Chemical Hazards", status: "No dangerous industrial leaks detected" },
    { name: "Radiation Agent", icon: "☢️", role: "Nuclear Safety", status: "Background radiation levels normal" },
    { name: "Early Warning Agent", icon: "📡", role: "Sensors & Radar", status: "48 IoT water gauges streaming real-time data" },
    { name: "International Agent", icon: "🌐", role: "UN & Red Cross", status: "Relief coordination frequency standby" }
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* PRISM Overview Header */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                PRISM AI Swarm
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold">
                  Gemini 1.5 Flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">10 Specialist AI Agents Coordinating Concurrently</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">
              {simulationResult?.prismConfidence ? Math.round(simulationResult.prismConfidence * 100) : 92}%
            </span>
            <span className="block text-[9px] text-slate-400 uppercase">Confidence</span>
          </div>
        </div>

        {/* Section Pill Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              hapticLight();
              setActiveSection('qa');
            }}
            className={`touch-tactile-sm py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeSection === 'qa'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ChatCircleDots size={16} />
            <span>Ask Swarm</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveSection('forecast14');
            }}
            className={`touch-tactile-sm py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeSection === 'forecast14'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck size={16} />
            <span>14-Day Outlook</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveSection('agents');
            }}
            className={`touch-tactile-sm py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeSection === 'agents'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={16} />
            <span>10 Agents</span>
          </button>

          <button
            onClick={() => {
              hapticLight();
              setActiveSection('cases');
            }}
            className={`touch-tactile-sm py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeSection === 'cases'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkle size={16} />
            <span>Case Studies</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: AI SWARM Q&A */}
      {activeSection === 'qa' && (
        <div className="space-y-3 animate-fadeIn">
          <AISwarmChat 
            lat={currentLat}
            lng={currentLng}
            locationName={currentLocation}
            simulationResult={simulationResult}
          />
        </div>
      )}

      {/* SECTION 2: 14-DAY PREDICTIVE WEATHER & HAZARD FORECAST */}
      {activeSection === 'forecast14' && (
        <div className="space-y-3 animate-fadeIn">
          <FourteenDayForecastView 
            lat={currentLat}
            lng={currentLng}
            locationName={currentLocation}
            simulationResult={simulationResult}
          />
        </div>
      )}

      {/* SECTION 3: 10 DOMAIN AGENTS */}
      {activeSection === 'agents' && (
        <div className="space-y-2 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            The 10 Domain Specialist Agents
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {agentSummaries.map((agent, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-3"
              >
                <div className="text-2xl shrink-0 mt-0.5">{agent.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{agent.name}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" />
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{agent.role}</div>
                  <div className="text-[11px] text-amber-300/90 mt-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/40">
                    {agent.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onSwitchToAdvanced}
            className="w-full mt-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <ChartLineUp size={16} className="text-amber-400" />
            View Full Multi-Monitor Command Dashboard
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* SECTION 4: HISTORICAL DISASTER CASE STUDIES */}
      {activeSection === 'cases' && (
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu size={16} className="text-amber-400" />
              Historical Disaster Case Studies
            </h3>
            <span className="text-[10px] text-slate-500">Benchmark Library</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Test the PRISM Swarm against famous real-world disasters to evaluate how modern AI predictions and evacuation corridors compare with historical response:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => {
                hapticMedium();
                onLoadScenario('bhopal');
              }}
              disabled={isLoading}
              className="touch-tactile p-3.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-left transition-all disabled:opacity-50 flex items-center gap-3"
            >
              <span className="text-3xl">🧪</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-200 block">Bhopal Gas Leak (1984)</span>
                <span className="text-[10px] text-slate-300 block">Toxic MIC gas plume, inversion layer, and emergency corridor test</span>
              </div>
              <ArrowRight size={16} className="text-amber-400" />
            </button>

            <button
              onClick={() => {
                hapticMedium();
                onLoadScenario('chernobyl');
              }}
              disabled={isLoading}
              className="touch-tactile p-3.5 bg-lime-950/40 hover:bg-lime-900/50 border border-lime-500/30 rounded-xl text-left transition-all disabled:opacity-50 flex items-center gap-3"
            >
              <span className="text-3xl">☢️</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-lime-200 block">Chernobyl Reactor 4 (1986)</span>
                <span className="text-[10px] text-slate-300 block">30km exclusion zone, radioactive fallout wind vectors, iodine distribution</span>
              </div>
              <ArrowRight size={16} className="text-lime-400" />
            </button>

            <button
              onClick={() => {
                hapticMedium();
                onLoadScenario('nepal_flood');
              }}
              disabled={isLoading}
              className="touch-tactile p-3.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl text-left transition-all disabled:opacity-50 flex items-center gap-3"
            >
              <span className="text-3xl">🌊</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-cyan-200 block">Nepal Monsoon Flood & Landslide (2024)</span>
                <span className="text-[10px] text-slate-300 block">Bagmati river overflow, bridge washouts, and rapid citizen warnings</span>
              </div>
              <ArrowRight size={16} className="text-cyan-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
