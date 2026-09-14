import React, { useState } from 'react';
import IncidentInput from './IncidentInput';
import DisasterMap from './DisasterMap';
import AgentStatusPanel from './AgentStatusPanel';
import CascadeTimeline from './CascadeTimeline';
import ActionPanel from './ActionPanel';
import ResourceTracker from './ResourceTracker';
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

  const handleSelectLocation = (lat: number, lng: number, locationName: string) => {
    setSelectedTarget({
      lat,
      lng,
      locationName,
      timestamp: Date.now()
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <IncidentInput 
            onSimulate={onSimulate} 
            isLoading={isLoading} 
            selectedTarget={selectedTarget}
            liveLocation={liveLocation}
          />
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

      {/* Row 4 */}
      <ResourceTracker />
    </div>
  );
};

export default Dashboard;
