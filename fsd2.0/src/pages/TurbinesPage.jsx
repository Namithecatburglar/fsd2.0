import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fan, Search, Filter, ArrowUpRight, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import { formatDate, formatPower, formatSpeed, formatRPM, formatTemp } from '../utils/formatters';

export const TurbinesPage = () => {
  const [turbines, setTurbines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTurbines = async () => {
      try {
        setLoading(true);
        const res = await api.getTurbines({
          status: statusFilter,
          zone: zoneFilter,
        });
        if (res.success) {
          setTurbines(res.data);
        }
      } catch (err) {
        console.error('Failed to load turbines fleet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTurbines();
  }, [statusFilter, zoneFilter]);

  const columns = [
    {
      key: 'turbineId',
      header: 'Turbine ID',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Fan className="w-3.5 h-3.5 text-white" />
          <span className="font-bold text-white tracking-wider">{val}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'powerOutput',
      header: 'Power Output',
      align: 'right',
      render: (val, row) => (
        <span className="font-bold text-white">
          {row.status === 'OFFLINE' || row.status === 'MAINTENANCE' ? '0.0 MW' : formatPower(val)}
        </span>
      ),
    },
    {
      key: 'windSpeed',
      header: 'Wind Speed',
      align: 'right',
      render: (val) => formatSpeed(val),
    },
    {
      key: 'rotorSpeed',
      header: 'Rotor Speed',
      align: 'right',
      render: (val, row) => (
        <span className="text-neutral-300">
          {row.status === 'OFFLINE' || row.status === 'MAINTENANCE' ? '0.0 RPM' : formatRPM(val)}
        </span>
      ),
    },
    {
      key: 'temperature',
      header: 'Gen Temp',
      align: 'right',
      render: (val) => (
        <span className={val?.generator > 75 ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
          {formatTemp(val?.generator)}
        </span>
      ),
    },
    {
      key: 'lastMaintenance',
      header: 'Last Maintenance',
      render: (val) => formatDate(val),
    },
    {
      key: 'nextInspection',
      header: 'Next Inspection',
      render: (val) => formatDate(val),
    },
    {
      key: 'healthScore',
      header: 'Health Score',
      align: 'right',
      render: (val) => {
        const score = Number(val) || 0;
        let color = 'bg-white';
        if (score < 75) color = 'bg-red-500';
        else if (score < 85) color = 'bg-amber-400';

        return (
          <div className="flex items-center justify-end gap-2">
            <span className="font-bold text-white">{score}%</span>
            <div className="w-12 h-1.5 bg-neutral-800 rounded-none overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        );
      },
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
          title="Open Diagnostics"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Fleet Summary Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Fan className="w-5 h-5 text-white" />
            Turbine Fleet SCADA Roster
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            48 Direct-Drive 8.0 MW Turbines across Zones Alpha, Bravo, Charlie, and Delta.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'ONLINE', 'MAINTENANCE', 'WARNING', 'OFFLINE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all ${
                statusFilter === status
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-wind-surface border-wind-border text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Sub-tabs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Zone Array:</span>
        {['ALL', 'Gulf of Mannar Offshore Zone', 'Gujarat Offshore Wind Zone', 'Konkan Offshore Zone', 'Kerala Offshore Zone'].map((z) => (
          <button
            key={z}
            onClick={() => setZoneFilter(z)}
            className={`px-2.5 py-1 text-[11px] uppercase border transition-all ${
              zoneFilter === z
                ? 'border-neutral-400 text-white font-semibold bg-neutral-900'
                : 'border-wind-border/60 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Turbines DataTable */}
      <DataTable
        columns={columns}
        data={turbines}
        keyField="turbineId"
        onRowClick={(row) => navigate(`/turbines/${row.turbineId}`)}
        pageSize={12}
        searchPlaceholder="Search by Turbine ID (e.g. WT-024) or zone..."
        searchField="turbineId"
      />
    </div>
  );
};
