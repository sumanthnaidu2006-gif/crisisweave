import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ScenarioSelector from './components/scenarios/ScenarioSelector';
import { MobileApp } from './components/mobile/MobileApp';
import { MobilePopupModal } from './components/mobile/MobilePopupModal';
import { EmergencySyncBanner } from './components/common/EmergencySyncBanner';
import { SimulationResult, DisasterEvent } from './types';
import { fetchScenarios, fetchScenario, runSimulation } from './services/api';
import { subscribeToSync, publishIncident, clearSyncState, ControllerBroadcast } from './services/syncService';
import { ChartLineUp, MapTrifold, Info, DeviceMobile, Desktop, Columns } from '@phosphor-icons/react';
import { useHaptics } from './hooks/useHaptics';

import { saveAlert } from './services/alertStore';
import { useLiveLocation } from './hooks/useLiveLocation';

type Tab = 'dashboard' | 'scenarios' | 'about';
type AppMode = 'mobile' | 'desktop' | 'split';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('mobile');
  const [isMobilePopupOpen, setIsMobilePopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [activeBroadcast, setActiveBroadcast] = useState<ControllerBroadcast | null>(null);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const { medium: hapticMedium, light: hapticLight, warning: hapticWarning } = useHaptics();
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

    // 🟢 Real-time server sync: Whenever controller uploads or dispatches, EVERY user updates immediately!
    const unsubscribe = subscribeToSync((event) => {
      if (event.type === 'INCIDENT') {
        if (event.state.currentIncident) {
          setSimulationResult(event.state.currentIncident);
        }
        if (event.state.broadcast) {
          setActiveBroadcast(event.state.broadcast);
          setShowEmergencyBanner(true);
        }
        hapticWarning();
      } else if (event.type === 'BROADCAST') {
        if (event.state.broadcast) {
          setActiveBroadcast(event.state.broadcast);
          setShowEmergencyBanner(true);
        }
        hapticWarning();
      } else if (event.type === 'CLEAR') {
        setSimulationResult(null);
        setActiveBroadcast(null);
        setShowEmergencyBanner(false);
      } else if (event.type === 'INIT') {
        if (event.state.currentIncident) {
          setSimulationResult(event.state.currentIncident);
        }
        if (event.state.broadcast) {
          setActiveBroadcast(event.state.broadcast);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSimulate = async (event: DisasterEvent) => {
    setIsLoading(true);
    try {
      const result = await runSimulation(event);
      setSimulationResult(result);
      const alertPayload = {
        title: `${event.type} Incident Reported`,
        type: event.type,
        severity: event.severity,
        location: event.locationName,
        advice: result.publicAlertText || "Emergency response swarm activated. Follow designated safe routes."
      };
      saveAlert(alertPayload);

      // 📡 Publish to sync server: updates every connected phone & browser tab immediately!
      await publishIncident(result, {
        id: `bc-${Date.now()}`,
        title: `${event.type} Emergency Declared`,
        message: result.publicAlertText || `${event.type} hazard reported in ${event.locationName}. Evacuate or shelter in place as instructed.`,
        severity: (event.severity as any) || 'HIGH',
        locationName: event.locationName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Controller Command Center'
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
      const alertPayload = {
        title: `${scen.title} Warning`,
        type: scen.type,
        severity: "CRITICAL",
        location: scen.location,
        advice: "Disaster incident scenario active. Evacuate or shelter in place as instructed."
      };
      saveAlert(alertPayload);

      // 📡 Publish scenario to sync server so all citizen apps load the hazard immediately!
      await publishIncident(scen.simulationData, {
        id: `bc-${Date.now()}`,
        title: `${scen.title} Warning`,
        message: scen.simulationData.publicAlertText || `Active scenario: ${scen.title}. Follow designated emergency corridors.`,
        severity: 'CRITICAL',
        locationName: scen.location,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'Controller Command Center'
      });
    }
    setIsLoading(false);
  };

  const handleClearAlert = async () => {
    setSimulationResult(null);
    setActiveBroadcast(null);
    setShowEmergencyBanner(false);
    await clearSyncState();
  };

  // 1. PURE CITIZEN MOBILE APP
  if (appMode === 'mobile') {
    return (
      <MobileApp 
        simulationResult={simulationResult}
        broadcast={activeBroadcast}
        onSimulate={handleSimulate}
        onLoadScenario={handleLoadScenario}
        onClearAlert={handleClearAlert}
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
              onClick={() => {
                setAppMode('desktop');
                setIsMobilePopupOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
              title="Pop up Mobile Device"
            >
              <DeviceMobile size={14} />
              <span>Mobile Popup</span>
            </button>
            <button
              onClick={() => {
                setAppMode('desktop');
                setIsMobilePopupOpen(false);
              }}
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
            <button
              onClick={() => setAppMode('mobile')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <DeviceMobile size={14} />
              <span>Full Mobile</span>
            </button>
          </div>
        </header>

        {/* Live Controller Emergency Broadcast Banner */}
        {showEmergencyBanner && activeBroadcast && (
          <EmergencySyncBanner 
            broadcast={activeBroadcast}
            onDismiss={() => setShowEmergencyBanner(false)}
          />
        )}

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
                broadcast={activeBroadcast}
                onSimulate={handleSimulate}
                onLoadScenario={handleLoadScenario}
                onClearAlert={handleClearAlert}
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
      <Navbar onOpenMobilePopup={() => setIsMobilePopupOpen(true)} />

      {/* Live Controller Emergency Broadcast Banner */}
      {showEmergencyBanner && activeBroadcast && (
        <EmergencySyncBanner 
          broadcast={activeBroadcast}
          onDismiss={() => setShowEmergencyBanner(false)}
        />
      )}

      {/* Top Banner with 3 View Switchers */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs">
        <span className="text-amber-400 font-semibold flex items-center gap-2">
          <span>🛡️ Command Center Mode Active</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Advanced 10-Agent Swarm Analytics</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              hapticMedium();
              setIsMobilePopupOpen(true);
            }}
            className="touch-tactile px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow"
          >
            <DeviceMobile size={15} weight="bold" />
            Pop Up Mobile App
          </button>
          <button
            onClick={() => {
              hapticMedium();
              setAppMode('split');
            }}
            className="touch-tactile px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Columns size={15} weight="bold" />
            Combined Dual-View
          </button>
          <button
            onClick={() => {
              hapticMedium();
              setAppMode('mobile');
            }}
            className="touch-tactile px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <DeviceMobile size={15} />
            Full Mobile View
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-[200px] md:w-[240px] border-r border-border bg-card hidden md:flex flex-col p-4 shrink-0">
          <div className="space-y-2 flex-1 mt-4">
            <button 
              onClick={() => {
                hapticLight();
                setActiveTab('dashboard');
              }}
              className={`touch-tactile w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <ChartLineUp size={20} />
              COMMAND CENTER
            </button>
            <button 
              onClick={() => {
                hapticLight();
                setActiveTab('scenarios');
              }}
              className={`touch-tactile w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'scenarios' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <MapTrifold size={20} />
              SCENARIOS
            </button>
            <button 
              onClick={() => {
                hapticLight();
                setActiveTab('about');
              }}
              className={`touch-tactile w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${activeTab === 'about' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
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
              onClick={() => {
                hapticMedium();
                setIsMobilePopupOpen(true);
              }}
              className="touch-tactile w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              <DeviceMobile size={15} weight="bold" />
              Pop Up Mobile App
            </button>
            <button
              onClick={() => {
                hapticMedium();
                setAppMode('split');
              }}
              className="touch-tactile w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Columns size={15} weight="bold" />
              Combined Dual View
            </button>
            <button
              onClick={() => {
                hapticMedium();
                setAppMode('mobile');
              }}
              className="touch-tactile w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <DeviceMobile size={15} />
              Full Mobile View
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

      {/* 📱 Citizen Mobile Popup Modal - Pops up immediately when site is opened */}
      <MobilePopupModal
        isOpen={isMobilePopupOpen}
        onClose={() => setIsMobilePopupOpen(false)}
        onMinimize={() => setIsMobilePopupOpen(false)}
        onSwitchMode={(mode) => {
          if (mode === 'desktop') {
            setIsMobilePopupOpen(false);
          } else {
            setAppMode(mode);
          }
        }}
        simulationResult={simulationResult}
        broadcast={activeBroadcast}
        onSimulate={handleSimulate}
        onLoadScenario={handleLoadScenario}
        onClearAlert={handleClearAlert}
        isLoading={isLoading}
      />

      {/* Floating Action Button when popup is closed/minimized */}
      {!isMobilePopupOpen && (
        <button
          onClick={() => {
            hapticMedium();
            setIsMobilePopupOpen(true);
          }}
          className="touch-tactile fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-3 border-2 border-amber-300 ring-4 ring-amber-500/20 group"
          title="Pop up Citizen Mobile App"
        >
          <div className="relative">
            <DeviceMobile size={24} weight="bold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-[10px] tracking-wider uppercase opacity-80 font-mono">Citizen View</div>
            <div className="text-xs font-black flex items-center gap-1 text-slate-950">
              Pop Up Mobile <span>↗</span>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default App;

