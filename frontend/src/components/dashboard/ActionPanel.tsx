import React from 'react';
import { SimulationResult } from '../../types';
import { ListChecks, WarningCircle } from '@phosphor-icons/react';

interface ActionPanelProps {
  simulationResult: SimulationResult | null;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ simulationResult }) => {
  const actions = simulationResult?.topActions || [];

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE': return 'bg-destructive/20 text-destructive border-destructive';
      case 'WITHIN 1H': return 'bg-primary/20 text-primary border-primary';
      case 'WITHIN 6H': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="tactical-card h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-header flex items-center gap-2">
          <ListChecks size={20} className="text-primary" />
          RECOMMENDED ACTIONS
        </h2>
        {actions.length > 0 && (
          <span className="bg-primary text-background px-2 py-0.5 rounded-full text-xs font-bold">
            {actions.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {actions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded">
            Simulation results will appear here
          </div>
        ) : (
          actions.map((action, idx) => (
            <div 
              key={action.id} 
              className={`p-3 rounded bg-background border flex gap-3 ${
                idx < 3 ? 'border-l-4 border-l-primary border-y-border border-r-border' : 'border-border'
              }`}
            >
              <div className="flex-shrink-0 w-6 h-6 bg-muted rounded flex items-center justify-center font-orbitron font-bold text-xs text-primary">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2">{action.text}</p>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${getUrgencyStyles(action.urgency)}`}>
                    {action.urgency === 'IMMEDIATE' && <WarningCircle size={12} weight="bold" />}
                    {action.urgency}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {action.domain}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
