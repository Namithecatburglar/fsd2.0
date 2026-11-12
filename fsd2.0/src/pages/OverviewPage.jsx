import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fan,
  Zap,
  Wrench,
  ClipboardCheck,
  CloudSun,
  AlertTriangle,
  ArrowUpRight,
  Ship,
  Compass,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChartCard } from '../components/common/ChartCard';
import { OffshoreMap } from '../components/offshore-map/OffshoreMap';
import { WeatherWindowCard } from '../components/weather/WeatherWindowCard';
import { useOperations } from '../context/OperationsContext';
import { api } from '../services/api';
import { formatPower, formatSpeed, formatTimeAgo } from '../utils/formatters';

export const OverviewPage = () => {
  const { kpis, weather, activeAlertsCount, maintenanceCount, inspectionsCount, lastUpdated } = useOperations();
  const navigate = useNavigate();

  const [turbines, setTurbines] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [powerTimeline, setPowerTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [turbinesRes, vesselsRes, alertsRes, maintRes, perfRes] = await Promise.allSettled([
          api.getTurbines({ limit: 48 }),
          api.getVessels(),
          api.getAlerts({ status: 'Active' }),
          api.getMaintenance({ status: 'In Progress' }),
          api.getPerformance('DAY'),
        ]);

        if (turbinesRes.status === 'fulfilled' && turbinesRes.value.success) {
          setTurbines(turbinesRes.value.data);
        }
        if (vesselsRes.status === 'fulfilled' && vesselsRes.value.success) {
          setVessels(vesselsRes.value.data);
        }
        if (alertsRes.status === 'fulfilled' && alertsRes.value.success) {
          setRecentAlerts(alertsRes.value.data.slice(0, 4));
        }
        if (maintRes.status === 'fulfilled' && maintRes.value.success) {
          setRecentMaintenance(maintRes.value.data.slice(0, 4));
        }
        if (perfRes.status === 'fulfilled' && perfRes.value.success) {
          setPowerTimeline(perfRes.value.data.productionData || []);
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  const handleTurbineSelect = (t) => {
    navigate(`/turbines/${t.turbineId}`);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Primary Mission-Control Header Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-wind-secondary font-semibold">
            OFFSHORE OPERATIONS • TAMIL NADU OFFSHORE WIND FARM
          </div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wider mt-0.5">
            Live Operations Status
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Updated {lastUpdated ? formatTimeAgo(lastUpdated) : 'just now'}</span>
            <span>•</span>
            <span className="text-white font-medium">Scada Uplink Stable</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/turbines')}
            className="px-4 py-2 border border-wind-border hover:border-white text-xs text-white uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <span>Fleet Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/weather')}
            className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
          >
            <span>Metocean Radar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          title="Turbines Online"
          value={`${kpis.online || 42} / ${kpis.total || 48}`}
          subvalue={`${kpis.availabilityRate || 87.5}% Availability`}
          icon={Fan}
          status={kpis.online >= 40 ? 'positive' : 'warning'}
          trend="+2.1%"
          className="cursor-pointer"
          onClick={() => navigate('/turbines')}
        />

        <KpiCard
          title="Power Output"
          value={kpis.totalPower || 318}
          unit="MW"
          subvalue={`Cap: ${kpis.totalCapacity || 360} MW (${kpis.capacityFactor || 88.3}%)`}
          icon={Zap}
          status="positive"
          trend="+14 MW"
          className="cursor-pointer"
          onClick={() => navigate('/performance')}
        />

        <KpiCard
          title="Maintenance"
          value={String(maintenanceCount.total || 7).padStart(2, '0')}
          subvalue={`${maintenanceCount.overdue || 3} Overdue Orders`}
          icon={Wrench}
          status={maintenanceCount.overdue > 0 ? 'warning' : 'neutral'}
          className="cursor-pointer"
          onClick={() => navigate('/maintenance')}
        />

        <KpiCard
          title="Inspections"
          value={String(inspectionsCount.total || 12).padStart(2, '0')}
          subvalue={`${inspectionsCount.scheduled || 10} Scheduled`}
          icon={ClipboardCheck}
          status="neutral"
          className="cursor-pointer"
          onClick={() => navigate('/inspections')}
        />

        <KpiCard
          title="Marine Weather"
          value={weather?.operationalStatus || 'Operational'}
          subvalue={`Hs ${weather?.waveHeight || 2.4}m • Wind ${weather?.windSpeed || 14.2}m/s`}
          icon={CloudSun}
          status={weather?.operationalStatus === 'SAFE' ? 'positive' : 'warning'}
          className="cursor-pointer"
          onClick={() => navigate('/weather')}
        />

        <KpiCard
          title="Active Alerts"
          value={String(activeAlertsCount || 4).padStart(2, '0')}
          subvalue="1 Critical • 2 Warning"
          icon={AlertTriangle}
          status={activeAlertsCount > 0 ? 'critical' : 'neutral'}
          className="cursor-pointer"
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* Main Mission Control Split: Offshore Map & Marine Weather Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tactical Array Map */}
          <OffshoreMap
            turbines={turbines}
            vessels={vessels}
            onSelectTurbine={handleTurbineSelect}
          />

          {/* 24-Hour Farm Generation Recharts Chart */}
          <ChartCard
            title="Total Farm Generation (24 Hours)"
            subtitle="Real-time SCADA active power delivered to transmission grid (MW)"
            action={
              <button
                onClick={() => navigate('/performance')}
                className="text-[11px] text-neutral-400 hover:text-white uppercase flex items-center gap-1"
              >
                <span>Analytics</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="label" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={[240, 360]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(value) => [`${value} MW`, 'Power Delivered']}
                />
                <Area type="monotone" dataKey="actual" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" />
                <Line type="monotone" dataKey="forecast" stroke="#666666" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right Operations Sidepanel: Weather Window, Critical Alerts, Vessel Status */}
        <div className="space-y-6">
          {/* Operational Weather Window Indicator */}
          <WeatherWindowCard weather={weather} />

          {/* Active Operational Alerts Box */}
          <div className="bg-wind-panel border border-wind-border p-4">
            <div className="flex items-center justify-between pb-3 border-b border-wind-border mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-xs uppercase font-bold text-white tracking-wider">
                  Critical Alerts Triage
                </span>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-[10px] text-neutral-400 hover:text-white uppercase"
              >
                View All ({activeAlertsCount})
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAlerts.length === 0 ? (
                <div className="text-xs text-neutral-500 py-4 text-center">
                  No active critical alerts.
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    onClick={() => navigate('/alerts')}
                    className="p-3 bg-wind-surface border border-wind-border hover:border-neutral-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white uppercase">
                        {alert.title}
                      </span>
                      <StatusBadge status={alert.severity} size="xs" />
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-2">
                      {alert.description}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                      <span className="text-white font-semibold">{alert.turbine}</span>
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Vessels Summary */}
          <div className="bg-wind-panel border border-wind-border p-4">
            <div className="flex items-center justify-between pb-3 border-b border-wind-border mb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-white" />
                <span className="text-xs uppercase font-bold text-white tracking-wider">
                  Active Offshore Fleet
                </span>
              </div>
              <button
                onClick={() => navigate('/vessels')}
                className="text-[10px] text-neutral-400 hover:text-white uppercase"
              >
                Manage ({vessels.length})
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {vessels.slice(0, 4).map((v) => (
                <div
                  key={v._id}
                  onClick={() => navigate('/vessels')}
                  className="p-2.5 bg-wind-surface border border-wind-border flex items-center justify-between cursor-pointer hover:border-neutral-500 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{v.name}</div>
                    <div className="text-[10px] text-neutral-400">
                      {v.type} • {v.assignedTurbine}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={v.status} size="xs" />
                    <div className="text-[10px] text-neutral-400 mt-1">
                      ETA: {v.eta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
