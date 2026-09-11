import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { UserPlus, Users, Search, Clock, Calendar, Eye, Database } from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const { patients, isLoadingFirebase } = useRealtime();
  const { user } = useAuth();
  const navigate = useNavigate();

  const receptionistName = user?.name || 'Receptionist';
  const todayStr = new Date().toISOString().split('T')[0];

  const totalPatientsCount = patients.length;
  const todaysRegistrations = patients.filter((p) => {
    const regDate = p.registeredAt || p.createdAt || p.admissionDate;
    return regDate && regDate.startsWith(todayStr);
  });
  const todaysRegistrationsCount = todaysRegistrations.length;
  const activeAdmissionsCount = patients.filter((p) => p.currentStatus !== 'Discharged').length;

  const recentRegistrations = [...patients].sort((a, b) => {
    const timeA = new Date(a.registeredAt || a.createdAt || a.admissionDate || 0).getTime();
    const timeB = new Date(b.registeredAt || b.createdAt || b.admissionDate || 0).getTime();
    return timeB - timeA;
  }).slice(0, 8);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Receptionist Dashboard" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Greeting & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Welcome, {receptionistName}</h2>
              <p className="text-xs text-gray-500">Patient Intake & Registration Workstation</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/receptionist/register-patient')}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Patient</span>
              </button>

              <button
                onClick={() => navigate('/receptionist/search')}
                className="px-3 py-2.5 bg-white hover:bg-gray-50 text-slate-700 font-bold text-xs rounded-xl border border-gray-200 shadow-2xs flex items-center space-x-1.5 transition-all"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Search Patient</span>
              </button>
            </div>
          </div>

          {/* 3 Simple Operational Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-700">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <span>Total Patients Registered</span>
                <Users className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalPatientsCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <span>Today's Registrations</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">{todaysRegistrationsCount}</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                <span>Active Inpatients</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-2">{activeAdmissionsCount}</div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-teal-700" />
                Recent Registrations
              </h3>
              <button
                onClick={() => navigate('/receptionist/patients')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
              >
                View All ({patients.length})
              </button>
            </div>

            {isLoadingFirebase ? (
              <div className="p-12 text-center text-gray-400 text-xs font-semibold">
                Syncing patient records with Firebase...
              </div>
            ) : patients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-sm text-slate-900">No patients registered yet.</div>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click "Register New Patient" to add an inpatient or outpatient to the hospital database.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs text-gray-600">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Patient ID</th>
                      <th className="p-3.5">Full Name</th>
                      <th className="p-3.5">Age / Gender</th>
                      <th className="p-3.5">Contact Phone</th>
                      <th className="p-3.5">Ward / Location</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {recentRegistrations.map((p) => (
                      <tr key={p.id || p.hospitalId} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-teal-800">{p.hospitalId || p.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-gray-600">{p.age} yrs • {p.gender}</td>
                        <td className="p-3.5 font-mono text-gray-600">{p.phone}</td>
                        <td className="p-3.5 text-gray-700">{p.ward || 'General Intake'} ({p.bed || 'Triage'})</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                            p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.currentStatus || 'Registered'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => navigate('/receptionist/patients')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-teal-700 hover:text-white text-slate-700 font-bold rounded-lg text-xs transition-all flex items-center space-x-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
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
