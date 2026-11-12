import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, RefreshCw, Shield, Bell, UserCheck } from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { useAuth } from '../context/AuthContext';

export const Topbar = () => {
  const location = useLocation();
  const { lastUpdated, livePulse, refreshData, triggerSimulationTick, kpis } = useOperations();
  const { user, switchDemoRole } = useAuth();
  const [timeUTC, setTimeUTC] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUTC(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSimulationTick();
    await refreshData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/turbines/')) return 'Turbine Telemetry Diagnostics';
    switch (path) {
      case '/dashboard': return 'Overview Mission Control';
      case '/turbines': return 'Turbine Fleet Monitoring';
      case '/maintenance': return 'Maintenance & Work Orders';
      case '/inspections': return 'Inspections & Quality Assurance';
      case '/weather': return 'Marine Weather & Metocean Conditions';
      case '/vessels': return 'Offshore Marine Vessel Logistics';
      case '/performance': return 'Wind Farm Performance & Analytics';
      case '/alerts': return 'Operational Alert Triage Center';
      case '/reports': return 'SCADA Reports & CSV Generation';
      case '/settings': return 'System Settings & Fleet Parameters';
      default: return 'Operations Dashboard';
    }
  };

  return (
    <header className="h-16 bg-wind-panel border-b border-wind-border px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left Title & Status Strip */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-mono text-wind-secondary mt-0.5">
            <span className="text-white font-semibold">TAMIL NADU OFFSHORE WIND FARM</span>
            <span>•</span>
            <span>360 MW RATED</span>
            <span>•</span>
            <span className="text-neutral-400">48 TURBINES</span>
          </div>
        </div>
      </div>

      {/* Right Telemetry Feed & Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
        {/* UTC Clock */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-white font-bold tracking-widest">{timeUTC}</span>
          <span className="text-[10px] text-wind-secondary">
            Sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>

        {/* Live Simulation Pulse & Sync Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-wind-surface border border-wind-border">
            <span className={`w-2 h-2 rounded-full ${livePulse ? 'bg-white scale-125' : 'bg-neutral-400'} transition-all`} />
            <span className="text-[10px] uppercase tracking-wider text-neutral-300">
              Live Feed
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1.5 bg-wind-surface border border-wind-border hover:border-neutral-500 text-neutral-300 hover:text-white transition-all"
            title="Force telemetry cycle simulation & sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-white' : ''}`} />
          </button>
        </div>

        {/* Role Quick Switcher for seamless testing */}
        <div className="flex items-center gap-1.5 border-l border-wind-border pl-3">
          <Shield className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
          <div className="flex flex-col">
            <label className="text-[9px] uppercase tracking-wider text-wind-secondary hidden sm:inline">
              Active Persona
            </label>
            <select
              value={user?.role || 'operations_manager'}
              onChange={(e) => switchDemoRole(e.target.value)}
              className="bg-wind-surface border border-wind-border px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-white"
              title="Switch demo role to test RBAC clearance"
            >
              <option value="admin">Admin (Full)</option>
              <option value="operations_manager">Ops Manager</option>
              <option value="maintenance_engineer">Maintenance Eng.</option>
              <option value="inspector">Inspector</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
