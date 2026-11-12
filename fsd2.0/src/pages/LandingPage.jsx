import React from 'react';
import { Link } from 'react-router-dom';
import { Fan, Shield, Compass, BarChart3, ArrowRight, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-wind-bg text-white flex flex-col justify-between selection:bg-neutral-800 selection:text-white relative overflow-hidden radar-grid">
      {/* Top Navbar */}
      <header className="h-20 border-b border-wind-border/60 px-6 sm:px-12 flex items-center justify-between z-10 bg-wind-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white text-black font-mono font-black text-sm flex items-center justify-center">
            W
          </div>
          <span className="font-mono font-black tracking-widest text-lg text-white">
            WINDOPS
          </span>
          <span className="hidden sm:inline text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-3">
            INDIA 360MW OFFSHORE OPERATIONS
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center gap-2"
          >
            <span>{isAuthenticated ? 'Enter Control Room' : 'Operator Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-12 max-w-6xl mx-auto w-full py-16 sm:py-24 z-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
            SCADA TELEMETRY & FLEET LOGISTICS SYSTEM
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-tighter leading-none mb-6 text-white uppercase">
          OFFSHORE WIND.<br />
          OPERATIONS,<br />
          CENTRALIZED.
        </h1>

        <p className="text-lg sm:text-xl font-mono text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Monitor turbines. Coordinate maintenance. Predict operational windows.
          An industrial-grade control room for the next generation of offshore energy assets.
        </p>

        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center gap-3 text-sm"
          >
            <span>Enter Operations Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#capabilities"
            className="px-6 py-4 border border-wind-border hover:border-neutral-400 text-neutral-300 hover:text-white transition-all uppercase tracking-wider"
          >
            Platform Overview
          </a>
        </div>

        {/* Tactical Key Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-10 border-t border-wind-border/80 font-mono">
          <div>
            <div className="text-3xl font-bold text-white">360 MW</div>
            <div className="text-xs text-neutral-500 uppercase mt-1">Installed Capacity</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">48</div>
            <div className="text-xs text-neutral-500 uppercase mt-1">Direct-Drive Turbines</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">96.4%</div>
            <div className="text-xs text-neutral-500 uppercase mt-1">Fleet Availability</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">&lt; 15s</div>
            <div className="text-xs text-neutral-500 uppercase mt-1">Live Telemetry Cycle</div>
          </div>
        </div>
      </main>

      {/* Abstract Turbine Blueprint Illustration in Background */}
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] pointer-events-none opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[0.3]">
          <circle cx="50" cy="50" r="45" strokeDasharray="1,2" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="15" />
          <line x1="50" y1="5" x2="50" y2="95" />
          <line x1="5" y1="50" x2="95" y2="50" />
          <line x1="50" y1="50" x2="15" y2="20" strokeWidth="0.8" />
          <line x1="50" y1="50" x2="85" y2="20" strokeWidth="0.8" />
          <line x1="50" y1="50" x2="50" y2="90" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Platform Capabilities Overview */}
      <section id="capabilities" className="border-t border-wind-border bg-wind-panel/80 p-8 sm:p-12 z-10 font-mono">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-6">
            Core Control Architecture
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-wind-border bg-wind-bg">
              <Fan className="w-5 h-5 text-white mb-3" />
              <h3 className="text-sm font-bold text-white uppercase mb-2">
                Turbine Health Telemetry
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Continuous SCADA telemetry across 48 assets: generator heat, gearbox vibration, rotor RPM, and automated fault classification.
              </p>
            </div>

            <div className="p-5 border border-wind-border bg-wind-bg">
              <Compass className="w-5 h-5 text-white mb-3" />
              <h3 className="text-sm font-bold text-white uppercase mb-2">
                Marine Metocean Windows
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hydrodynamic wave height (Hs), swell period, and wind vector modeling to determine safe technician transfer windows for SOV and CTV fleets.
              </p>
            </div>

            <div className="p-5 border border-wind-border bg-wind-bg">
              <BarChart3 className="w-5 h-5 text-white mb-3" />
              <h3 className="text-sm font-bold text-white uppercase mb-2">
                Fleet Production Analytics
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Real-time power curves ($P \propto v^3$), capacity factor tracking, downtime root-cause breakdown, and automated regulatory CSV reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wind-border px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500 z-10">
        <div>
          WINDOPS OFFSHORE SYSTEMS • INDIA ASSET CODE: IN-360
        </div>
        <div>
          RESTRICTED OPERATIONAL CONSOLE • ISO 55001 COMPLIANT
        </div>
      </footer>
    </div>
  );
};
