import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { ChartCard } from '../components/common/ChartCard';
import { KpiCard } from '../components/common/KpiCard';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import { formatPower } from '../utils/formatters';

export const PerformancePage = () => {
  const [timeframe, setTimeframe] = useState('MONTH'); // DAY, WEEK, MONTH, YEAR
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const res = await api.getPerformance(timeframe);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load performance analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [timeframe]);

  const summary = data?.summary || {
    installedCapacity: 360,
    currentOutput: 318.0,
    capacityFactor: 88.3,
    availability: 96.4,
    energyLossesYTD: '14.2 GWh',
    carbonOffsetYTD: '412,000 tCO2e',
  };

  const columns = [
    {
      key: 'turbineId',
      header: 'Turbine ID',
      render: (val) => <span className="font-bold text-white tracking-wider">{val}</span>,
    },
    {
      key: 'zone',
      header: 'Array Zone',
      render: (val) => <span className="text-neutral-400">{val}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'powerOutput',
      header: 'Actual Output',
      align: 'right',
      render: (val) => <span className="font-bold text-white">{formatPower(val)}</span>,
    },
    {
      key: 'availability',
      header: 'Availability',
      align: 'right',
      render: (val) => <span className="text-neutral-200">{val}%</span>,
    },
    {
      key: 'healthScore',
      header: 'Health Score',
      align: 'right',
      render: (val) => {
        const score = Number(val) || 0;
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="font-bold text-white">{score}%</span>
            <div className="w-12 h-1.5 bg-neutral-800">
              <div
                className={`h-full ${score > 85 ? 'bg-white' : 'bg-amber-400'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'operatingHours',
      header: 'Run Hours',
      align: 'right',
      render: (val) => <span className="text-neutral-400">{Number(val).toLocaleString()} hrs</span>,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/turbines/${row.turbineId}`);
          }}
          className="p-1 border border-wind-border hover:border-white text-neutral-400 hover:text-white transition-colors"
          title="Telemetry Diagnostics"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner with Timeframe Selection */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-white" />
            Overall Wind Farm Performance & Production Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Indian offshore 360 MW generation curves, capacity factor trends, and downtime root-cause analysis.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center border border-wind-border bg-wind-surface p-0.5 text-xs">
          {['DAY', 'WEEK', 'MONTH', 'YEAR'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 uppercase tracking-wider transition-colors ${
                timeframe === t
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Performance Headline KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Installed Capacity"
          value={summary.installedCapacity}
          unit="MW"
          subvalue="48 x 8.0 MW Direct Drive"
          status="neutral"
        />

        <KpiCard
          title="Current Farm Output"
          value={summary.currentOutput}
          unit="MW"
          subvalue={`Delivering to Grid`}
          status="positive"
          trend="+18 MW"
        />

        <KpiCard
          title="Capacity Factor"
          value={`${summary.capacityFactor}%`}
          subvalue="Benchmark: > 80% Rated"
          status={summary.capacityFactor > 80 ? 'positive' : 'warning'}
        />

        <KpiCard
          title="Fleet Availability"
          value={`${summary.availability}%`}
          subvalue="Target: 95.0% Operational"
          status="positive"
          trend="Exceeding"
        />
      </div>

      {/* 2 Primary Production & Downtime Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Forecast Production */}
        <ChartCard
          title={`Generation Output vs Forecast (${timeframe})`}
          subtitle="Energy delivered (MWh) vs P50 production forecast"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.productionData || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="label" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area type="monotone" name="Actual Generation" dataKey="actual" stroke="#ffffff" strokeWidth={2} fill="url(#actualGrad)" />
              <Line type="monotone" name="Forecast P50" dataKey="forecast" stroke="#71717a" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Downtime & Losses Root Causes */}
        <ChartCard
          title={`Downtime & Energy Curtailment (${timeframe})`}
          subtitle="Scheduled service hours vs unscheduled faults and grid curtailment"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.downtimeData || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="label" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#333333', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Bar name="Scheduled Maintenance" dataKey="scheduledMaintenance" stackId="a" fill="#ffffff" />
              <Bar name="Unscheduled Fault" dataKey="unscheduledFault" stackId="a" fill="#71717a" />
              <Bar name="Grid Curtailment" dataKey="gridCurtailment" stackId="a" fill="#27272a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Turbine Comparison Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold text-white tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            Individual Turbine Production & Availability Ranking
          </h3>
          <span className="text-[11px] text-neutral-400">
            Sortable by generation output and availability percentage
          </span>
        </div>

        <DataTable
          columns={columns}
          data={data?.turbineComparison || []}
          keyField="turbineId"
          pageSize={12}
          searchPlaceholder="Search turbine ID or array zone..."
          searchField="turbineId"
          onRowClick={(row) => navigate(`/turbines/${row.turbineId}`)}
        />
      </div>
    </div>
  );
};
