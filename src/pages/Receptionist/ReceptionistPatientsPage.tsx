import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Search, Filter, Users, UserPlus, Phone } from 'lucide-react';

export const ReceptionistPatientsPage: React.FC = () => {
  const { patients, isLoadingFirebase } = useRealtime();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.hospitalId || p.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || '').includes(searchQuery);
    const matchesStatus = selectedStatus === 'ALL' || (p.currentStatus || p.status) === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patients Directory" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Controls Bar */}
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-700" />
                  Hospital Registered Patients
                </h2>
                <p className="text-xs text-gray-500">
                  Real-time database of all registered inpatients and outpatients
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">{filteredPatients.length} Patients Found</span>
                <button
                  onClick={() => navigate('/receptionist/register-patient')}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Patient</span>
                </button>
              </div>
            </div>

            {/* Search and Status Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Patient ID, Name, or Phone Number..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Registered">Registered Only</option>
                  <option value="Under Care">Under Care Only</option>
                  <option value="MONITOR">Watch / Monitor Only</option>
                  <option value="HIGH RISK">High Risk Only</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="STABLE">Stable Only</option>
                  <option value="Discharged">Discharged Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Directory View */}
          <div className="card-clinical overflow-hidden bg-white">
            {isLoadingFirebase ? (
              <div className="p-12 text-center text-gray-400 text-xs font-semibold">
                Loading records from Firebase Realtime Database...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <div className="font-extrabold text-sm text-slate-800">No patients registered yet matching filters.</div>
                <p className="text-xs text-gray-500">Try adjusting your search query or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs text-gray-600">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Patient ID</th>
                      <th className="p-3.5">Full Name</th>
                      <th className="p-3.5">Age / Gender</th>
                      <th className="p-3.5">Phone Number</th>
                      <th className="p-3.5">Location / Bed</th>
                      <th className="p-3.5">Emergency Contact</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredPatients.map((p) => (
                      <tr key={p.id || p.hospitalId} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-teal-800">{p.hospitalId || p.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-gray-600">{p.age} yrs ({p.gender})</td>
                        <td className="p-3.5 font-mono text-gray-600 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{p.phone}</span>
                        </td>
                        <td className="p-3.5 text-gray-700">{p.ward || 'General Intake'} • {p.bed || 'Bed 01'}</td>
                        <td className="p-3.5 text-gray-600 truncate max-w-xs">{p.emergencyContact}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                            p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.currentStatus || 'Registered'}
                          </span>
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
