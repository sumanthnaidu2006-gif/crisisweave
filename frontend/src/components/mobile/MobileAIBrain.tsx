import React from 'react';
import { 
  Brain, 
  Cpu, 
  CheckCircle, 
  ChartLineUp, 
  ArrowRight
} from '@phosphor-icons/react';
import { SimulationResult } from '../../types';

interface Props {
  simulationResult: SimulationResult | null;
  onLoadScenario: (id: string) => void;
  onSwitchToAdvanced: () => void;
  isLoading: boolean;
}

export const MobileAIBrain: React.FC<Props> = ({ 
  simulationResult, 
  onLoadScenario, 
  onSwitchToAdvanced,
  isLoading 
}) => {
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
      {/* PRISM Overview */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                PRISM AI Swarm
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
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

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          💡 <strong>What PRISM is doing right now:</strong> Reading flood gauges, calculating hospital beds, predicting which roads close in 2 hours, and routing evacuees before roads get submerged.
        </p>

        {/* Button to Switch to Advanced Tactical Dashboard */}
        <button
          onClick={onSwitchToAdvanced}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <ChartLineUp size={16} className="text-amber-400" />
          View Full Multi-Monitor Command Dashboard
          <ArrowRight size={14} />
        </button>
      </div>

      {/* HISTORICAL DISASTER CASE STUDIES */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu size={16} className="text-amber-400" />
            Historical Disaster Case Studies
          </h3>
          <span className="text-[10px] text-slate-500">Case Study Archive</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onLoadScenario('bhopal')}
            disabled={isLoading}
            className="p-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl block mb-1">🧪</span>
            <span className="text-xs font-bold text-amber-200 block truncate">Bhopal 1984</span>
            <span className="text-[9px] text-slate-400 block">Toxic Gas Leak</span>
          </button>

          <button
            onClick={() => onLoadScenario('chernobyl')}
            disabled={isLoading}
            className="p-3 bg-lime-950/40 hover:bg-lime-900/50 border border-lime-500/30 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl block mb-1">☢️</span>
            <span className="text-xs font-bold text-lime-200 block truncate">Chernobyl</span>
            <span className="text-[9px] text-slate-400 block">Nuclear Plume</span>
          </button>

          <button
            onClick={() => onLoadScenario('nepal_flood')}
            disabled={isLoading}
            className="p-3 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl block mb-1">🌊</span>
            <span className="text-xs font-bold text-cyan-200 block truncate">Nepal Flood</span>
            <span className="text-[9px] text-slate-400 block">Monsoon Surge</span>
          </button>
        </div>
      </div>

      {/* 10 AI AGENTS - SIMPLIFIED FOR HUMANS */}
      <div className="space-y-2">
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
      </div>
    </div>
  );
};
