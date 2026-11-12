import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  MessageSquare,
  ChevronRight,
  Send,
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { WorkOrderModal } from '../components/maintenance/WorkOrderModal';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { formatDate, formatTimeAgo } from '../utils/formatters';

export const MaintenancePage = () => {
  const [tasks, setTasks] = useState([]);
  const [turbines, setTurbines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const res = await api.getMaintenance({
        status: statusFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    const fetchTurbinesList = async () => {
      try {
        const res = await api.getTurbines();
        if (res.success) setTurbines(res.data);
      } catch (err) {
        console.warn('Failed to load turbines list for selector');
      }
    };
    fetchTurbinesList();
  }, []);

  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        await api.updateMaintenance(editingTask.workOrderId, formData);
      } else {
        await api.createMaintenance(formData);
      }
      setIsCreateOpen(false);
      setEditingTask(null);
      await loadMaintenance();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      await api.updateMaintenance(task.workOrderId, { status: newStatus });
      await loadMaintenance();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedTaskForNotes) return;

    try {
      const res = await api.addMaintenanceNote(selectedTaskForNotes.workOrderId, newNoteText);
      if (res.success) {
        setSelectedTaskForNotes(res.data);
        setNewNoteText('');
        await loadMaintenance();
      }
    } catch (err) {
      alert(`Failed to post note: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'workOrderId',
      header: 'Work Order',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-white" />
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
      key: 'issue',
      header: 'Issue Description',
      render: (val, row) => (
        <div>
          <div className="font-medium text-white">{val}</div>
          {row.description && (
            <div className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned Technician',
      render: (val, row) => (
        <div>
          <span className="text-white font-semibold">{val}</span>
          {row.vesselRequired !== 'None' && (
            <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
              Vessel: {row.vesselRequired}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={val} size="xs" />
          <select
            value={val}
            onChange={(e) => {
              e.stopPropagation();
              handleQuickStatusChange(row, e.target.value);
            }}
            className="bg-wind-bg border border-wind-border text-[10px] text-neutral-400 hover:text-white px-1 py-0.5 font-mono focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTaskForNotes(row);
            }}
            className="p-1 border border-wind-border hover:border-neutral-400 text-neutral-400 hover:text-white transition-colors relative"
            title="View/Add notes & history"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {row.notes?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTask(row);
              setIsCreateOpen(true);
            }}
            className="px-2 py-1 text-[11px] border border-wind-border hover:border-white text-neutral-300 hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Actions */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-white" />
            Maintenance Operations & Corrective Work Orders
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Offshore corrective maintenance logs, field technician dispatch, and scheduled part overhauls.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Status:</span>
          {['ALL', 'In Progress', 'Scheduled', 'Overdue', 'Completed'].map((s) => (
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

        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 uppercase text-[10px] mr-1">Priority:</span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-[11px] border uppercase transition-all ${
                priorityFilter === p
                  ? 'border-neutral-400 text-white font-semibold bg-neutral-900'
                  : 'border-wind-border/60 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders Table */}
      <DataTable
        columns={columns}
        data={tasks}
        keyField="workOrderId"
        pageSize={10}
        searchPlaceholder="Search work order ID, turbine, issue, or technician..."
        onRowClick={(row) => {
          setSelectedTaskForNotes(row);
        }}
      />

      {/* Work Order Create / Edit Modal */}
      <WorkOrderModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        turbines={turbines}
      />

      {/* Technician Notes & Execution Log Modal */}
      {selectedTaskForNotes && (
        <Modal
          isOpen={!!selectedTaskForNotes}
          onClose={() => setSelectedTaskForNotes(null)}
          title={`${selectedTaskForNotes.workOrderId} — ${selectedTaskForNotes.issue}`}
          subtitle={`Asset: ${selectedTaskForNotes.turbine} • Assigned: ${selectedTaskForNotes.assignedTo}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-wind-surface border border-wind-border text-xs">
              <div className="text-wind-secondary text-[10px] uppercase">Scope of Work:</div>
              <div className="text-white mt-1">
                {selectedTaskForNotes.description || 'No detailed technical scope entered.'}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-3 pt-2 border-t border-wind-border/40">
                <span>Vessel: {selectedTaskForNotes.vesselRequired}</span>
                <span>•</span>
                <span>Scheduled: {formatDate(selectedTaskForNotes.scheduledDate)}</span>
                <span>•</span>
                <span>Est. Duration: {selectedTaskForNotes.estimatedHours} hrs</span>
              </div>
            </div>

            {/* Notes history stream */}
            <div>
              <div className="text-xs uppercase font-bold text-neutral-400 mb-2">
                Field Notes & Activity Timeline ({selectedTaskForNotes.notes?.length || 0})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(!selectedTaskForNotes.notes || selectedTaskForNotes.notes.length === 0) ? (
                  <div className="text-neutral-500 text-xs py-3 text-center border border-dashed border-wind-border">
                    No field comments logged yet.
                  </div>
                ) : (
                  selectedTaskForNotes.notes.map((n, i) => (
                    <div key={i} className="p-2.5 bg-wind-bg border border-wind-border text-xs">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                        <span className="text-white font-bold">{n.author || 'Operator'}</span>
                        <span>{formatTimeAgo(n.timestamp)}</span>
                      </div>
                      <div className="text-neutral-300">{n.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-wind-border">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Append technician observation / torque verification..."
                className="flex-1 bg-wind-bg border border-wind-border px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
