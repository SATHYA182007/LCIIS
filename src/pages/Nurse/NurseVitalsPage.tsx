import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientVitalsModal } from '../../components/clinical/PatientVitalsModal';
import { HeartPulse, Eye } from 'lucide-react';

export const NurseVitalsPage: React.FC = () => {
  const { patients, liveVitalsMap } = useRealtime();
  const [activeModalPatientId, setActiveModalPatientId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Nurse Bedside Monitoring" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="card-clinical p-4 bg-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <HeartPulse className="w-5 h-5 mr-2 text-teal-700" />
              Live Bedside Telemetry Tele-Monitor
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Continuous vitals streaming across active ICU & ward beds
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => {
              const v = liveVitalsMap[p.id] || (p.id === 'P12345' ? liveVitalsMap['P12345'] : undefined);
              const hasVitals = v && (v.heartRate?.value !== undefined || v.spo2?.value !== undefined);
              return (
                <div key={p.id} className="card-clinical p-4 bg-white space-y-3 border-l-4 border-l-teal-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <div className="text-[11px] text-gray-500">{p.ward} • Bed {p.bed}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {p.currentStatus}
                    </span>
                  </div>

                  {hasVitals ? (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block">Heart Rate</span>
                        <span className="font-black text-slate-900 text-sm">{v.heartRate?.value !== undefined ? `${v.heartRate.value} BPM` : '--'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block">SpO2 Level</span>
                        <span className="font-black text-slate-900 text-sm">{v.spo2?.value !== undefined ? `${v.spo2.value}%` : '--'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 p-2 bg-slate-50 rounded border border-dashed border-slate-200 font-bold">Telemetry Offline / Unlinked</div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setActiveModalPatientId(p.id)}
                      className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded text-xs flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Review Vitals</span>
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

