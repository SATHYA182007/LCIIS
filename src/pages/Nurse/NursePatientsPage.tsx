import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Users, Eye, Search } from 'lucide-react';

export const NursePatientsPage: React.FC = () => {
  const { patients, liveVitalsMap } = useRealtime();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const assignedPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Assigned Ward Patients" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-700" />
                  Assigned Inpatient Ward Roster
                </h2>
                <p className="text-xs text-gray-500">
                  Patients currently assigned for nursing monitoring and observations
                </p>
              </div>

              <div className="text-xs font-bold text-gray-500">
                {assignedPatients.length} Assigned Patients
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assigned ward patient or bed..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Ward / Bed</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Heart Rate</th>
                    <th className="p-3.5">SpO2 Level</th>
                    <th className="p-3.5">Attending Doctor</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {assignedPatients.map((p) => {
                    const v = liveVitalsMap[p.id] || (p.id === 'P12345' ? liveVitalsMap['P12345'] : undefined);
                    return (
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
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                            p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {v?.heartRate?.value !== undefined ? `${v.heartRate.value} BPM` : 'Offline'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {v?.spo2?.value !== undefined ? `${v.spo2.value}%` : 'Offline'}
                        </td>
                        <td className="p-3.5 text-gray-700">{p.attendingDoctorName}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => navigate(`/doctor/patients/${p.id}`)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
