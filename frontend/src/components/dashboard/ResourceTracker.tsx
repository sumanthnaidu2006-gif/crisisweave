import React from 'react';
import { Package, FirstAid, Buildings, Car, Drop, Lightning } from '@phosphor-icons/react';

const ResourceTracker: React.FC = () => {
  // Mock data for resource tracking
  const resources = [
    { name: 'Hospitals', icon: <FirstAid size={20}/>, current: 85, capacity: 100, unit: '%' },
    { name: 'Shelters', icon: <Buildings size={20}/>, current: 45, capacity: 100, unit: '%' },
    { name: 'Ambulances', icon: <Car size={20}/>, current: 92, capacity: 100, unit: '%' },
    { name: 'Water Reserves', icon: <Drop size={20}/>, current: 30, capacity: 100, unit: '%' },
    { name: 'Power Grid', icon: <Lightning size={20}/>, current: 60, capacity: 100, unit: '%' },
    { name: 'Med Supplies', icon: <Package size={20}/>, current: 15, capacity: 100, unit: '%' },
  ];

  return (
    <div className="tactical-card w-full">
      <h2 className="section-header mb-4">RESOURCE STATUS</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {resources.map((res, idx) => {
          const usage = res.current;
          // Invert logic for some: high usage of hospitals is bad, low usage of water reserves is bad.
          // Let's assume higher % means "stressed" for simplicity in demo
          const isCritical = usage > 80 || usage < 20; 
          const isWarning = (usage > 60 && usage <= 80) || (usage >= 20 && usage < 40);
          
          let colorClass = 'bg-success';
          let textColor = 'text-success';
          if (isCritical) {
            colorClass = 'bg-destructive';
            textColor = 'text-destructive';
          } else if (isWarning) {
            colorClass = 'bg-primary';
            textColor = 'text-primary';
          }

          return (
            <div key={idx} className="bg-background border border-border rounded p-3">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                {res.icon}
                <span className="text-xs font-bold uppercase">{res.name}</span>
              </div>
              <div className="flex justify-between items-end mb-1">
                <span className={`text-xl font-mono font-bold ${textColor}`}>
                  {res.current}{res.unit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                <div className={`h-full ${colorClass}`} style={{ width: `${usage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceTracker;
