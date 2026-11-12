import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { INSPECTION_TYPES } from '../../utils/constants';

const INSPECTION_METHODS = [
  'Drone / UAV',
  'Rope Access',
  'ROV Subsea',
  'Borescope NDT',
  'Visual Walkthrough',
  'Sensory Ultrasound',
];

export const InspectionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  turbines = [],
}) => {
  const [formData, setFormData] = useState({
    inspectionId: '',
    turbine: 'WT-001',
    type: 'Blade Inspection',
    inspector: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'SCHEDULED',
    method: 'Visual Walkthrough',
    findings: 'Awaiting execution.',
    severityFound: 'None',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        inspectionId: '',
        turbine: turbines[0]?.turbineId || 'WT-001',
        type: 'Blade Inspection',
        inspector: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
        method: 'Visual Walkthrough',
        findings: 'Awaiting execution.',
        severityFound: 'None',
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
      title={initialData ? `Edit Inspection ${initialData.inspectionId}` : 'Schedule QA / Structural Inspection'}
      subtitle="Periodic statutory and condition-monitoring inspections for offshore turbines"
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
              Inspection Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            >
              {INSPECTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Method / Technique
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
            >
              {INSPECTION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Assigned Inspector / Contractor
            </label>
            <input
              type="text"
              name="inspector"
              value={formData.inspector}
              onChange={handleChange}
              placeholder="e.g. Elena Rostova"
              className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-wind-secondary text-[11px] uppercase mb-1">
              Scheduled Execution Date
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
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-wind-secondary text-[11px] uppercase mb-1">
            Findings / Observations Log
          </label>
          <textarea
            name="findings"
            rows="3"
            value={formData.findings}
            onChange={handleChange}
            placeholder="Record defect classifications, photo references, or ultrasonic thickness anomalies..."
            className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono text-xs focus:border-neutral-400 focus:outline-none"
          />
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
            {initialData ? 'Update Inspection' : 'Schedule Inspection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
