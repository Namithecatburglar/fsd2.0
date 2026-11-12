import React from 'react';
import { Waves, Wind, ShieldCheck, AlertOctagon, Clock, Calendar } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const WeatherWindowCard = ({ weather }) => {
  const windowData = weather?.operationalWindow || {
    status: 'SAFE',
    nextSafeWindow: 'Tomorrow 06:00 – 14:00',
    maxSafeWaveHeight: 2.0,
    maxSafeWindSpeed: 12.0,
    currentWaveHeight: weather?.waveHeight || 2.4,
    currentWindSpeed: weather?.windSpeed || 14.2,
  };

  const isSafe = windowData.status === 'SAFE';

  return (
    <div className="bg-wind-panel border border-wind-border p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-wind-border">
        <div className="flex items-center gap-2">
          {isSafe ? (
            <ShieldCheck className="w-5 h-5 text-white" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <h3 className="text-xs font-mono uppercase font-bold text-white tracking-widest">
              Operational Weather Window
            </h3>
            <span className="text-[11px] font-mono text-wind-secondary">
              Metocean Marine Suitability
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase block text-wind-secondary">
            Vessel Access
          </span>
          <StatusBadge status={windowData.status} size="sm" />
        </div>
      </div>

      {/* Primary Indicator Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-mono">
        <div className="p-3 bg-wind-surface border border-wind-border">
          <div className="flex items-center gap-2 text-wind-secondary text-[11px] mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>NEXT SAFE WINDOW</span>
          </div>
          <div className="text-sm font-bold text-white">
            {windowData.nextSafeWindow}
          </div>
          <span className="text-[10px] text-wind-secondary block mt-1">
            Optimal transfer sea state
          </span>
        </div>

        <div className="p-3 bg-wind-surface border border-wind-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-wind-secondary text-[11px] mb-1">
              <Waves className="w-3.5 h-3.5" />
              <span>WAVE HEIGHT (Hs)</span>
            </div>
            <div className="text-lg font-bold text-white">
              {windowData.currentWaveHeight || weather?.waveHeight} m
            </div>
            <span className="text-[10px] text-wind-secondary">
              Limit: {windowData.maxSafeWaveHeight || 2.0} m
            </span>
          </div>

          <div className="text-right border-l border-wind-border/50 pl-4">
            <div className="flex items-center gap-1.5 text-wind-secondary text-[11px] mb-1 justify-end">
              <Wind className="w-3.5 h-3.5" />
              <span>WIND SPEED</span>
            </div>
            <div className="text-lg font-bold text-white">
              {windowData.currentWindSpeed || weather?.windSpeed} m/s
            </div>
            <span className="text-[10px] text-wind-secondary">
              Limit: {windowData.maxSafeWindSpeed || 12.0} m/s
            </span>
          </div>
        </div>
      </div>

      {/* Marine Safety Advisory Notice */}
      <div className="pt-3 border-t border-wind-border/50 flex items-center justify-between text-[11px] font-mono text-wind-secondary">
        <span>CTV Boarding Limit: 1.8m Hs • Walk-to-Work SOV Limit: 2.5m Hs</span>
        <span className="text-neutral-400">Gulf of Mannar Metocean Buoy • Southwest Monsoon</span>
      </div>
    </div>
  );
};
