import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Radio,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  Sliders,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { isLiveFeedActive, setIsLiveFeedActive, triggerSimulationTick } = useOperations();
  const [tickerSpeed, setTickerSpeed] = useState('12');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      {/* Top Banner */}
      <div className="bg-wind-panel border border-wind-border p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-white" />
            System Configuration & Wind Farm Specifications
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            SCADA telemetry polling intervals, asset registration parameters, and role clearance matrix.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-white bg-neutral-900 border border-white px-3 py-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farm Metadata */}
        <div className="bg-wind-panel border border-wind-border p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-wind-border pb-3">
            <Server className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Asset Architecture Specifications
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Wind Farm Identity:</span>
              <span className="text-white font-bold">Tamil Nadu Offshore Wind Farm 360 MW Facility</span>
            </div>
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Total Installed Turbines:</span>
              <span className="text-white font-bold">48 Direct-Drive Turbines</span>
            </div>
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Turbine Rating:</span>
              <span className="text-white">Siemens Gamesa SG 8.0-167 DD (7.5 MW - 8.0 MW)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Grid Interconnection:</span>
              <span className="text-white">TenneT Offshore HVDC Link 66kV / 380kV</span>
            </div>
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Tactical Coordinates:</span>
              <span className="text-white">09°01' N, 78°16' E (Gulf of Mannar, India)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-wind-border/40">
              <span className="text-neutral-400">Operations Port Base:</span>
              <span className="text-white">V.O. Chidambaranar Port, Tuticorin</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Simulation Controls */}
        <div className="bg-wind-panel border border-wind-border p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-wind-border pb-3">
            <Sliders className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Real-Time SCADA Telemetry Stream
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-neutral-400 uppercase text-[11px] mb-1.5">
                Simulation Heartbeat Interval
              </label>
              <select
                value={tickerSpeed}
                onChange={(e) => setTickerSpeed(e.target.value)}
                className="w-full bg-wind-bg border border-wind-border p-2 text-white font-mono focus:border-white focus:outline-none"
              >
                <option value="10">Fast Loop (10 seconds)</option>
                <option value="12">Standard Operations (12 seconds)</option>
                <option value="30">Relaxed Audit (30 seconds)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
                <input
                  type="checkbox"
                  checked={isLiveFeedActive}
                  onChange={(e) => setIsLiveFeedActive(e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
                <span>Enable Active Polling & Simulation Oscillation</span>
              </label>
              <p className="text-[10px] text-neutral-500 mt-1 pl-6">
                When active, power, rotor speed, wind, and wave height oscillate realistically without refreshing.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={triggerSimulationTick}
                className="w-full py-2 border border-wind-border hover:border-white text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Immediate Telemetry Tick</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              Update Telemetry Configuration
            </button>
          </form>
        </div>
      </div>

      {/* Role Clearance & Permission Matrix */}
      <div className="bg-wind-panel border border-wind-border p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-wind-border pb-3">
          <Shield className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Persona Clearance Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-wind-border text-[11px] text-neutral-500 uppercase">
                <th className="p-2">Role</th>
                <th className="p-2">Turbines</th>
                <th className="p-2">Maintenance</th>
                <th className="p-2">Inspections</th>
                <th className="p-2">Marine Fleet</th>
                <th className="p-2">Reports</th>
                <th className="p-2">System Config</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wind-border/40 text-neutral-300">
              <tr className={user?.role === 'admin' ? 'bg-neutral-900 font-bold text-white' : ''}>
                <td className="p-2 font-bold">Admin</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-white">Full</td>
              </tr>
              <tr className={user?.role === 'operations_manager' ? 'bg-neutral-900 font-bold text-white' : ''}>
                <td className="p-2 font-bold">Operations Manager</td>
                <td className="p-2 text-neutral-300">Read / Update</td>
                <td className="p-2 text-white">Full</td>
                <td className="p-2 text-neutral-300">Read / Schedule</td>
                <td className="p-2 text-white">Full Dispatch</td>
                <td className="p-2 text-white">Generate</td>
                <td className="p-2 text-neutral-600">Read Only</td>
              </tr>
              <tr className={user?.role === 'maintenance_engineer' ? 'bg-neutral-900 font-bold text-white' : ''}>
                <td className="p-2 font-bold">Maintenance Engineer</td>
                <td className="p-2 text-white">Diagnostics</td>
                <td className="p-2 text-white">Full Work Orders</td>
                <td className="p-2 text-neutral-300">Execute</td>
                <td className="p-2 text-neutral-600">Read Only</td>
                <td className="p-2 text-neutral-600">Read Only</td>
                <td className="p-2 text-neutral-600">Denied</td>
              </tr>
              <tr className={user?.role === 'inspector' ? 'bg-neutral-900 font-bold text-white' : ''}>
                <td className="p-2 font-bold">QA / NDT Inspector</td>
                <td className="p-2 text-neutral-300">Telemetry Read</td>
                <td className="p-2 text-neutral-600">Read Only</td>
                <td className="p-2 text-white">Full Inspections</td>
                <td className="p-2 text-neutral-600">Read Only</td>
                <td className="p-2 text-neutral-600">Read Only</td>
                <td className="p-2 text-neutral-600">Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
