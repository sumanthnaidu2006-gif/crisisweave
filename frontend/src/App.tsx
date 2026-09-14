import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ScenarioSelector from './components/scenarios/ScenarioSelector';
import { MobileApp } from './components/mobile/MobileApp';
import { SimulationResult, DisasterEvent } from './types';
import { fetchScenarios, fetchScenario, runSimulation } from './services/api';
import { ChartLineUp, MapTrifold, Info, DeviceMobile, Desktop, Columns } from '@phosphor-icons/react';

import { saveAlert } from './services/alertStore';
import { useLiveLocation } from './hooks/useLiveLocation';

type Tab = 'dashboard' | 'scenarios' | 'about';
type AppMode = 'mobile' | 'desktop' | 'split';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('split'); // Default to Combined View so user immediately sees both!
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const liveLocation = useLiveLocation();

  useEffect(() => {
    // Fresh state on first open: load scenarios metadata only without forcing active disaster
    const loadInitialData = async () => {
      setIsLoading(true);
      const scens = await fetchScenarios();
      setScenarios(scens);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);

  const handleSimulate = async (event: DisasterEvent) => {
    setIsLoading(true);
    try {
      const result = await runSimulation(event);
      setSimulationResult(result);
      saveAlert({
        title: `${event.type} Incident Reported`,
        type: event.type,
        severity: event.severity,
        location: event.locationName,
        advice: result.publicAlertText || "Emergency response swarm activated. Follow designated safe routes."
      });
      setActiveTab('dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadScenario = async (id: string) => {
    setIsLoading(true);
    const scen = await fetchScenario(id);
    if (scen) {
      setSimulationResult(scen.simulationData);
      saveAlert({
        title: `${scen.title} Warning`,
        type: scen.type,
        severity: "CRITICAL",
        location: scen.location,
        advice: "Disaster incident scenario active. Evacuate or shelter in place as instructed."
      });
    }
    setIsLoading(false);
  };

  // 1. PURE CITIZEN MOBILE APP
  if (appMode === 'mobile') {
    return (
      <MobileApp 
        simulationResult={simulationResult}
        onSimulate={handleSimulate}
        onLoadScenario={handleLoadScenario}
        onClearAlert={() => setSimulationResult(null)}
        onSwitchToDesktop={() => setAppMode('desktop')}
        onSwitchMode={(mode) => setAppMode(mode)}
        isLoading={isLoading}
      />
    );
  }

  // 2. COMBINED DUAL-VIEW (The Ultimate Hackathon Presentation Mode: Both Side-by-Side with 2-Way Sync)
  if (appMode === 'split') {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
        {/* Top Header Mode Switcher Bar */}
        <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-black tracking-widest text-sm font-orbitron flex items-center gap-2">
              <span>⚡ CRISISWEAVE</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                COMBINED DUAL VIEW
              </span>
            </span>
            <span className="hidden xl:inline text-xs text-slate-400 font-medium">
              🟢 Live 2-Way Sync: Mobile Citizen SOS & Telemetry ↔ 10-Agent Swarm Analytics
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setAppMode('mobile')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <DeviceMobile size={14} />
              <span>Citizen Mobile</span>
            </button>
            <button
              onClick={() => setAppMode('desktop')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Desktop size={14} />
              <span>Command Center</span>
            </button>
            <button
              onClick={() => setAppMode('split')}
              className="px-2.5 py-1 rounded-lg font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow"
            >
              <Columns size={14} weight="bold" />
              <span>Combined View</span>
            </button>
          </div>
        </header>

        {/* Dual Screen Split Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Mobile Citizen Phone (440px wide) */}
          <div className="w-full lg:w-[450px] border-r border-slate-800 flex flex-col shrink-0 bg-slate-950 overflow-y-auto">
            <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 text-center text-xs text-amber-300 font-bold flex items-center justify-between px-4">
              <span className="flex items-center gap-1.5">
                <DeviceMobile size={16} className="text-amber-400" />
                Citizen Mobile App (Field View)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                Interactive
              </span>
            </div>
            <div className="flex-1 flex justify-center py-2 px-2">
              <MobileApp 
                simulationResult={simulationResult}
                onSimulate={handleSimulate}
                onLoadScenario={handleLoadScenario}
                onClearAlert={() => setSimulationResult(null)}
                onSwitchToDesktop={() => setAppMode('desktop')}
                onSwitchMode={(mode) => setAppMode(mode)}
                isLoading={isLoading}
                compactView={true}
              />
            </div>
          </div>

          {/* Right Column: Tactical Command Center (flex-1) */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
            <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Desktop size={16} className="text-purple-400" />
                <span>City Emergency Command Center (10-Agent AI Swarm)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  Swarm Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'scenarios' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  Historical Scenarios
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  simulationResult={simulationResult} 
                  onSimulate={handleSimulate} 
                  isLoading={isLoading} 
                  liveLocation={liveLocation}
                />
              )}
              {activeTab === 'scenarios' && (
                <ScenarioSelector 
                  scenarios={scenarios} 
                  onSelect={handleLoadScenario} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FULL DESKTOP TACTICAL COMMAND CENTER
  return (
    <div className="min-h-screen flex flex-col pt-14 bg-slate-950">
      <Navbar />

      {/* Top Banner with 3 View Switchers */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs">
        <span className="text-amber-400 font-semibold flex items-center gap-2">
          <span>🛡️ Command Center Mode Active</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Advanced 10-Agent Swarm Analytics</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAppMode('split')}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow"
          >
            <Columns size={15} weight="bold" />
            Combined Dual-View
          </button>
          <button
            onClick={() => setAppMode('mobile')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <DeviceMobile size={15} weight="bold" />
            Citizen Mobile App
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-[200px] md:w-[240px] border-r border-border bg-card hidden md:flex flex-col p-4 shrink-0">
          <div className="space-y-2 flex-1 mt-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <ChartLineUp size={20} />
              COMMAND CENTER
            </button>
            <button 
              onClick={() => setActiveTab('scenarios')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'scenarios' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <MapTrifold size={20} />
              SCENARIOS
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'about' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <Info size={20} />
              SYSTEM INFO
            </button>
          </div>
          
          <div className="mt-auto p-4 border border-border bg-background rounded text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MODE</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE OPERATIONAL
              </span>
            </div>
            <button
              onClick={() => setAppMode('split')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <Columns size={15} weight="bold" />
              Combined Dual View
            </button>
            <button
              onClick={() => setAppMode('mobile')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <DeviceMobile size={15} />
              Open Mobile App
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {activeTab === 'dashboard' && (
            <Dashboard 
              simulationResult={simulationResult} 
              onSimulate={handleSimulate} 
              isLoading={isLoading} 
              liveLocation={liveLocation}
            />
          )}
          
          {activeTab === 'scenarios' && (
            <ScenarioSelector 
              scenarios={scenarios} 
              onSelect={handleLoadScenario} 
              isLoading={isLoading} 
            />
          )}

          {activeTab === 'about' && (
            <div className="p-8 max-w-3xl mx-auto">
              <h2 className="font-orbitron text-2xl text-primary mb-4">CRISISWEAVE ARCHITECTURE</h2>
              <div className="tactical-card space-y-4 text-sm leading-relaxed">
                <p>CrisisWeave is an advanced AI disaster anticipation system utilizing a multi-agent swarm architecture.</p>
                <p>Each agent is a specialized domain expert evaluating incoming incident data to predict secondary and tertiary cascading failures.</p>
                <p>Features:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Real-time multi-variable incident simulation</li>
                  <li>Cross-domain cascade prediction modeling</li>
                  <li>Automated prioritization of mitigation actions</li>
                  <li>Historical scenario analysis</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

