import React from 'react';
import { SimulationResult } from '../../types';
import { Brain, Cloud, ShieldWarning, FirstAid, Truck, Lightning, ShieldCheck, Plant, Package, MapTrifold, Broadcast } from '@phosphor-icons/react';

interface AgentStatusPanelProps {
  simulationResult: SimulationResult | null;
}

const getIconForDomain = (domain: string) => {
  switch (domain.toLowerCase()) {
    case 'meteorology': return <Cloud size={24} />;
    case 'cbrn': return <ShieldWarning size={24} />;
    case 'healthcare':
    case 'health': return <FirstAid size={24} />;
    case 'transport': return <Truck size={24} />;
    case 'utilities': return <Lightning size={24} />;
    case 'public safety': return <ShieldCheck size={24} />;
    case 'environment': return <Plant size={24} />;
    case 'resources': return <Package size={24} />;
    case 'mapping': return <MapTrifold size={24} />;
    case 'information':
    case 'comms': return <Broadcast size={24} />;
    default: return <Brain size={24} />;
  }
};

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ simulationResult }) => {
  // If no result, create 10 standby placeholder agents
  const agents = simulationResult?.agents || Array(10).fill(null).map((_, i) => ({
    agentName: `Agent-${i+1}`,
    domain: 'Unknown',
    status: 'STANDBY',
    confidenceScore: 0,
    predictions: ['Awaiting data...']
  }));

  return (
    <div className="tactical-card w-full">
      <h2 className="section-header mb-4 flex items-center gap-2">
        <Brain size={20} className="text-primary" />
        AI AGENT SWARM STATUS
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {agents.map((agent, idx) => {
          const isStandby = agent.status === 'STANDBY';
          const confColor = agent.confidenceScore > 80 ? 'bg-success' : agent.confidenceScore > 50 ? 'bg-primary' : 'bg-destructive';
          
          return (
            <div 
              key={idx} 
              className={`border rounded p-3 flex flex-col gap-2 transition-all duration-500 ${
                isStandby ? 'border-border bg-background' : 'border-primary/30 bg-card glow-amber'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-1.5 rounded ${isStandby ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                  {getIconForDomain(agent.domain)}
                </div>
                <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isStandby ? 'bg-muted text-muted-foreground' : 'bg-success/20 text-success'
                }`}>
                  {agent.status}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold truncate">{agent.agentName}</h3>
                <p className="text-xs text-muted-foreground">{agent.domain}</p>
              </div>

              <div className="mt-1">
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Confidence</span>
                  <span>{agent.confidenceScore}%</span>
                </div>
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div 
                    className={`h-full ${confColor} transition-all duration-1000`} 
                    style={{ width: `${agent.confidenceScore}%` }}
                  />
                </div>
              </div>

              <div className="text-xs mt-1 text-muted-foreground line-clamp-2 h-8">
                {agent.predictions[0] || 'No prediction'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStatusPanel;
