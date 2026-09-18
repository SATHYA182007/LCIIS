import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { TransferPatientModal } from '../../components/clinical/TransferPatientModal';
import { Search, Eye, Filter, Grid, List, Users, Bell, AlertTriangle, CheckCircle2, Radio, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export const DoctorPatientsPage: React.FC = () => {
  const { patients, liveVitalsMap, triggerWatchAlert } = useRealtime();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransferPatient, setSelectedTransferPatient] = useState<any>(null);

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

  const handleTriggerAlert = async (patientId: string, patientName: string, type: 'CRITICAL' | 'SOS' | 'NORMAL') => {
    try {
      await triggerWatchAlert(patientId, type);
      if (type === 'NORMAL') {
        toast.success('Nurse Watch Alert Cleared!', {
          description: 'OLED screen reverted to NORMAL.'
        });
      } else {
        toast.error(`🚨 ${type} Alert Sent to Nurse Watch!`, {
          description: `Watch displaying ${type} for ${patientName} (${patientId})`
        });
      }
    } catch (err: any) {
      toast.error('Failed to trigger watch alert: ' + (err.message || 'Firebase error'));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patients Directory" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Nurse Watch Hardware Demonstration Suite Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-teal-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>ESP32 NURSE WATCH DUAL-MODE HARDWARE DEMONSTRATOR</span>
                </div>
                <h3 className="text-base font-black text-white mt-0.5">Test Hardware Alert Outputs</h3>
                <p className="text-xs text-slate-300">
                  Simulate hardware & software alerts on your connected ESP32 Nurse Watch OLED display & buzzer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleTriggerAlert('LCIIS-P-000001', 'Test Patient (Hardware 1)', 'SOS')}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>1. Test Hardware 1 (SOS Emergency)</span>
                </button>

                <button
                  onClick={() => handleTriggerAlert('LCIIS-P-000002', 'Marcus Vance (Abnormal Demo)', 'CRITICAL')}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>2. Trigger Patient 2 (CRITICAL Alert)</span>
                </button>

                <button
                  onClick={() => handleTriggerAlert('LCIIS-P-000001', 'System', 'NORMAL')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1 shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reset to NORMAL</span>
                </button>
              </div>
            </div>
          </div>

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
                      <th className="p-3.5 text-right">Actions</th>
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
                        const v = p.deviceId ? liveVitalsMap[p.id] : undefined;
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
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedTransferPatient(p);
                                    setIsTransferModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 shadow-xs"
                                  title="Transfer patient ward or step-down from ICU"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                  <span>Transfer Ward</span>
                                </button>
                                <button
                                  onClick={() => handleTriggerAlert(p.id, p.name, 'CRITICAL')}
                                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[11px] transition-all flex items-center space-x-1 shadow-xs"
                                  title="Trigger CRITICAL alert for this patient to Nurse Watch"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>Alert Watch</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/doctor/patients/${p.id}`)}
                                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Review</span>
                                </button>
                              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => {
                const v = p.deviceId ? liveVitalsMap[p.id] : undefined;
                return (
                  <div key={p.id} className="card-clinical p-4 bg-white space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                          <p className="text-[10px] text-gray-500">{p.hospitalId} • Age {p.age} ({p.gender})</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                          p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.currentStatus}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 mt-2 text-gray-600">
                        <div>Ward: <strong className="text-gray-900">{p.ward}</strong> ({p.bed})</div>
                        <div>Doctor: <strong className="text-gray-900">{p.attendingDoctorName}</strong></div>
                        <div>Risk Score: <strong className="text-slate-900">{p.advisoryRisk}%</strong></div>
                      </div>

                      {v && (
                        <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] flex justify-around font-bold text-slate-800 border border-slate-100">
                          <span>HR: {v.heartRate?.value || '--'}</span>
                          <span>SpO2: {v.spo2?.value ? `${v.spo2.value}%` : '--'}</span>
                          <span>BP: {v.bloodPressure?.systolic?.value ? `${v.bloodPressure.systolic.value}/${v.bloodPressure.diastolic?.value}` : '--'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedTransferPatient(p);
                          setIsTransferModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-all flex items-center space-x-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Transfer</span>
                      </button>
                      <button
                        onClick={() => handleTriggerAlert(p.id, p.name, 'CRITICAL')}
                        className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[11px] transition-all flex items-center space-x-1"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Watch</span>
                      </button>
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

      {/* Ward Transfer & Step-Down Modal */}
      <TransferPatientModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        patient={selectedTransferPatient}
      />
    </div>
  );
};
