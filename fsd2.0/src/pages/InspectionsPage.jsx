import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Calendar,
  List,
  Eye,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionModal } from '../components/inspections/InspectionModal';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

export const InspectionsPage = () => {
  const [inspections, setInspections] = useState([]);
  const [turbines, setTurbines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIST'); // LIST or CALENDAR
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const res = await api.getInspections({
        status: statusFilter,
        type: typeFilter,
      });
      if (res.success) {
        setInspections(res.data);
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    const fetchTurbines = async () => {
      try {
        const res = await api.getTurbines();
        if (res.success) setTurbines(res.data);
      } catch (err) {
        console.warn('Failed to load turbines list');
      }
    };
    fetchTurbines();
  }, []);

  const handleSaveInspection = async (formData) => {
    try {
      if (editingInspection) {
        await api.updateInspection(editingInspection.inspectionId, formData);
      } else {
        await api.createInspection(formData);
      }
      setIsModalOpen(false);
      setEditingInspection(null);
      await loadInspections();
    } catch (err) {
      alert(`Failed to save inspection: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'inspectionId',
      header: 'Inspection ID',
      render: (val) => (
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5 text-white" />
          <span className="font-bold text-white tracking-wider">{val}</span>
        </div>
      ),
    },
    {
      key: 'turbine',
      header: 'Turbine',
      render: (val) => <span className="font-bold text-white">{val}</span>,
    },
    {
      key: 'type',
      header: 'Inspection Type',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-white">{val}</span>
          <div className="text-[10px] text-neutral-400 mt-0.5">{row.method}</div>
        </div>
      ),
    },
    {
      key: 'inspector',
      header: 'Inspector / Unit',
      render: (val) => <span className="text-neutral-200">{val}</span>,
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'findings',
      header: 'Findings / Telemetry',
      render: (val) => (
        <div className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md">
          {val}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInspection(row);
            }}
            className="p-1 border border-wind-border hover:border-white text-neutral-400 hover:text-white transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingInspection(row);
              setIsModalOpen(true);
            }}
            className="px-2 py-1 text-[11px] border border-wind-border hover:border-white text-neutral-300 hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  // Calendar grouping helper (e.g. Next 14 days)
  const groupedByDay = inspections.reduce((acc, item) => {
    const day = formatDate(item.scheduledDate);
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-white" />
            Inspection Management & Statutory QA Audit
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Blade drones, gearbox borescopes, electrical thermography, and ROV subsea inspections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-wind-border bg-wind-surface p-0.5 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                viewMode === 'CALENDAR' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingInspection(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Inspection</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Status:</span>
          {['ALL', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED', 'OVERDUE'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs border uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-wind-surface border-wind-border text-neutral-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Discipline:</span>
          {['ALL', 'Blade Inspection', 'Gearbox Inspection', 'Subsea Inspection', 'Structural Inspection'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-[11px] border uppercase transition-all ${
                typeFilter === t
                  ? 'border-neutral-400 text-white font-semibold bg-neutral-900'
                  : 'border-wind-border/60 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t.replace(' Inspection', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional View: List vs Calendar/Timeline */}
      {viewMode === 'LIST' ? (
        <DataTable
          columns={columns}
          data={inspections}
          keyField="inspectionId"
          pageSize={10}
          searchPlaceholder="Search inspection ID, turbine, type, or inspector..."
          onRowClick={(row) => setSelectedInspection(row)}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedByDay).map(([day, items]) => (
              <div key={day} className="bg-wind-panel border border-wind-border p-4">
                <div className="flex items-center justify-between pb-2 border-b border-wind-border mb-3">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    {day}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {items.length} Task{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((i) => (
                    <div
                      key={i._id}
                      onClick={() => setSelectedInspection(i)}
                      className="p-3 bg-wind-surface border border-wind-border hover:border-neutral-400 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white">{i.turbine}</span>
                        <StatusBadge status={i.status} size="xs" />
                      </div>
                      <div className="text-neutral-300 font-medium">{i.type}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        Method: {i.method} • {i.inspector}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInspection(null);
        }}
        onSubmit={handleSaveInspection}
        initialData={editingInspection}
        turbines={turbines}
      />

      {/* Inspection Findings Deep Dive Modal */}
      {selectedInspection && (
        <Modal
          isOpen={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          title={`${selectedInspection.inspectionId} — ${selectedInspection.type}`}
          subtitle={`Turbine: ${selectedInspection.turbine} • Inspector: ${selectedInspection.inspector}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3 p-3 bg-wind-surface border border-wind-border">
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Status</span>
                <StatusBadge status={selectedInspection.status} size="xs" />
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Method</span>
                <span className="text-white font-bold">{selectedInspection.method}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Scheduled Execution</span>
                <span className="text-white">{formatDate(selectedInspection.scheduledDate)}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Severity Discovered</span>
                <span className="text-white font-bold">{selectedInspection.severityFound || 'None'}</span>
              </div>
            </div>

            <div>
              <div className="text-neutral-400 uppercase text-[11px] font-bold mb-1">
                Inspection Findings & Defect Record
              </div>
              <div className="p-3 bg-wind-bg border border-wind-border text-neutral-200 leading-relaxed">
                {selectedInspection.findings || 'No formal findings reported.'}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-wind-border">
              <button
                onClick={() => {
                  setEditingInspection(selectedInspection);
                  setSelectedInspection(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs"
              >
                Edit Inspection Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
