import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Eye, ShieldAlert } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { patients, alerts } = useRealtime();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalCount = patients.length;
  const needsAttentionCount = patients.filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.currentStatus === 'MONITOR').length;
  const highRiskCount = patients.filter((p) => p.currentStatus === 'HIGH RISK').length;
  const criticalCount = patients.filter((p) => p.currentStatus === 'CRITICAL').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length;

  const patientsNeedingAttention = patients
    .filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.id === 'P12345')
    .sort((a, b) => b.advisoryRisk - a.advisoryRisk);

  const doctorName = user?.name || 'Dr. Sarah Jenkins';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Doctor Dashboard" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Greeting */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Good morning, {doctorName}</h2>
              <p className="text-xs text-gray-500">Intensive Care Unit & Clinical Wards</p>
            </div>
          </div>

          {/* Focused 5 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="card-clinical p-4 bg-white">
              <div className="text-xs text-gray-500 font-semibold">Total Patients</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalCount}</div>
            </div>
            <div className="card-clinical p-4 bg-amber-50/50 border-l-4 border-l-amber-500">
              <div className="text-xs text-amber-800 font-semibold">Needs Attention</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">{needsAttentionCount}</div>
            </div>
            <div className="card-clinical p-4 bg-orange-50/50 border-l-4 border-l-orange-500">
              <div className="text-xs text-orange-800 font-semibold">High Risk</div>
              <div className="text-2xl sm:text-3xl font-black text-orange-900 mt-1">{highRiskCount}</div>
            </div>
            <div className="card-clinical p-4 bg-red-50/50 border-l-4 border-l-red-500">
              <div className="text-xs text-red-800 font-semibold">Critical</div>
              <div className="text-2xl sm:text-3xl font-black text-red-900 mt-1">{criticalCount}</div>
            </div>
            <div className="card-clinical p-4 bg-teal-50/50 border-l-4 border-l-teal-600 col-span-2 sm:col-span-1">
              <div className="text-xs text-teal-800 font-semibold">Active Alerts</div>
              <div className="text-2xl sm:text-3xl font-black text-teal-900 mt-1">{activeAlertsCount}</div>
            </div>
          </div>

          {/* Primary Section: PATIENTS NEEDING ATTENTION */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-orange-600 shrink-0" />
                PATIENTS NEEDING ATTENTION
              </h3>
              <span className="text-xs text-gray-500 font-medium">{patientsNeedingAttention.length} Patients Flagged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Location / Bed</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Main Concern</th>
                    <th className="p-3.5">Last Updated</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {patientsNeedingAttention.map((p) => (
                    <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-gray-500">{p.hospitalId} • Age {p.age}</div>
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
                      <td className="p-3.5 font-bold text-slate-900">{p.advisoryRisk}%</td>
                      <td className="p-3.5 font-medium text-gray-700">
                        {p.id === 'P12345'
                          ? 'Creatinine increasing & SpO2 decreasing over recent readings'
                          : 'Several values changing over time'}
                      </td>
                      <td className="p-3.5 text-gray-400 font-mono text-[10px]">2 min ago</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => navigate(`/doctor/patients/${p.id}`)}
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
          </div>
        </main>
      </div>
    </div>
  );
};
