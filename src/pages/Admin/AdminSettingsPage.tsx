import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Settings, Sliders, Shield, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettingsPage: React.FC = () => {
  // Threshold state
  const [spo2WarningThreshold, setSpo2WarningThreshold] = useState(94);
  const [spo2CriticalThreshold, setSpo2CriticalThreshold] = useState(90);
  const [hrHighThreshold, setHrHighThreshold] = useState(100);
  const [creatinineDeltaThreshold, setCreatinineDeltaThreshold] = useState(0.3);
  const [crpDeltaThreshold, setCrpDeltaThreshold] = useState(10);
  const [enableNonDiagnosticBanner, setEnableNonDiagnosticBanner] = useState(true);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Clinical intelligence thresholds & system parameters updated successfully.');
  };

  const handleResetData = () => {
    localStorage.removeItem('lciis_auth_user');
    toast.info('Local cached telemetry state re-initialized.');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="System Configuration & Clinical Rules Thresholds" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-teal-700" />
              LCIIS Application & Intelligence Settings
            </h2>
            <p className="text-xs text-gray-500">
              Configure decision-support thresholds, safety disclaimers, and Firebase infrastructure connections
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Thresholds Settings */}
            <div className="lg:col-span-7 card-clinical p-6 bg-white space-y-5">
              <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
                <Sliders className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">CLINICAL RULE ENGINE THRESHOLDS</h3>
              </div>

              <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SpO2 Warning Threshold (%)</label>
                    <input
                      type="number"
                      value={spo2WarningThreshold}
                      onChange={(e) => setSpo2WarningThreshold(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SpO2 Critical Threshold (%)</label>
                    <input
                      type="number"
                      value={spo2CriticalThreshold}
                      onChange={(e) => setSpo2CriticalThreshold(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Heart Rate Tachycardia Cutoff (BPM)</label>
                    <input
                      type="number"
                      value={hrHighThreshold}
                      onChange={(e) => setHrHighThreshold(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Creatinine Delta Trigger (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={creatinineDeltaThreshold}
                      onChange={(e) => setCreatinineDeltaThreshold(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">CRP Escalation Delta (mg/L)</label>
                  <input
                    type="number"
                    value={crpDeltaThreshold}
                    onChange={(e) => setCrpDeltaThreshold(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Enforce Non-Diagnostic Safety Banners</div>
                    <div className="text-[10px] text-gray-500">Displays advisory disclaimer on clinical dashboards</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableNonDiagnosticBanner}
                    onChange={(e) => setEnableNonDiagnosticBanner(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SAVE THRESHOLD CONFIGURATIONS</span>
                </button>
              </form>
            </div>

            {/* Right 5 Cols: System Health & Maintenance */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card-clinical p-6 bg-white space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
                  <Database className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">FIREBASE INFRASTRUCTURE STATUS</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <span className="font-bold text-slate-800">Firebase Auth RBAC</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">OPERATIONAL</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <span className="font-bold text-slate-800">Cloud Firestore Collections</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">CONNECTED</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <span className="font-bold text-slate-800">Realtime DB Listener</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">SUBSCRIBED</span>
                  </div>
                </div>
              </div>

              <div className="card-clinical p-6 bg-white space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">SYSTEM MAINTENANCE & CACHE</h3>
                </div>

                <p className="text-xs text-gray-500">
                  Re-initialize simulated telemetry data streams and reset local browser storage cache.
                </p>

                <button
                  onClick={handleResetData}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RESET LOCAL SESSION CACHE</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
