import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Waves,
  Wind,
  Eye,
  Thermometer,
  Compass,
  Gauge,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

import { WeatherWindowCard } from '../components/weather/WeatherWindowCard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

export const MarineWeatherPage = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const [currentRes, forecastRes] = await Promise.all([
          api.getCurrentWeather(),
          api.getWeatherForecast(),
        ]);

        if (currentRes.success) setWeather(currentRes.data);
        if (forecastRes.success) setForecast(forecastRes.data);
      } catch (err) {
        console.error('Failed to load marine weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-wind-secondary font-semibold">
            METOCEAN TELEMETRY BUOY • GULF OF MANNAR
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2 mt-0.5">
            <CloudSun className="w-5 h-5 text-white" />
            Marine Hydrodynamics & Weather Forecasting
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Indian coastal wave spectrum, significant wave height ($H_s$), monsoon swell periods, and offshore transfer envelopes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">STATUS:</span>
          <StatusBadge status={weather?.operationalStatus || 'SAFE'} size="md" />
        </div>
      </div>

      {/* 7 Current Conditions Technical Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Wind className="w-3.5 h-3.5 text-white" />
            <span>Wind Speed</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.windSpeed || 14.2} m/s</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">{weather?.windDirection || 'SW 225°'} • Southwest Monsoon</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Waves className="w-3.5 h-3.5 text-white" />
            <span>Wave Height</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.waveHeight || 2.4} m</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Significant (Hs)</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>Wave Period</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.wavePeriod || 7.8} s</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Dominant Swell</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Visibility</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.visibility || 18} km</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Clear Marine View</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Thermometer className="w-3.5 h-3.5 text-white" />
            <span>Sea Temp</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.seaTemperature || 14}°C</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Depth -1.5m</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Thermometer className="w-3.5 h-3.5 text-white" />
            <span>Air Temp</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.airTemperature || 12}°C</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Deck Level</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase mb-1">
            <Gauge className="w-3.5 h-3.5 text-white" />
            <span>Tidal Current</span>
          </div>
          <div className="text-xl font-bold text-white">{weather?.currentSpeed || 1.4} kts</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Ebb Flow 120°</div>
        </div>
      </div>

      {/* Operational Weather Window Indicator Card */}
      <WeatherWindowCard weather={weather} />

      {/* 4 Marine Forecast Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Wind Speed Forecast */}
        <ChartCard
          title="Wind Velocity Forecast (48 Hours)"
          subtitle="Hub-height aerodynamic wind velocity (m/s) with turbine cut-out threshold (25 m/s)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 25]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} m/s`, 'Wind Velocity']}
              />
              <Area type="monotone" dataKey="windSpeed" stroke="#ffffff" strokeWidth={2} fill="url(#windGrad)" />
              <Line type="monotone" dataKey={() => 12.0} stroke="#71717a" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Rope Access Limit" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Wave Height (Hs) Forecast */}
        <ChartCard
          title="Significant Wave Height Hs (48 Hours)"
          subtitle="Hydrodynamic swell forecast with CTV limit (1.8m) and SOV limit (2.5m)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 4.5]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} m`, 'Wave Height Hs']}
              />
              <Line type="monotone" dataKey="waveHeight" stroke="#ffffff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={() => 1.8} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="CTV Boarding Limit" />
              <Line type="monotone" dataKey={() => 2.5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="SOV Gangway Limit" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Wave Period (seconds) */}
        <ChartCard
          title="Dominant Wave Period Ts (seconds)"
          subtitle="Swell period analysis for dynamic vessel motion stabilization"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[4, 12]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} s`, 'Period']}
              />
              <Line type="monotone" dataKey="wavePeriod" stroke="#a1a1aa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Visibility (km) */}
        <ChartCard
          title="Atmospheric Visibility (km)"
          subtitle="Surface optical distance for helicopter and crew vessel navigation"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 25]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} km`, 'Visibility']}
              />
              <Bar dataKey="visibility" fill="#3f3f46" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
