import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { ShieldAlert, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const NurseAlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, getPatientById } = useRealtime();
  const navigate = useNavigate();

  const handleAck = (id: string) => {
    acknowledgeAlert(id, 'Nurse Michael Chen, RN');
    toast.success('Alert acknowledged by ward nurse.');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Nurse Deterioration Alerts" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="card-clinical p-4 bg-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-orange-600" />
              Ward Patient Deterioration Alert Feed
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Active alerts requiring nursing observation and clinical response
            </p>
          </div>

          <div className="space-y-3">
            {alerts.map((a) => {
              const p = getPatientById(a.patientId);
              return (
                <div key={a.id} className="card-clinical p-4 bg-white space-y-2 border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{p?.name || a.patientId} • {p?.ward} ({p?.bed})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{a.summary}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-400 font-mono text-[10px]">
                      {new Date(a.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex space-x-2">
                      {a.status === 'NEW' && (
                        <button
                          onClick={() => handleAck(a.id)}
                          className="px-3 py-1 bg-amber-600 text-white rounded font-bold text-xs"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/doctor/patients/${a.patientId}`)}
                        className="px-3 py-1 bg-teal-700 text-white rounded font-bold text-xs flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
