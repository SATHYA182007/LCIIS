import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { ShieldCheck, Plus, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPatientsPage: React.FC = () => {
  const { patients, addPatient, liveVitalsMap } = useRealtime();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState(55);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [ward, setWard] = useState('ICU Unit A');
  const [bed, setBed] = useState('Bed 08');
  const [attendingDoctorName, setAttendingDoctorName] = useState('Dr. Sarah Jenkins');
  const [primaryComplaint, setPrimaryComplaint] = useState('Acute dyspnea and fever observation');

  const wards = Array.from(new Set(patients.map((p) => p.ward)));

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'ALL' || p.ward === selectedWard;
    return matchesSearch && matchesWard;
  });

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter patient name.');
      return;
    }

    const created = await addPatient({
      name,
      age: Number(age),
      gender,
      ward,
      bed,
      attendingDoctorName,
      primaryComplaint,
    });

    setIsAddPatientModalOpen(false);
    setName('');
    toast.success(`Patient ${created.name} (${created.id}) registered into ${ward}.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patient Registration & Bed Assignment Management" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-teal-700" />
                Hospital Inpatient Registry & Bed Allocations
              </h2>
              <p className="text-xs text-gray-500">
                Central administrative admission, bed assignment, and clinical attending Doctor roster
              </p>
            </div>

            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Inpatient</span>
            </button>
          </div>

          {/* Search & Ward Filter Bar */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient name, hospital ID, or bed..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Hospital Wards ({patients.length})</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Patient Registry Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Hospital ID & Name</th>
                    <th className="p-3.5">Ward & Bed</th>
                    <th className="p-3.5">Advisory Status</th>
                    <th className="p-3.5">Risk %</th>
                    <th className="p-3.5">Live Vitals</th>
                    <th className="p-3.5">Attending Doctor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredPatients.map((p) => {
                    const vitals = liveVitalsMap[p.id] || liveVitalsMap['P12345'];
                    return (
                      <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-500">{p.hospitalId} • Age {p.age} ({p.gender})</div>
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
                          {vitals ? (
                            <span className="font-semibold text-slate-800">
                              HR {vitals.heartRate?.value || 80} • SpO2 {vitals.spo2?.value || 98}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Offline</span>
                          )}
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

      {/* Register New Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register Inpatient</h3>
            <form onSubmit={handleAddPatientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ward Location</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. ICU Unit A"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={bed}
                    onChange={(e) => setBed(e.target.value)}
                    placeholder="e.g. Bed 08"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Attending Doctor</label>
                <input
                  type="text"
                  value={attendingDoctorName}
                  onChange={(e) => setAttendingDoctorName(e.target.value)}
                  placeholder="Dr. Sarah Jenkins"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Complaint / Notes</label>
                <textarea
                  value={primaryComplaint}
                  onChange={(e) => setPrimaryComplaint(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Register Inpatient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
