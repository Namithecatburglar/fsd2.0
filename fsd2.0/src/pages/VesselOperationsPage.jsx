import React, { useState, useEffect } from 'react';
import {
  Ship,
  Compass,
  Navigation,
  Anchor,
  Users,
  Fuel,
  ArrowUpRight,
  Shield,
  Edit2,
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { OffshoreMap } from '../components/offshore-map/OffshoreMap';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';

export const VesselOperationsPage = () => {
  const [vessels, setVessels] = useState([]);
  const [turbines, setTurbines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Assign form state
  const [assignData, setAssignData] = useState({
    turbineId: 'WT-001',
    eta: '09:00',
    status: 'En Route',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [vesselRes, turbineRes] = await Promise.all([
        api.getVessels(),
        api.getTurbines(),
      ]);

      if (vesselRes.success) setVessels(vesselRes.data);
      if (turbineRes.success) setTurbines(turbineRes.data);
    } catch (err) {
      console.error('Failed to load marine fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (vessel) => {
    setSelectedVessel(vessel);
    setAssignData({
      turbineId: vessel.assignedTurbine !== 'None' ? vessel.assignedTurbine : 'WT-001',
      eta: vessel.eta !== '--:--' ? vessel.eta : '10:30',
      status: vessel.status,
    });
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!selectedVessel) return;

    try {
      await api.assignTurbineToVessel(selectedVessel._id, assignData);
      setAssignModalOpen(false);
      setSelectedVessel(null);
      await loadData();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Vessel Name',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Ship className="w-3.5 h-3.5 text-white" />
          <div>
            <span className="font-bold text-white tracking-wider">{val}</span>
            <div className="text-[10px] text-neutral-400">{row.callsign}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Vessel Type',
      render: (val) => <span className="text-neutral-300 font-medium">{val}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'location',
      header: 'Current Position / AIS',
      render: (val) => (
        <div>
          <span className="text-white">{val?.description}</span>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            {val?.lat}° N, {val?.lng}° E
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTurbine',
      header: 'Assigned Target',
      render: (val) => (
        <span className={val !== 'None' ? 'font-bold text-white' : 'text-neutral-500'}>
          {val}
        </span>
      ),
    },
    {
      key: 'speedKnots',
      header: 'Speed',
      align: 'right',
      render: (val) => <span className="text-white">{val} kts</span>,
    },
    {
      key: 'eta',
      header: 'ETA',
      render: (val) => <span className="text-neutral-300">{val}</span>,
    },
    {
      key: 'crew',
      header: 'Crew Onboard',
      align: 'right',
      render: (val, row) => (
        <span className="text-white font-medium">
          {val} / {row.maxCapacity}
        </span>
      ),
    },
    {
      key: 'weatherSuitability',
      header: 'Metocean Limit',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenAssign(row);
          }}
          className="px-2.5 py-1 text-[11px] border border-wind-border hover:border-white text-neutral-300 hover:text-white transition-colors"
        >
          Dispatch / Reassign
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Ship className="w-5 h-5 text-white" />
            Marine Vessel Fleet Operations & AIS Logistics
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Service Operation Vessels (SOV), Crew Transfer Vessels (CTV), and Subsea Survey tracking across Indian maritime routes.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Active Vessels</span>
            <span className="text-white font-bold">{vessels.filter(v => v.status !== 'At Port').length} at Sea</span>
          </div>
          <div className="border-l border-wind-border pl-4">
            <span className="text-neutral-500 block text-[10px] uppercase">Total Crew</span>
            <span className="text-white font-bold">{vessels.reduce((sum, v) => sum + (v.crew || 0), 0)} Offshore</span>
          </div>
        </div>
      </div>

      {/* Offshore Radar Visualization */}
      <OffshoreMap
        turbines={turbines}
        vessels={vessels}
        onSelectTurbine={(t) => console.log('Selected turbine:', t.turbineId)}
      />

      {/* Vessels Table */}
      <DataTable
        columns={columns}
        data={vessels}
        keyField="_id"
        pageSize={8}
        searchPlaceholder="Search vessel name, type, or assigned turbine..."
        searchField="name"
      />

      {/* Dispatch / Reassign Modal */}
      {selectedVessel && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Dispatch / Reassign ${selectedVessel.name}`}
          subtitle={`Type: ${selectedVessel.type} • Callsign: ${selectedVessel.callsign}`}
        >
          <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 uppercase text-[11px] mb-1">
                Target Turbine / Position
              </label>
              <select
                value={assignData.turbineId}
                onChange={(e) => setAssignData({ ...assignData, turbineId: e.target.value })}
                className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono focus:outline-none focus:border-white"
              >
                <option value="None">None / Holding Position</option>
                <option value="Tuticorin Port">V.O. Chidambaranar Port, Tuticorin (Return Base)</option>
                {turbines.map((t) => (
                  <option key={t.turbineId} value={t.turbineId}>
                    {t.turbineId} ({t.location?.zone}) - {t.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 uppercase text-[11px] mb-1">
                  Vessel Status
                </label>
                <select
                  value={assignData.status}
                  onChange={(e) => setAssignData({ ...assignData, status: e.target.value })}
                  className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono focus:outline-none focus:border-white"
                >
                  <option value="At Port">At Port</option>
                  <option value="En Route">En Route</option>
                  <option value="On Site">On Site</option>
                  <option value="Returning">Returning</option>
                  <option value="Weather Delayed">Weather Delayed</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase text-[11px] mb-1">
                  Estimated Arrival (ETA)
                </label>
                <input
                  type="text"
                  value={assignData.eta}
                  onChange={(e) => setAssignData({ ...assignData, eta: e.target.value })}
                  placeholder="e.g. 08:30"
                  className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="p-3 bg-wind-surface border border-wind-border text-[11px] text-neutral-400">
              Safety Protocol: Verify metocean Hs limit (&lt; {selectedVessel.maxHs}m) before clearing vessel gangway deployment.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-wind-border">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 border border-wind-border text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200"
              >
                Confirm Dispatch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
