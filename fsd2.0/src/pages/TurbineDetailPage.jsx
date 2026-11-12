import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Fan,
  Zap,
  Wind,
  Gauge,
  Thermometer,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

import { StatusBadge } from '../components/common/StatusBadge';
import { ChartCard } from '../components/common/ChartCard';
import { KpiCard } from '../components/common/KpiCard';
import { api } from '../services/api';
import { formatDate, formatPower, formatSpeed, formatRPM, formatTemp } from '../utils/formatters';

export const TurbineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turbine, setTurbine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TELEMETRY'); // TELEMETRY, LOGS, WORK_ORDERS
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    const fetchTurbineDetail = async () => {
      try {
        setLoading(true);
        const res = await api.getTurbineById(id || 'WT-024');
        if (res.success) {
          setTurbine(res.data);
        }

        const woRes = await api.getMaintenance({ turbine: id || 'WT-024' });
        if (woRes.success) {
          setWorkOrders(woRes.data);
        }
      } catch (err) {
        console.error('Failed to load turbine telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurbineDetail();
  }, [id]);

  if (loading || !turbine) {
    return (
      <div className="p-8 text-center font-mono text-xs text-neutral-400">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mx-auto mb-3" />
        POLLING SCADA TELEMETRY BUFFER FOR ASSET {id}...
      </div>
    );
  }

  // Format historical log data for Recharts
  const chartData = (turbine.historicalLog || []).map((entry, idx) => {
    const d = new Date(entry.timestamp);
    const hourLabel = `${d.getHours().toString().padStart(2, '0')}:00`;
    return {
      time: hourLabel,
      powerOutput: entry.powerOutput,
      windSpeed: entry.windSpeed,
      generatorTemp: entry.generatorTemp,
      gearboxTemp: entry.gearboxTemp,
      vibration: entry.vibration,
      availability: 98.4 - (idx % 3 === 0 ? 0.4 : 0),
    };
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Top Asset Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/turbines')}
          className="px-3 py-1.5 border border-wind-border hover:border-white text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Fleet Roster</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">ASSET CLASS:</span>
          <span className="text-white font-semibold">{turbine.model}</span>
        </div>
      </div>

      {/* Primary Technical Asset Header */}
      <div className="bg-wind-panel border border-wind-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-wind-secondary">
            TAMIL NADU OFFSHORE WIND FARM • {turbine.location?.zone}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {turbine.turbineId}
            </h1>
            <StatusBadge status={turbine.status} size="md" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-2">
            <span>Lat: {turbine.location?.lat}° N</span>
            <span>•</span>
            <span>Lng: {turbine.location?.lng}° E</span>
            <span>•</span>
            <span>Seabed Depth: {turbine.location?.depthMeters}m</span>
          </div>
        </div>

        {/* Operating Metadata Badges */}
        <div className="grid grid-cols-3 gap-3 border border-wind-border p-3 bg-wind-surface">
          <div>
            <div className="text-[10px] uppercase text-neutral-500">Last Service</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {formatDate(turbine.lastMaintenance)}
            </div>
          </div>
          <div className="border-l border-wind-border pl-3">
            <div className="text-[10px] uppercase text-neutral-500">Next Audit</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {formatDate(turbine.nextInspection)}
            </div>
          </div>
          <div className="border-l border-wind-border pl-3">
            <div className="text-[10px] uppercase text-neutral-500">Run Time</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {Number(turbine.operatingHours).toLocaleString()} hrs
            </div>
          </div>
        </div>
      </div>

      {/* 8 Telemetry Sensor KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Active Power</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.powerOutput} MW</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Rated 8.0 MW</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Wind Velocity</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.windSpeed} m/s</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Yaw: {turbine.yawAngle}°</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Rotor RPM</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.rotorSpeed}</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Pitch: {turbine.pitchAngle}°</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Gen Temp</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.temperature?.generator}°C</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Limit 85°C</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Gearbox Temp</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.temperature?.gearbox}°C</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Limit 80°C</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Vibration</div>
          <div className={`text-lg font-bold mt-1 ${turbine.vibration > 3.0 ? 'text-red-400' : 'text-white'}`}>
            {turbine.vibration} mm/s
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Iso &lt; 3.0</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Availability</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.availability}%</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">YTD Factor</div>
        </div>

        <div className="bg-wind-panel border border-wind-border p-3">
          <div className="text-[10px] text-neutral-500 uppercase">Health Score</div>
          <div className="text-lg font-bold text-white mt-1">{turbine.healthScore}%</div>
          <div className="text-[9px] text-neutral-400 mt-0.5">
            {turbine.healthScore > 85 ? 'Optimal' : 'Investigate'}
          </div>
        </div>
      </div>

      {/* 4 Professional Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Power Output Last 24 Hours */}
        <ChartCard
          title="Active Power Output (MW) — Last 24 Hours"
          subtitle="Direct drive turbine electric feed compared against rated aerodynamic power"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="turbinePowerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 8.5]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} MW`, 'Power Output']}
              />
              <Area type="monotone" dataKey="powerOutput" stroke="#ffffff" strokeWidth={2} fill="url(#turbinePowerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Wind Velocity */}
        <ChartCard
          title="Wind Velocity (m/s) — Last 24 Hours"
          subtitle="Nacelle ultrasonic anemometer readings"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 25]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} m/s`, 'Wind Speed']}
              />
              <Line type="monotone" dataKey="windSpeed" stroke="#d4d4d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Component Temperatures (Generator vs Gearbox Multi-line) */}
        <ChartCard
          title="Thermal Diagnostics — Generator & Gearbox (°C)"
          subtitle="Stator winding PT100 and high-speed shaft bearing thermal profile"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[30, 90]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line name="Generator Temp" type="monotone" dataKey="generatorTemp" stroke="#ffffff" strokeWidth={2} dot={false} />
              <Line name="Gearbox Temp" type="monotone" dataKey="gearboxTemp" stroke="#71717a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Vibration & Health Score Trend */}
        <ChartCard
          title="Mechanical Vibration Spectrum (mm/s)"
          subtitle="Tri-axial drive train accelerometer telemetry"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[0, 5]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(val) => [`${val} mm/s`, 'Vibration']}
              />
              <Line type="monotone" dataKey="vibration" stroke="#ffffff" strokeWidth={2} dot={false} />
              {/* Threshold indicator line at 3.0 mm/s */}
              <Line type="monotone" dataKey={() => 3.0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Alarm Threshold" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Associated Work Orders & Maintenance History */}
      <div className="bg-wind-panel border border-wind-border p-5">
        <div className="flex items-center justify-between pb-3 border-b border-wind-border mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-white" />
            <h3 className="text-xs uppercase font-bold text-white tracking-wider">
              Work Orders & Action Logs for {turbine.turbineId}
            </h3>
          </div>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-[11px] text-neutral-400 hover:text-white uppercase"
          >
            Create Task
          </button>
        </div>

        {workOrders.length === 0 ? (
          <div className="text-xs text-neutral-500 py-6 text-center">
            No pending or historical corrective work orders for asset {turbine.turbineId}.
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <div
                key={wo._id}
                className="p-3 bg-wind-surface border border-wind-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{wo.workOrderId}</span>
                    <span>•</span>
                    <span className="text-neutral-200">{wo.issue}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Assigned: <strong className="text-neutral-300">{wo.assignedTo}</strong> • Scheduled: {formatDate(wo.scheduledDate)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={wo.priority} size="xs" />
                  <StatusBadge status={wo.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
