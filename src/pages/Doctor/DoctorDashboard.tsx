import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Eye, ShieldAlert, AlertCircle, RefreshCw, Database } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { patients, alerts, isFirebaseConnected, isLoadingFirebase, firebaseError } = useRealtime();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalCount = patients.length;
  const needsAttentionCount = patients.filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.currentStatus === 'MONITOR').length;
  const highRiskCount = patients.filter((p) => p.currentStatus === 'HIGH RISK').length;
  const criticalCount = patients.filter((p) => p.currentStatus === 'CRITICAL').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length;

  const patientsNeedingAttention = patients
    .filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.currentStatus === 'MONITOR')
    .sort((a, b) => (b.advisoryRisk || 0) - (a.advisoryRisk || 0));

  const doctorName = user?.name || 'Dr. Sarah Jenkins';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Doctor Dashboard" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Greeting & Firebase Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Good morning, {doctorName}</h2>
              <p className="text-xs text-gray-500">Intensive Care Unit & Clinical Wards</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-2 ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isFirebaseConnected ? 'Firebase Realtime Connected' : 'Connecting to Firebase...'}</span>
              </div>
            </div>
          </div>

          {firebaseError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start space-x-3 font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Firebase Connection Notice</div>
                <div>{firebaseError}</div>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-600">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Total Patients</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-amber-500">
              <div className="text-[10px] font-bold text-amber-900 uppercase">Needs Attention</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{needsAttentionCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-orange-500">
              <div className="text-[10px] font-bold text-orange-900 uppercase">High Risk</div>
              <div className="text-2xl font-black text-orange-900 mt-1">{highRiskCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-red-600">
              <div className="text-[10px] font-bold text-red-900 uppercase">Critical</div>
              <div className="text-2xl font-black text-red-900 mt-1">{criticalCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-cyan-600">
              <div className="text-[10px] font-bold text-cyan-900 uppercase">Active Alerts</div>
              <div className="text-2xl font-black text-cyan-900 mt-1">{activeAlertsCount}</div>
            </div>
          </div>

          {/* Patients Needing Attention Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                PATIENTS NEEDING ATTENTION
              </h3>
              <span className="text-xs text-gray-500 font-medium">{patientsNeedingAttention.length} Patients Flagged</span>
            </div>

            {isLoadingFirebase ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <div className="font-bold text-sm">Synchronizing with Firebase Realtime Database...</div>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900">No patient data available</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Your Firebase Realtime Database does not currently contain any patient monitoring records. Use the Receptionist portal to register new patients.
                  </p>
                </div>
              </div>
            ) : (patientsNeedingAttention.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-semibold">
                All monitored patients are currently stable.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs text-gray-600">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Patient</th>
                      <th className="p-3.5">Location / Bed</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Risk Score</th>
                      <th className="p-3.5">Primary Complaint</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {patientsNeedingAttention.map((p) => (
                      <tr key={p.id || p.hospitalId} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.hospitalId || p.id} • Age {p.age}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-800">{p.ward}</div>
                          <div className="text-[10px] text-gray-500">{p.bed}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{p.advisoryRisk || 0}%</td>
                        <td className="p-3.5 font-medium text-gray-700">
                          {p.primaryComplaint || 'Monitoring serial vitals'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => navigate(`/doctor/patients/${p.id || p.hospitalId}`)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
