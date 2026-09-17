import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Search, Eye, Filter, Grid, List, Users } from 'lucide-react';

export const DoctorPatientsPage: React.FC = () => {
  const { patients, liveVitalsMap } = useRealtime();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const wards = Array.from(new Set(patients.map((p) => p.ward)));

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'ALL' || p.ward === selectedWard;
    const matchesStatus = selectedStatus === 'ALL' || p.currentStatus === selectedStatus;
    return matchesSearch && matchesWard && matchesStatus;
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
                  Hospital Inpatients Directory
                </h2>
                <p className="text-xs text-gray-500">
                  Real-time longitudinal monitoring records across all active wards
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500">{filteredPatients.length} Patients Found</span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-500 hover:text-slate-900'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-500 hover:text-slate-900'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, ID, or bed..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Ward Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Wards</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH RISK">High Risk Only</option>
                  <option value="MONITOR">Watch / Monitor Only</option>
                  <option value="STABLE">Stable Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Table View */}
          {viewMode === 'table' ? (
            <div className="card-clinical overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs text-gray-600">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Patient</th>
                      <th className="p-3.5">Ward / Bed</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Risk Score</th>
                      <th className="p-3.5">Live Vitals</th>
                      <th className="p-3.5">Attending Doctor</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          No patient records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p) => {
                        const v = liveVitalsMap[p.id] || (p.id === 'P12345' ? liveVitalsMap['P12345'] : undefined);
                        return (
                          <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-[10px] text-gray-500">{p.hospitalId} • Age {p.age} ({p.gender})</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-gray-800">{p.ward}</div>
                              <div className="text-[10px] text-gray-500">{p.bed}</div>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                                p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.currentStatus}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">{p.advisoryRisk}%</td>
                            <td className="p-3.5 text-[11px]">
                              {v && v.heartRate?.value !== undefined ? (
                                <div className="space-x-2">
                                  <span className="font-semibold text-slate-800">HR: {v.heartRate.value}</span>
                                  <span className="font-semibold text-teal-700">SpO2: {v.spo2?.value !== undefined ? `${v.spo2.value}%` : '--'}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-semibold text-[10px]">Awaiting Telemetry</span>
                              )}
                            </td>
                            <td className="p-3.5 text-gray-700">{p.attendingDoctorName}</td>
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Render Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => {
                const v = liveVitalsMap[p.id] || liveVitalsMap['P12345'];
                return (
                  <div key={p.id} className="card-clinical p-5 bg-white space-y-4 hover:border-teal-300 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                        <div className="text-xs text-gray-500">{p.hospitalId} • {p.ward} ({p.bed})</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                        p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.currentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Risk Score</div>
                        <div className="font-black text-slate-900 text-sm mt-0.5">{p.advisoryRisk}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">SpO2 Level</div>
                        <div className="font-black text-slate-900 text-sm mt-0.5">{v ? `${v.spo2?.value || 98}%` : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">{p.attendingDoctorName}</span>
                      <button
                        onClick={() => navigate(`/doctor/patients/${p.id}`)}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
