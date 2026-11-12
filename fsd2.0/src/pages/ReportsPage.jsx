import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

const REPORT_TYPES = [
  'Turbine Performance Report',
  'Maintenance Report',
  'Inspection Report',
  'Weather Impact Report',
  'Monthly Operations Report',
];

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(REPORT_TYPES[0]);
  const [generating, setGenerating] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.generateReport(selectedType);
      if (res.success) {
        setIsGenerateOpen(false);
        await loadReports();
      }
    } catch (err) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCSV = async (report) => {
    try {
      const filename = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
      await api.downloadReportCSV(report.reportId, filename);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-white" />
            Operational SCADA Reports & Compliance Exports
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Automated CSV data compilation for asset owners, offshore auditors, and metocean compliance.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Reports Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-wind-panel border border-wind-border text-neutral-500 text-xs">
            No operational reports generated yet. Click "Generate Report" above to compile CSV.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="bg-wind-panel border border-wind-border hover:border-neutral-500 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                    {report.reportId}
                  </span>
                  <StatusBadge status={report.status} size="xs" />
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  {report.name}
                </h3>

                <div className="p-3 bg-wind-surface border border-wind-border text-xs mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Category:</span>
                    <strong className="text-neutral-200">{report.type}</strong>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Compiled By:</span>
                    <span className="text-white">{report.generatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Key Indicator:</span>
                    <span className="text-white font-bold">{report.summary?.keyMetric || '--'}</span>
                  </div>
                </div>

                {report.summary?.notes && (
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mb-4">
                    {report.summary.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-wind-border flex items-center justify-between text-xs">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(report.date)}</span>
                </div>

                <button
                  onClick={() => handleDownloadCSV(report)}
                  className="px-3 py-1.5 bg-neutral-900 border border-wind-border hover:border-white text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  title="Download Raw CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Operational CSV Report"
        subtitle="Extract SCADA data records as downloadable CSV files"
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-400 uppercase text-[11px] mb-1.5">
              Select Report Type
            </label>
            <div className="space-y-2">
              {REPORT_TYPES.map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                    selectedType === type
                      ? 'bg-neutral-900 border-white text-white font-bold'
                      : 'border-wind-border bg-wind-surface text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reportType"
                      value={type}
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="accent-white"
                    />
                    <span>{type}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">CSV Export</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-wind-surface border border-wind-border text-[11px] text-neutral-400">
            Export generates comma-separated values (CSV) matching international IEC 61400-26 offshore availability standards.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-wind-border">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-4 py-2 border border-wind-border text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-50"
            >
              {generating ? 'Compiling SCADA...' : 'Generate & Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
