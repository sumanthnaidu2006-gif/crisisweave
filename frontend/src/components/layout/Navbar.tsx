import React from 'react';
import { ShieldCheck } from '@phosphor-icons/react';

const Navbar: React.FC = () => {
  const [time, setTime] = React.useState(new Date().toUTCString());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="h-14 w-full bg-card border-b border-border flex items-center justify-between px-4 fixed top-0 z-50">
      <div className="flex items-center gap-3">
        <ShieldCheck size={28} weight="fill" className="text-primary" />
        <h1 className="font-orbitron font-bold text-xl text-primary tracking-wider">
          CRISISWEAVE
        </h1>
        <span className="text-xs text-muted-foreground ml-2 hidden sm:block border-l border-border pl-3">
          Anticipate · Analyze · Respond
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-xs font-mono text-foreground bg-background px-3 py-1 rounded border border-border">
          {time}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
          <span className="text-xs text-success font-bold tracking-widest uppercase">SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
