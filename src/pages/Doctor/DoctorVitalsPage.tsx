import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientVitalsModal } from '../../components/clinical/PatientVitalsModal';
import { HeartPulse, Eye } from 'lucide-react';

export const DoctorVitalsPage: React.FC = () => {
  const { patients, liveVitalsMap } = useRealtime();

  const [selectedWard, setSelectedWard] = useState('ALL');
  const [activeModalPatientId, setActiveModalPatientId] = useState<string | null>(null);

  const wards = Array.from(new Set(patients.map((p) => p.ward)));

  const filteredPatients = patients.filter((p) => {
    return selectedWard === 'ALL' || p.ward === selectedWard;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Bedside Telemetry & Live Vitals" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Controls */}
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <HeartPulse className="w-5 h-5 mr-2 text-teal-700" />
                  Real-time Physiological Telemetry Monitor
                </h2>
                <p className="text-xs text-gray-500">
                  Continuous bedside parameter streams received via hospital telemetry network
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ESP32 Telemetry Engine Active</span>
                </div>
              </div>
            </div>

            {/* Ward Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-gray-700 shrink-0">Filter Ward:</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden max-w-xs"
              >
                <option value="ALL">All Hospital Wards</option>
                {wards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((p) => {
              const v = liveVitalsMap[p.id] || (p.id === 'P12345' ? liveVitalsMap['P12345'] : undefined);
              const isSpo2Low = Boolean(v && v.spo2?.value && v.spo2.value < 93);
              const isHrHigh = Boolean(v && v.heartRate?.value && v.heartRate.value > 100);
              const isAlerting = isSpo2Low || isHrHigh;

              return (
                <div
                  key={p.id}
                  className={`card-clinical p-5 bg-white space-y-4 border-t-4 ${
                    isAlerting ? 'border-t-red-500 shadow-md' : 'border-t-teal-600'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center">
                        {p.name}
                      </h3>
                      <div className="text-xs text-gray-500">{p.hospitalId} • {p.ward} ({p.bed})</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isAlerting ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isAlerting ? 'DETERIORATING' : 'STABLE'}
                    </span>
                  </div>

                  {/* Telemetry Grid Parameters */}
                  {v ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Heart Rate</div>
                        <div className={`font-black text-base mt-0.5 ${(v.heartRate?.value || 0) > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                          {v.heartRate?.value || 80} <span className="text-[10px] font-normal text-gray-500">BPM</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Oxygen SpO2</div>
                        <div className={`font-black text-base mt-0.5 ${(v.spo2?.value || 100) < 94 ? 'text-red-600' : 'text-slate-900'}`}>
                          {v.spo2?.value || 98}%
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Blood Pressure</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {v.bloodPressure ? `${v.bloodPressure.systolic.value}/${v.bloodPressure.diastolic.value}` : '120/80'} <span className="text-[10px] font-normal text-gray-500">mmHg</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Resp Rate</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {v.respiratoryRate?.value || 16} <span className="text-[10px] font-normal text-gray-500">/min</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-400">
                      Bedside device offline — live readings unavailable
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 font-mono">
                      Last telemetry beat: {new Date(v?.lastUpdated || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button
                      onClick={() => setActiveModalPatientId(p.id)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Telemetry</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <PatientVitalsModal
        patientId={activeModalPatientId}
        isOpen={!!activeModalPatientId}
        onClose={() => setActiveModalPatientId(null)}
      />
    </div>
  );
};

