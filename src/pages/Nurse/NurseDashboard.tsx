import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { HeartPulse, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const NurseDashboard: React.FC = () => {
  const { patients, liveVitalsMap, alerts, addNurseObservation } = useRealtime();
  const { user } = useAuth();


  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [selectedPatientForObs, setSelectedPatientForObs] = useState('P12345');

  const [consciousness, setConsciousness] = useState<'Alert' | 'Voice' | 'Pain' | 'Unresponsive'>('Alert');
  const [painScore, setPainScore] = useState(2);
  const [respiratoryNote, setRespiratoryNote] = useState('');
  const [fluidIntake, setFluidIntake] = useState(500);
  const [fluidOutput, setFluidOutput] = useState(400);
  const [notes, setNotes] = useState('');



  const assignedPatients = patients.filter((p) => p.currentStatus !== 'Discharged');
  const criticalCount = assignedPatients.filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK').length;

  const handleObsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNurseObservation({
      patientId: selectedPatientForObs,
      nurseId: user?.id || 'user-nurse-1',
      nurseName: user?.name || 'Nurse Michael Chen, RN',
      ward: 'ICU Unit A',
      department: 'Intensive Care Unit',
      consciousness,
      painScore,
      respiratoryNote,
      fluidIntake,
      fluidOutput,
      notes,
    });

    setIsObsModalOpen(false);
    setNotes('');
    toast.success('Nurse observation recorded successfully');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Nurse Ward Monitoring & Observations" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-clinical p-4">
              <div className="text-xs text-gray-500 font-semibold">Assigned Ward Patients</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{assignedPatients.length}</div>
            </div>
            <div className="card-clinical p-4 border-l-4 border-l-red-500 bg-red-50/30">
              <div className="text-xs text-red-800 font-semibold">Requiring Attention</div>
              <div className="text-3xl font-black text-red-900 mt-1">{criticalCount}</div>
            </div>
            <div className="card-clinical p-4 bg-teal-50/50">
              <div className="text-xs text-teal-800 font-semibold">Active Ward Alerts</div>
              <div className="text-3xl font-black text-teal-900 mt-1">{alerts.length}</div>
            </div>
            <div className="card-clinical p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-semibold">Nursing Action</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Record Patient Obs</div>
              </div>
              <button
                onClick={() => setIsObsModalOpen(true)}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" /> <span>Add Obs</span>
              </button>
            </div>
          </div>

          {/* Live Patient Monitoring Table */}
          <div className="card-clinical overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <HeartPulse className="w-4 h-4 mr-2 text-teal-600" />
                LIVE WARD TELEMETRY GRID
              </h3>
              <span className="text-xs text-gray-500 font-medium font-mono">Telemetry Subscribed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Bed</th>
                    <th className="p-3">HR</th>
                    <th className="p-3">SpO2</th>
                    <th className="p-3">BP</th>
                    <th className="p-3">RR</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Advisory Status</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {assignedPatients.map((p) => {
                    const vitals = liveVitalsMap[p.id] || liveVitalsMap['P12345'];
                    return (
                      <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.hospitalId}</div>
                        </td>
                        <td className="p-3 font-bold text-gray-800">{p.bed}</td>
                        <td className="p-3 font-bold text-slate-900">{vitals?.heartRate?.value || 82} <span className="text-[10px] font-normal text-gray-400">BPM</span></td>
                        <td className={`p-3 font-bold ${(vitals?.spo2?.value || 98) < 94 ? 'text-amber-600 font-black' : 'text-slate-900'}`}>
                          {vitals?.spo2?.value || 92}%
                        </td>
                        <td className="p-3 text-slate-900">{vitals?.bloodPressure?.systolic.value || 138}/{vitals?.bloodPressure?.diastolic.value || 84}</td>
                        <td className="p-3 text-slate-900">{vitals?.respiratoryRate?.value || 24}/min</td>
                        <td className="p-3 text-slate-900">{vitals?.temperature?.value || 38.2}°C</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{p.advisoryRisk}%</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPatientForObs(p.id);
                              setIsObsModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-teal-50 text-teal-800 font-bold rounded text-[11px] border border-gray-200"
                          >
                            + Obs
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

      {/* Nurse Observation Entry Modal */}
      {isObsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Nurse Observation</h3>
            <form onSubmit={handleObsSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Patient</label>
                <select
                  value={selectedPatientForObs}
                  onChange={(e) => setSelectedPatientForObs(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  {assignedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.hospitalId}) — {p.bed}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Consciousness (AVPU)</label>
                  <select
                    value={consciousness}
                    onChange={(e: any) => setConsciousness(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Alert">Alert</option>
                    <option value="Voice">Voice</option>
                    <option value="Pain">Pain</option>
                    <option value="Unresponsive">Unresponsive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pain Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fluid Intake (mL)</label>
                  <input
                    type="number"
                    value={fluidIntake}
                    onChange={(e) => setFluidIntake(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fluid Output (mL)</label>
                  <input
                    type="number"
                    value={fluidOutput}
                    onChange={(e) => setFluidOutput(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Respiratory Note</label>
                <input
                  type="text"
                  value={respiratoryNote}
                  onChange={(e) => setRespiratoryNote(e.target.value)}
                  placeholder="Respiration observations or oxygen support notes..."
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nursing Notes</label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record ward nursing notes, mobility, or patient comfort details..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg h-20"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsObsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
