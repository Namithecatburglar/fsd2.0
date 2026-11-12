import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { WORK_ORDER_PRIORITIES, WORK_ORDER_STATUSES } from '../../utils/constants';

export const WorkOrderModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  turbines = [],
}) => {
  const [formData, setFormData] = useState({
    workOrderId: '',
    turbine: 'WT-001',
    issue: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'Scheduled',
    vesselRequired: 'None',
    estimatedHours: 4,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
        notes: '',
      });
    } else {
      setFormData({
        workOrderId: '',
        turbine: turbines[0]?.turbineId || 'WT-001',
        issue: '',
        description: '',
        priority: 'Medium',
        assignedTo: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'Scheduled',
        vesselRequired: 'None',
        estimatedHours: 4,
        notes: '',
      });
    }
  }, [initialData, isOpen, turbines]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Work Order ${initialData.workOrderId}` : 'Create Maintenance Work Order'}
      subtitle="Offshore wind farm mechanical and electrical corrective task assignment"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Turbine Asset
            </label>
            <select
              name="turbine"
              value={formData.turbine}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
              required
            >
              {turbines.map((t) => (
                <option key={t.turbineId} value={t.turbineId}>
                  {t.turbineId} ({t.location?.zone || 'Zone A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            >
              {WORK_ORDER_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-wind-secondary text-[11px] uppercase mb-1">
            Issue Title
          </label>
          <input
            type="text"
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            placeholder="e.g. Gearbox intermediate bearing vibration anomaly"
            className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-wind-secondary text-[11px] uppercase mb-1">
            Technical Description / Scope
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe fault signature, acoustic observations, and required parts..."
            className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Assigned Field Tech
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="e.g. Arun Kumar"
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            >
              {WORK_ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Vessel Required
            </label>
            <input
              type="text"
              name="vesselRequired"
              value={formData.vesselRequired}
              onChange={handleChange}
              placeholder="e.g. Sea Explorer (SOV) / Nordic Valkyrie (CTV)"
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Est. Hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="1"
              max="48"
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-wind-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-wind-border text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
          >
            {initialData ? 'Update Work Order' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
