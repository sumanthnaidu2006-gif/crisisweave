import React, { useState } from 'react';
import { SimulationResult } from '../../types';
import { ListChecks, WarningCircle, CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react';
import { useHaptics } from '../../hooks/useHaptics';

interface ActionPanelProps {
  simulationResult: SimulationResult | null;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ simulationResult }) => {
  const actions = simulationResult?.topActions || [];
  const { success: hapticSuccess, light: hapticLight } = useHaptics();
  const [deployedIds, setDeployedIds] = useState<Record<string, boolean>>({});

  const handleToggleDeploy = (id: string) => {
    const isNowDeployed = !deployedIds[id];
    if (isNowDeployed) {
      hapticSuccess();
    } else {
      hapticLight();
    }
    setDeployedIds(prev => ({ ...prev, [id]: isNowDeployed }));
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE': return 'bg-destructive/20 text-destructive border-destructive font-bold';
      case 'WITHIN 1H': return 'bg-primary/20 text-primary border-primary font-bold';
      case 'WITHIN 6H': return 'bg-blue-500/20 text-blue-400 border-blue-500 font-bold';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="tactical-card h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="section-header flex items-center gap-2 m-0 text-xs">
          <ListChecks size={18} className="text-primary" />
          RECOMMENDED MITIGATION ACTIONS
        </h2>
        {actions.length > 0 && (
          <span className="bg-primary/20 text-primary border border-primary/40 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
            {Object.values(deployedIds).filter(Boolean).length}/{actions.length} DEPLOYED
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {actions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs border border-dashed border-border rounded">
            Incident simulation results & AI action plan will populate here
          </div>
        ) : (
          actions.map((action, idx) => {
            const isDeployed = deployedIds[action.id];
            return (
              <div 
                key={action.id} 
                className={`p-2.5 rounded bg-background border flex items-start gap-2.5 transition-all ${
                  isDeployed 
                    ? 'border-emerald-500/60 bg-emerald-950/20' 
                    : idx < 3 
                    ? 'border-l-4 border-l-primary border-y-border border-r-border' 
                    : 'border-border'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center font-orbitron font-bold text-xs ${
                  isDeployed ? 'bg-emerald-500 text-slate-950' : 'bg-muted text-primary'
                }`}>
                  {isDeployed ? <CheckCircle size={14} weight="bold" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs mb-1.5 leading-relaxed ${isDeployed ? 'text-emerald-200 line-through opacity-80' : 'text-foreground'}`}>
                    {action.text}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${getUrgencyStyles(action.urgency)}`}>
                        {action.urgency === 'IMMEDIATE' && <WarningCircle size={11} weight="bold" />}
                        {action.urgency}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-mono">
                        {action.domain}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleDeploy(action.id)}
                      className={`touch-tactile-sm px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        isDeployed 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                          : 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30'
                      }`}
                    >
                      {isDeployed ? (
                        <>
                          <CheckCircle size={11} weight="bold" />
                          <span>DEPLOYED</span>
                        </>
                      ) : (
                        <>
                          <PaperPlaneTilt size={11} weight="bold" />
                          <span>DISPATCH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
