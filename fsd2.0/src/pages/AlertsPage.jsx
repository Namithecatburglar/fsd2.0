import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  Filter,
  Clock,
  ShieldAlert,
  Search,
  CheckCheck,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import { formatDate, formatTimeAgo } from '../utils/formatters';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts({
        severity: severityFilter,
        status: statusFilter,
        search: searchTerm,
      });
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter, searchTerm]);

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      await loadAlerts();
    } catch (err) {
      alert(`Acknowledgment failed: ${err.message}`);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      await loadAlerts();
    } catch (err) {
      alert(`Resolution failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            Operational Alert Center & Triage
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time SCADA anomaly detection, metocean weather warnings, and turbine safety escalations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 border border-wind-border bg-wind-surface text-xs">
            <span className="text-neutral-500 uppercase text-[10px] block">Active Alarm Count</span>
            <span className="text-white font-bold text-sm">
              {alerts.filter((a) => a.status === 'Active').length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-wind-panel border border-wind-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alarm title, turbine, or scope..."
            className="w-full bg-wind-bg border border-wind-border pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Severity:</span>
          {['ALL', 'Critical', 'Warning', 'Information'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 text-xs border uppercase tracking-wider transition-all ${
                severityFilter === sev
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-wind-surface border-wind-border text-neutral-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Status:</span>
          {['ALL', 'Active', 'Acknowledged', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] border uppercase transition-all ${
                statusFilter === st
                  ? 'border-neutral-400 text-white font-semibold bg-neutral-900'
                  : 'border-wind-border/60 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-12 text-center bg-wind-panel border border-wind-border text-neutral-500 text-xs">
            No alarms or operational notifications match the selected criteria.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 bg-wind-panel border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.severity === 'Critical' && alert.status === 'Active'
                  ? 'border-red-500/60 bg-red-950/10'
                  : 'border-wind-border hover:border-neutral-500'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="font-bold text-sm text-white tracking-wider">
                    {alert.title}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-white text-[11px] font-bold">
                    {alert.turbine}
                  </span>
                  <StatusBadge status={alert.severity} size="xs" />
                  <StatusBadge status={alert.status} size="xs" />
                  <span className="text-neutral-500 text-xs ml-auto md:ml-0">
                    {formatTimeAgo(alert.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {alert.description}
                </p>

                {/* Audit trail */}
                {(alert.acknowledgedBy || alert.resolvedBy) && (
                  <div className="text-[10px] text-neutral-500 mt-2 flex items-center gap-4">
                    {alert.acknowledgedBy && (
                      <span>Ack by: <strong className="text-neutral-300">{alert.acknowledgedBy}</strong> ({formatTimeAgo(alert.acknowledgedAt)})</span>
                    )}
                    {alert.resolvedBy && (
                      <span>Resolved by: <strong className="text-neutral-300">{alert.resolvedBy}</strong> ({formatTimeAgo(alert.resolvedAt)})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-wind-border">
                {alert.status === 'Active' && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="px-3 py-1.5 border border-wind-border hover:border-white text-xs text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {alert.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(alert._id)}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}

                {alert.status === 'Resolved' && (
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Closed</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
