import React from 'react';
import { ScenarioTemplate } from '../../types';
import { Flask, ShieldWarning, Waves } from '@phosphor-icons/react';

interface ScenarioSelectorProps {
  scenarios: ScenarioTemplate[];
  onSelect: (scenarioId: string) => void;
  isLoading: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, onSelect, isLoading }) => {
  const getIcon = (title: string) => {
    if (title.includes('Bhopal')) return <Flask size={48} weight="duotone" className="text-orange-500" />;
    if (title.includes('Chernobyl')) return <ShieldWarning size={48} weight="duotone" className="text-green-500" />;
    if (title.includes('Nepal')) return <Waves size={48} weight="duotone" className="text-cyan-500" />;
    return <ShieldWarning size={48} />;
  };

  const getThemeClass = (title: string) => {
    if (title.includes('Bhopal')) return 'hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]';
    if (title.includes('Chernobyl')) return 'hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]';
    if (title.includes('Nepal')) return 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]';
    return 'hover:border-primary/50';
  };

  const getButtonClass = (title: string) => {
    if (title.includes('Bhopal')) return 'bg-orange-500 hover:bg-orange-600';
    if (title.includes('Chernobyl')) return 'bg-green-500 hover:bg-green-600';
    if (title.includes('Nepal')) return 'bg-cyan-500 hover:bg-cyan-600';
    return 'bg-primary hover:bg-primary/80';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="font-orbitron text-2xl text-foreground mb-2">HISTORICAL DISASTER SCENARIOS</h2>
        <p className="text-muted-foreground">Load pre-configured historical data to see how the swarm responds to known catastrophes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className={`tactical-card transition-all duration-300 border-border bg-card/50 flex flex-col h-full ${getThemeClass(scenario.title)}`}>
            <div className="mb-4">
              {getIcon(scenario.title)}
            </div>
            
            <div className="mb-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-orbitron font-bold text-xl text-foreground">{scenario.title}</h3>
                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{scenario.year}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">📍 {scenario.location}</p>
              
              <span className="inline-block text-xs font-bold bg-background border border-border px-2 py-1 rounded mb-4">
                {scenario.type}
              </span>
              
              <p className="text-sm text-foreground mb-4 leading-relaxed">
                {scenario.description}
              </p>

              <div className="bg-background rounded p-3 border border-border">
                <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase">Key Lessons:</h4>
                <ul className="text-xs text-foreground space-y-1 pl-4 list-disc">
                  {scenario.keyLessons.map((lesson, idx) => (
                    <li key={idx}>{lesson}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button 
              onClick={() => onSelect(scenario.id)}
              disabled={isLoading}
              className={`w-full py-3 rounded font-orbitron font-bold text-background transition-colors flex justify-center items-center gap-2 ${getButtonClass(scenario.title)}`}
            >
              {isLoading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full"></span>
              ) : (
                'LOAD SCENARIO'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;
