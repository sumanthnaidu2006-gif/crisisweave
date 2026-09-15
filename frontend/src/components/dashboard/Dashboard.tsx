import React, { useState } from 'react';
import IncidentInput from './IncidentInput';
import DisasterMap from './DisasterMap';
import AgentStatusPanel from './AgentStatusPanel';
import CascadeTimeline from './CascadeTimeline';
import ActionPanel from './ActionPanel';
import ResourceTracker from './ResourceTracker';
import { ControllerBroadcastUpload } from './ControllerBroadcastUpload';
import { FourteenDayForecastView } from '../common/FourteenDayForecastView';
import { AISwarmChat } from '../common/AISwarmChat';
import { SimulationResult, DisasterEvent } from '../../types';

interface DashboardProps {
  simulationResult: SimulationResult | null;
  onSimulate: (event: DisasterEvent) => void;
  isLoading: boolean;
  liveLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    isLiveGPS?: boolean;
    isPinned?: boolean;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ 
  simulationResult, 
  onSimulate, 
  isLoading,
  liveLocation 
}) => {
  const [selectedTarget, setSelectedTarget] = useState<{
    lat: number;
    lng: number;
    locationName: string;
    timestamp: number;
  } | null>(null);

  // Sync selected target whenever a simulation or scenario is loaded
  React.useEffect(() => {
    if (simulationResult?.event) {
      setSelectedTarget({
        lat: simulationResult.event.latitude,
        lng: simulationResult.event.longitude,
        locationName: simulationResult.event.locationName,
        timestamp: Date.now()
      });
    }
  }, [simulationResult?.id, simulationResult?.event?.latitude, simulationResult?.event?.longitude]);

  const [controllerTab, setControllerTab] = useState<'dispatch' | 'upload'>('dispatch');

  const handleSelectLocation = (lat: number, lng: number, locationName: string) => {
    setSelectedTarget({
      lat,
      lng,
      locationName,
      timestamp: Date.now()
    });
  };

  const currentLocation = simulationResult?.event?.locationName || liveLocation?.locationName || 'Active Sector';

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold font-mono">
            <button
              onClick={() => setControllerTab('dispatch')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${controllerTab === 'dispatch' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <span>INCIDENT DISPATCH</span>
            </button>
            <button
              onClick={() => setControllerTab('upload')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${controllerTab === 'upload' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-amber-300'}`}
            >
              <span>BROADCAST / UPLOAD</span>
            </button>
          </div>

          {controllerTab === 'dispatch' ? (
            <IncidentInput 
              onSimulate={onSimulate} 
              isLoading={isLoading} 
              selectedTarget={selectedTarget}
              liveLocation={liveLocation}
            />
          ) : (
            <ControllerBroadcastUpload 
              locationName={currentLocation}
            />
          )}
        </div>
        <div className="lg:col-span-8">
          <DisasterMap 
            simulationResult={simulationResult} 
            liveLocation={liveLocation}
            onSelectLocation={handleSelectLocation}
            selectedTarget={selectedTarget}
          />
        </div>
      </div>

      {/* Row 2 */}
      <AgentStatusPanel simulationResult={simulationResult} />

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <CascadeTimeline simulationResult={simulationResult} />
        </div>
        <div className="lg:col-span-5">
          <ActionPanel simulationResult={simulationResult} />
        </div>
      </div>

      {/* Row 4: 14-Day Regional Predictive Forecast & AI Swarm Intelligence Q&A */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <FourteenDayForecastView 
            lat={liveLocation?.lat}
            lng={liveLocation?.lng}
            locationName={currentLocation}
            simulationResult={simulationResult}
          />
        </div>
        <div className="lg:col-span-5">
          <AISwarmChat 
            lat={liveLocation?.lat}
            lng={liveLocation?.lng}
            locationName={currentLocation}
            simulationResult={simulationResult}
          />
        </div>
      </div>

      {/* Row 5 */}
      <ResourceTracker />
    </div>
  );
};

export default Dashboard;
