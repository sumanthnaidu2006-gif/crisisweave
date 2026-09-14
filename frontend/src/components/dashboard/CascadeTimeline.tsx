import React from 'react';
import { SimulationResult } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendUp } from '@phosphor-icons/react';

interface CascadeTimelineProps {
  simulationResult: SimulationResult | null;
}

const CascadeTimeline: React.FC<CascadeTimelineProps> = ({ simulationResult }) => {
  const data = simulationResult?.cascadeTimeline || [];

  // Transform data for chart: group by hourOffset
  const chartData = data.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.hour === curr.hourOffset);
    if (existing) {
      existing[curr.serviceAffected] = curr.severity;
      // Keep track of all services for tooltip
      if (!existing.details) existing.details = [];
      existing.details.push(curr);
    } else {
      acc.push({
        hour: curr.hourOffset,
        [curr.serviceAffected]: curr.severity,
        details: [curr]
      });
    }
    return acc;
  }, []).sort((a, b) => a.hour - b.hour);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const details = payload[0].payload.details;
      return (
        <div className="bg-card/95 backdrop-blur border border-border p-3 rounded shadow-lg max-w-xs">
          <p className="font-orbitron text-primary mb-2 border-b border-border pb-1">Hour {label}</p>
          {details.map((d: any, i: number) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-xs font-bold text-foreground">{d.serviceAffected} (Sev: {d.severity}/10)</p>
              <p className="text-[10px] text-muted-foreground">{d.impactDescription}</p>
              <p className="text-[10px] text-primary mt-1 border-l-2 border-primary pl-1">{d.recommendedAction}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="tactical-card h-[300px] flex flex-col">
      <h2 className="section-header mb-4 flex items-center gap-2">
        <TrendUp size={20} className="text-primary" />
        CASCADE PREDICTION TIMELINE
      </h2>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded">
          Run a simulation to see cascade predictions
        </div>
      ) : (
        <div className="flex-1 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} tickFormatter={(val) => `${val}h`} />
              <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '5 5' }} />
              
              <ReferenceLine x={6} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: '6h', fill: '#EF4444', fontSize: 10 }} />
              <ReferenceLine x={24} stroke="#8B5CF6" strokeDasharray="3 3" label={{ position: 'top', value: '24h', fill: '#8B5CF6', fontSize: 10 }} />
              <ReferenceLine x={48} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'top', value: '48h', fill: '#10B981', fontSize: 10 }} />

              {/* Just plotting the max severity at each hour for visual simplicity */}
              <Area 
                type="monotone" 
                dataKey={(d) => Math.max(...d.details.map((x:any)=>x.severity))} 
                stroke="#F59E0B" 
                fillOpacity={1} 
                fill="url(#colorSev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CascadeTimeline;
