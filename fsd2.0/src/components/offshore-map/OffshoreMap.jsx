import React, { useState } from 'react';
import { Compass, Ship, Wind, Zap, AlertTriangle, CheckCircle2, Shield, Eye } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const OffshoreMap = ({
  turbines = [],
  vessels = [],
  onSelectTurbine,
  selectedTurbineId,
}) => {
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState('ALL');
  const [showVessels, setShowVessels] = useState(true);

  // Group or filter turbines
  const filteredTurbines = activeZoneFilter === 'ALL'
    ? turbines
    : turbines.filter((t) => t.location?.zone === activeZoneFilter);

  const selectedTurbine = turbines.find((t) => t.turbineId === selectedTurbineId);

  return (
    <div className="bg-wind-panel border border-wind-border flex flex-col relative overflow-hidden">
      {/* Map Control Header */}
      <div className="p-3 border-b border-wind-border bg-wind-surface flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-white animate-spin-slow" />
          <span className="font-bold text-white uppercase tracking-wider">
            India Coastal Tactical Array Radar
          </span>
          <span className="text-wind-secondary text-[11px] hidden sm:inline">
            • 09°01'N 78°16'E • 360 MW Array
          </span>
        </div>

        {/* Zone Filters */}
        <div className="flex items-center gap-1">
          {['ALL', 'Gulf of Mannar Offshore Zone', 'Gujarat Offshore Wind Zone', 'Konkan Offshore Zone', 'Kerala Offshore Zone'].map((z) => (
            <button
              key={z}
              onClick={() => setActiveZoneFilter(z)}
              className={`px-2 py-1 text-[10px] uppercase font-mono border transition-all ${
                activeZoneFilter === z
                  ? 'bg-white text-black border-white font-bold'
                  : 'border-wind-border text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {z === 'ALL' ? z : z.replace(' Offshore Zone', '').replace(' Offshore Wind', '')}
            </button>
          ))}
          <button
            onClick={() => setShowVessels(!showVessels)}
            className={`px-2 py-1 text-[10px] uppercase font-mono border transition-all ml-2 flex items-center gap-1 ${
              showVessels
                ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                : 'border-wind-border text-neutral-600'
            }`}
          >
            <Ship className="w-3 h-3" />
            <span>Vessels ({vessels.length})</span>
          </button>
        </div>
      </div>

      {/* Map Radar Canvas Layout */}
      <div className="relative w-full h-[480px] lg:h-[540px] bg-[#07090b] radar-grid overflow-hidden select-none">
        {/* Subtle circular radar range rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] rounded-full border border-neutral-500 border-dashed" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-neutral-600" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-neutral-700" />
          <div className="absolute h-full w-[1px] bg-neutral-800" />
          <div className="absolute w-full h-[1px] bg-neutral-800" />
        </div>

        {/* Indian port support base */}
        <div className="absolute bottom-6 left-6 p-2 bg-wind-surface/90 border border-wind-border text-[10px] font-mono flex items-center gap-2 pointer-events-none z-10">
          <div className="w-2 h-2 bg-white" />
          <div>
            <div className="text-white font-bold">TUTICORIN PORT BASE</div>
            <div className="text-wind-secondary">O&M Logistics Terminal</div>
          </div>
        </div>

        {/* Offshore Substation (OSS Alpha) in center */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
          <div className="w-5 h-5 bg-neutral-900 border-2 border-white mx-auto flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[9px] font-mono text-white bg-black/80 px-1 mt-0.5 inline-block border border-neutral-700">
            OSS ALPHA 360MW
          </span>
        </div>

        {/* 48 Offshore Turbines Grid Rendering */}
        <div className="absolute inset-x-10 sm:inset-x-20 top-12 bottom-16 grid grid-cols-8 grid-rows-6 gap-2 sm:gap-3 p-4">
          {filteredTurbines.map((t) => {
            const isSelected = selectedTurbineId === t.turbineId;
            let dotColor = 'bg-white border-white';
            let pulse = false;

            if (t.status === 'WARNING') {
              dotColor = 'bg-amber-400 border-amber-300';
            } else if (t.status === 'MAINTENANCE') {
              dotColor = 'bg-neutral-500 border-neutral-400';
            } else if (t.status === 'OFFLINE') {
              dotColor = 'bg-zinc-800 border-zinc-600';
            } else if (t.status === 'CRITICAL') {
              dotColor = 'bg-red-500 border-red-300';
              pulse = true;
            }

            return (
              <div
                key={t.turbineId}
                onClick={() => {
                  setSelectedVessel(null);
                  onSelectTurbine && onSelectTurbine(t);
                }}
                className={`relative group flex flex-col items-center justify-center cursor-pointer p-1 transition-transform ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
              >
                {/* Visual pulse for critical or selected */}
                {(pulse || isSelected) && (
                  <span className="absolute w-6 h-6 rounded-full bg-white/20 animate-beacon" />
                )}

                {/* Turbine Marker Icon */}
                <div
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border rounded-none flex items-center justify-center shadow-lg transition-all ${dotColor} ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                  }`}
                >
                  <span className="text-[8px] font-bold text-black font-mono">
                    {t.turbineId.replace('WT-', '')}
                  </span>
                </div>

                {/* Micro ID label */}
                <span className={`text-[8px] font-mono mt-0.5 tracking-tighter ${
                  isSelected ? 'text-white font-bold underline' : 'text-neutral-500 group-hover:text-neutral-200'
                }`}>
                  {t.turbineId}
                </span>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col bg-wind-panel border border-wind-borderLight p-2 rounded-none shadow-2xl z-30 pointer-events-none min-w-[140px] text-[10px] font-mono text-white">
                  <div className="flex items-center justify-between border-b border-wind-border pb-1 mb-1">
                    <span className="font-bold">{t.turbineId}</span>
                    <span className="text-neutral-400">{t.status}</span>
                  </div>
                  <div>Power: <strong className="text-white">{t.powerOutput} MW</strong></div>
                  <div>Wind: <strong className="text-white">{t.windSpeed} m/s</strong></div>
                  <div>Health: <strong className="text-white">{t.healthScore}%</strong></div>
                  <div>Vibe: <strong className="text-white">{t.vibration} mm/s</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vessels Fleet Positions Overlay */}
        {showVessels &&
          vessels.map((v) => {
            const isSelected = selectedVessel?._id === v._id;
            return (
              <div
                key={v._id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVessel(v);
                }}
                style={{
                  left: `${v.location?.x || 20}%`,
                  top: `${v.location?.y || 50}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-transform ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* AIS pulse */}
                <div className="absolute -inset-2 rounded-full border border-white/40 animate-ping" />

                {/* Vessel Marker */}
                <div className="p-1.5 bg-neutral-900 border border-white text-white flex items-center gap-1 shadow-2xl">
                  <Ship className="w-3 h-3 text-white" />
                  <span className="text-[9px] font-mono font-bold whitespace-nowrap">
                    {v.name}
                  </span>
                </div>

                {/* Subtext info */}
                <div className="text-[8px] font-mono text-neutral-400 bg-black/80 px-1 text-center whitespace-nowrap mt-0.5">
                  {v.status} • {v.speedKnots} kts
                </div>
              </div>
            );
          })}

        {/* Zone Watermark Overlays */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-neutral-700 pointer-events-none tracking-widest uppercase">
          INDIA / TAMIL NADU COAST • GULF OF MANNAR
        </div>
        <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-700 pointer-events-none tracking-widest uppercase">
          GUJARAT / GULF OF KUTCH • MUMBAI / KONKAN
        </div>
        <div className="absolute bottom-16 right-4 text-[10px] font-mono text-neutral-700 pointer-events-none tracking-widest uppercase">
          KERALA / MALABAR COAST • INDIAN OFFSHORE ROUTES
        </div>
      </div>

      {/* Selected Turbine / Vessel Quick Telemetry Bar */}
      {(selectedTurbine || selectedVessel) && (
        <div className="p-3 border-t border-wind-border bg-wind-surface flex flex-wrap items-center justify-between gap-4 font-mono text-xs animate-in slide-in-from-bottom-2">
          {selectedTurbine && !selectedVessel && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wind-bg border border-wind-border">
                  <Wind className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {selectedTurbine.turbineId} — {selectedTurbine.name}
                  </div>
                  <div className="text-wind-secondary text-[11px]">
                    {selectedTurbine.location?.zone} • Depth {selectedTurbine.location?.depthMeters}m
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Status</span>
                  <StatusBadge status={selectedTurbine.status} size="xs" />
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Output</span>
                  <span className="text-white font-bold">{selectedTurbine.powerOutput} MW</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Wind</span>
                  <span className="text-white font-bold">{selectedTurbine.windSpeed} m/s</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Rotor RPM</span>
                  <span className="text-white font-bold">{selectedTurbine.rotorSpeed} RPM</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Gen Temp</span>
                  <span className="text-white font-bold">{selectedTurbine.temperature?.generator}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Health</span>
                  <span className="text-white font-bold">{selectedTurbine.healthScore}%</span>
                </div>
              </div>
            </>
          )}

          {selectedVessel && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wind-bg border border-wind-border">
                  <Ship className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {selectedVessel.name} ({selectedVessel.type})
                  </div>
                  <div className="text-wind-secondary text-[11px]">
                    {selectedVessel.location?.description} • Speed {selectedVessel.speedKnots} kts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Status</span>
                  <StatusBadge status={selectedVessel.status} size="xs" />
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Target</span>
                  <span className="text-white font-bold">{selectedVessel.assignedTurbine}</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">ETA</span>
                  <span className="text-white font-bold">{selectedVessel.eta}</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Crew</span>
                  <span className="text-white font-bold">{selectedVessel.crew} onboard</span>
                </div>
                <div>
                  <span className="text-[10px] text-wind-secondary block uppercase">Weather Limit</span>
                  <StatusBadge status={selectedVessel.weatherSuitability} size="xs" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
