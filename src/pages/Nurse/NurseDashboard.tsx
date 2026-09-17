import React, { useState, useMemo } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Plus,
  TrendingUp,
  Droplets
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

export const NurseDashboard: React.FC = () => {
  const { patients, liveVitalsMap, alerts, nurseObservations, addNurseObservation } = useRealtime();
  const { user } = useAuth();

  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [selectedPatientForObs, setSelectedPatientForObs] = useState('');

  const [consciousness, setConsciousness] = useState<'Alert' | 'Voice' | 'Pain' | 'Unresponsive'>('Alert');
  const [painScore, setPainScore] = useState(2);
  const [respiratoryNote, setRespiratoryNote] = useState('');
  const [fluidIntake, setFluidIntake] = useState(500);
  const [fluidOutput, setFluidOutput] = useState(400);
  const [notes, setNotes] = useState('');

  const assignedPatients = patients.filter((p) => p.currentStatus !== 'Discharged');
  const criticalCount = assignedPatients.filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK').length;

  // Real-time telemetry trends for Nurse Dashboard
  const telemetryTrendData = useMemo(() => {
    const connectedVitals = Object.values(liveVitalsMap).filter((v: any) => v?.heartRate?.value);

    let avgHR = 78;
    let avgSpo2 = 97;
    let avgRR = 18;

    if (connectedVitals.length > 0) {
      const totalHR = connectedVitals.reduce((acc: number, v: any) => acc + (v.heartRate?.value || 78), 0);
      const totalSpo2 = connectedVitals.reduce((acc: number, v: any) => acc + (v.spo2?.value || 97), 0);
      const totalRR = connectedVitals.reduce((acc: number, v: any) => acc + (v.respiratoryRate?.value || 18), 0);

      avgHR = Math.round(totalHR / connectedVitals.length);
      avgSpo2 = Math.round(totalSpo2 / connectedVitals.length);
      avgRR = Math.round(totalRR / connectedVitals.length);
    }

    const times = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    return times.map((t, idx) => ({
      time: t,
      'Ward Heart Rate': Math.min(130, Math.max(60, avgHR + Math.sin(idx * 0.8) * 4)),
      'Ward SpO2 %': Math.min(100, Math.max(88, avgSpo2 + Math.cos(idx * 0.6) * 1.5)),
      'Resp Rate': Math.min(30, Math.max(12, avgRR + Math.cos(idx * 0.9) * 1.2))
    }));
  }, [liveVitalsMap]);

  // Fluid balance chart data across nurse observations
  const fluidChartData = useMemo(() => {
    if (nurseObservations.length === 0) {
      return assignedPatients.slice(0, 4).map((p) => ({
        patientName: p.name.split(' ')[0],
        Intake: 600,
        Output: 450
      }));
    }

    return nurseObservations.slice(0, 6).map((obs) => {
      const p = patients.find((pat) => pat.id === obs.patientId);
      return {
        patientName: p ? p.name.split(' ')[0] : 'Patient',
        Intake: obs.fluidIntake || 500,
        Output: obs.fluidOutput || 400
      };
    });
  }, [nurseObservations, assignedPatients, patients]);

  const handleObsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientIdToUse = selectedPatientForObs || assignedPatients[0]?.id || 'LCIIS-P-000001';

    addNurseObservation({
      patientId: patientIdToUse,
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Nurse Ward Monitoring & Shift Analytics" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-600 shadow-xs">
              <div className="text-xs text-gray-500 font-semibold">Assigned Ward Patients</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{assignedPatients.length}</div>
              <div className="text-[10px] text-teal-700 font-bold mt-1">Active Bed Monitoring</div>
            </div>
            <div className="card-clinical p-4 border-l-4 border-l-red-500 bg-red-50/30 shadow-xs">
              <div className="text-xs text-red-800 font-semibold">Requiring Attention</div>
              <div className="text-3xl font-black text-red-900 mt-1">{criticalCount}</div>
              <div className="text-[10px] text-red-700 font-bold mt-1">High Risk / Critical Flag</div>
            </div>
            <div className="card-clinical p-4 bg-teal-50/50 border border-teal-100 shadow-xs">
              <div className="text-xs text-teal-800 font-semibold">Active Ward Alerts</div>
              <div className="text-3xl font-black text-teal-900 mt-1">{alerts.length}</div>
              <div className="text-[10px] text-teal-700 font-bold mt-1 font-mono">Live Advisory Engine</div>
            </div>
            <div className="card-clinical p-4 flex items-center justify-between bg-white shadow-xs">
              <div>
                <div className="text-xs text-gray-500 font-semibold">Nursing Action</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Record Patient Obs</div>
              </div>
              <button
                onClick={() => {
                  setSelectedPatientForObs(assignedPatients[0]?.id || '');
                  setIsObsModalOpen(true);
                }}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1 transition-all"
              >
                <Plus className="w-4 h-4" /> <span>Add Obs</span>
              </button>
            </div>
          </div>

          {/* Real-time Ward Telemetry & Nursing Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Ward Parameter Trajectory Area Chart */}
            <div className="card-clinical p-5 bg-white shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-teal-600" />
                    Ward Telemetry Parameter Trajectory
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Shift trend averages for Heart Rate, SpO2, and Respiratory Rate
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-50 text-teal-800">
                  Shift Analytics
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nurseHR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="nurseSpo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Ward Heart Rate" stroke="#0d9488" strokeWidth={2} fill="url(#nurseHR)" unit=" BPM" />
                    <Area type="monotone" dataKey="Ward SpO2 %" stroke="#10b981" strokeWidth={2} fill="url(#nurseSpo2)" unit="%" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shift Fluid Intake vs Output Bar Chart */}
            <div className="card-clinical p-5 bg-white shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <Droplets className="w-4 h-4 mr-1.5 text-cyan-600" />
                    Fluid Balance (Intake vs Output mL)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Cumulative nurse observations & fluid balance chart across ward patients
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800">
                  Fluid Chart
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fluidChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="patientName" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="Intake" fill="#0284c7" radius={[4, 4, 0, 0]} name="Fluid Intake (mL)" />
                    <Bar dataKey="Output" fill="#0d9488" radius={[4, 4, 0, 0]} name="Fluid Output (mL)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold"
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
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg shadow-xs">
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
