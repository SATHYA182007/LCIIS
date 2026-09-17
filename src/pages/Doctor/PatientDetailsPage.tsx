import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { exportPatientPDF } from '../../utils/exportUtils';
import { WhatChangedCard } from '../../components/clinical/WhatChangedCard';
import { LiveVitalGrid } from '../../components/vitals/LiveVitalGrid';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Activity,
  FileText,
  Plus,
  Pill,
  Stethoscope,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  FlaskConical
} from 'lucide-react';
import { toast } from 'sonner';

export const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'P12345';
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    getPatientById,
    liveVitalsMap,
    getPatientRiskAssessment,
    getPatientTrends,
    labResults,
    doctorRemarks,
    medications,
    interventions,
    addDoctorRemark,
    addMedication,
    addIntervention
  } = useRealtime();

  const patient = getPatientById(patientId);
  const vitals = liveVitalsMap[patientId] || (patientId === 'P12345' ? liveVitalsMap['P12345'] : undefined);
  const riskAssessment = getPatientRiskAssessment(patientId);
  const trends = getPatientTrends(patientId);

  // Tab state for Vital Sign Trends
  const [activeVitalTab, setActiveVitalTab] = useState<'creatinine' | 'crp' | 'spo2' | 'hr'>('creatinine');

  // Modals state
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  const [remarkText, setRemarkText] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [actionText, setActionText] = useState('');
  const [outcomeText, setOutcomeText] = useState('');

  if (!patient) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 flex flex-col justify-center items-center">
          <p className="text-gray-500 mb-4">Patient record not found ({patientId}).</p>
          <button onClick={() => navigate('/doctor/dashboard')} className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg text-xs">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter lab results for Recharts visualization
  const patientLabs = labResults.filter((l) => l.patientId === patientId || (patientId === 'P12345' && l.patientId === 'P12345'));
  
  const creatinineChartData = patientLabs
    .filter((l) => l.testName.toLowerCase().includes('creatinine'))
    .map((l) => ({
      time: new Date(l.sampleCollectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Creatinine: l.value,
    }));

  const crpChartData = patientLabs
    .filter((l) => l.testName.toLowerCase().includes('crp'))
    .map((l) => ({
      time: new Date(l.sampleCollectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      CRP: l.value,
    }));

  const handleAddRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    addDoctorRemark({
      patientId: patient.id,
      doctorId: user?.id || 'user-doc-1',
      doctorName: user?.name || 'Dr. Sarah Jenkins',
      remark: remarkText,
      type: 'INSTRUCTION',
    });
    setRemarkText('');
    setIsRemarkModalOpen(false);
    toast.success('Clinical note recorded.');
  };

  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    addMedication({
      patientId: patient.id,
      prescribedBy: user?.name || 'Dr. Sarah Jenkins',
      medicationName: medName,
      dosage: medDosage || 'Standard',
      frequency: medFreq || 'Q8H',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setMedName(''); setMedDosage(''); setMedFreq('');
    setIsMedModalOpen(false);
    toast.success('Medication order entered.');
  };

  const handleAddInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;
    addIntervention({
      patientId: patient.id,
      performedBy: user?.name || 'Dr. Sarah Jenkins',
      action: actionText,
      outcome: outcomeText || 'Under observation',
    });
    setActionText(''); setOutcomeText('');
    setIsInterventionModalOpen(false);
    toast.success('Care action recorded.');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={`Patient Review — ${patient.name}`} />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Navigation Bar & Sub-Navigation Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              onClick={() => {
                if (user?.role === 'nurse') navigate('/nurse/dashboard');
                else if (user?.role === 'laboratory') navigate('/laboratory/dashboard');
                else if (user?.role === 'admin') navigate('/admin/dashboard');
                else navigate('/doctor/dashboard');
              }}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-teal-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            {/* Patient Context Tabs */}
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
              <button
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-teal-800 shadow-xs flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>Clinical Overview</span>
              </button>
              <button
                onClick={() => navigate(`/doctor/patients/${patient.id}/labs`)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Lab Investigations</span>
              </button>
              <button
                onClick={() => navigate(`/doctor/patients/${patient.id}/vitals`)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Vitals Telemetry</span>
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsRemarkModalOpen(true)}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Add Note</span>
              </button>
              <button
                onClick={() => setIsMedModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1"
              >
                <Pill className="w-3.5 h-3.5" /> <span>Add Medication</span>
              </button>
              <button
                onClick={() => setIsInterventionModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1"
              >
                <Stethoscope className="w-3.5 h-3.5" /> <span>Care Action</span>
              </button>
              <button
                onClick={() => {
                  exportPatientPDF(patient, labResults.filter(l => l.patientId === patient.id), vitals, doctorRemarks.filter(r => r.patientId === patient.id));
                  toast.success(`Exported LCIIS Patient Summary PDF for ${patient.name}`);
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" /> <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Patient Header Card */}
          <div className="card-clinical p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-black text-slate-900">{patient.name}</h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold">
                  {patient.hospitalId}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Age: <strong>{patient.age} yrs</strong> ({patient.gender})</span>
                <span>Ward: <strong>{patient.ward}</strong></span>
                <span>Bed: <strong>{patient.bed}</strong></span>
                <span>Doctor: <strong>{patient.attendingDoctorName}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                riskAssessment.riskBand === 'CRITICAL' ? 'bg-red-500 text-white' :
                riskAssessment.riskBand === 'HIGH RISK' ? 'bg-orange-500 text-white' :
                riskAssessment.riskBand === 'MONITOR' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {riskAssessment.riskBand} ({riskAssessment.overallRiskScore}%)
              </span>
            </div>
          </div>

          {/* WHAT HAS CHANGED? Centerpiece */}
          <WhatChangedCard
            patient={patient}
            riskAssessment={riskAssessment}
            trends={trends}
            vitals={vitals}
          />

          {/* Current Vitals Section */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-1 text-teal-600" /> CURRENT VITALS
            </div>
            <LiveVitalGrid vitals={vitals} />
          </div>

          {/* Changes Over Time Cards */}
          <div className="card-clinical p-5 bg-white space-y-3">
            <h3 className="text-sm font-bold text-slate-900">CHANGES OVER TIME</h3>
            {patientLabs.length >= 2 || (vitals?.spo2?.value && vitals.spo2.value < 95) || (vitals?.heartRate?.value && vitals.heartRate.value > 100) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {(() => {
                  const dynamicCards: React.ReactNode[] = [];
                  const labGroups: Record<string, typeof patientLabs> = {};
                  patientLabs.forEach((l) => {
                    if (!labGroups[l.testName]) labGroups[l.testName] = [];
                    labGroups[l.testName].push(l);
                  });

                  Object.entries(labGroups).forEach(([testName, group]) => {
                    if (group.length >= 2) {
                      const sorted = [...group].sort(
                        (a, b) => new Date(a.sampleCollectedAt).getTime() - new Date(b.sampleCollectedAt).getTime()
                      );
                      const initial = sorted[0].value;
                      const latest = sorted[sorted.length - 1].value;
                      const unit = sorted[0].unit || '';
                      const dir = latest > initial ? 'Increasing' : latest < initial ? 'Decreasing' : 'Stable';
                      const isWorsening = testName.toLowerCase().includes('creatinine') || testName.toLowerCase().includes('crp')
                        ? latest > initial
                        : false;

                      dynamicCards.push(
                        <div key={testName} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-gray-500 font-medium">{testName}</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{initial} → {latest} {unit}</div>
                          <div className={`font-bold flex items-center mt-1 ${isWorsening ? 'text-red-700' : 'text-teal-700'}`}>
                            {dir === 'Increasing' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />} {dir}
                          </div>
                        </div>
                      );
                    }
                  });

                  if (vitals?.spo2?.value && vitals.spo2.value < 95) {
                    dynamicCards.push(
                      <div key="vital-spo2" className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                        <div className="text-gray-500 font-medium">Oxygen Level (SpO2)</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">Baseline → {vitals.spo2.value}%</div>
                        <div className="text-amber-700 font-bold flex items-center mt-1">
                          <TrendingDown className="w-3.5 h-3.5 mr-1" /> Decreasing
                        </div>
                      </div>
                    );
                  }

                  if (vitals?.heartRate?.value && vitals.heartRate.value > 100) {
                    dynamicCards.push(
                      <div key="vital-hr" className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
                        <div className="text-gray-500 font-medium">Heart Rate</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">Baseline → {vitals.heartRate.value} BPM</div>
                        <div className="text-purple-700 font-bold flex items-center mt-1">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" /> Elevated
                        </div>
                      </div>
                    );
                  }

                  return dynamicCards;
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 font-medium">Creatinine</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Baseline Normal</div>
                  <div className="text-slate-600 font-semibold flex items-center mt-1">
                    <Activity className="w-3.5 h-3.5 mr-1 text-teal-600" /> Stable Baseline
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 font-medium">CRP</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Baseline Normal</div>
                  <div className="text-slate-600 font-semibold flex items-center mt-1">
                    <Activity className="w-3.5 h-3.5 mr-1 text-teal-600" /> Stable Baseline
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 font-medium">Oxygen Level (SpO2)</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{vitals?.spo2?.value || 98}% Live</div>
                  <div className="text-emerald-700 font-bold flex items-center mt-1">
                    <Activity className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Optimal Saturation
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 font-medium">Heart Rate</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{vitals?.heartRate?.value || 80} BPM</div>
                  <div className="text-emerald-700 font-bold flex items-center mt-1">
                    <Activity className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Normal Pulse
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Recharts Graph with Clean Parameter Selector */}
          <div className="card-clinical p-4 sm:p-5 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">VITAL SIGN & LAB TREND GRAPHS</h3>
              
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveVitalTab('creatinine')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                    activeVitalTab === 'creatinine' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  Creatinine
                </button>
                <button
                  onClick={() => setActiveVitalTab('crp')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                    activeVitalTab === 'crp' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  CRP
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              {(activeVitalTab === 'creatinine' ? creatinineChartData : crpChartData).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(activeVitalTab === 'creatinine' ? creatinineChartData : crpChartData) as any}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={activeVitalTab === 'creatinine' ? 'Creatinine' : 'CRP'}
                      stroke={activeVitalTab === 'creatinine' ? '#f97316' : '#ef4444'}
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  <FlaskConical className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">No Longitudinal {activeVitalTab === 'creatinine' ? 'Creatinine' : 'CRP'} Readings Logged</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Laboratory data points will plot automatic trend lines here once lab results are entered.</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes, Medications & Care Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctor Notes */}
            <div className="card-clinical p-5 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-teal-700" /> Doctor Notes
                </h3>
                <button onClick={() => setIsRemarkModalOpen(true)} className="text-xs font-bold text-teal-700 hover:underline">
                  + Add Note
                </button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto text-xs">
                {doctorRemarks.filter((r) => r.patientId === patientId).length === 0 ? (
                  <p className="text-gray-400 italic">No notes recorded yet.</p>
                ) : (
                  doctorRemarks.filter((r) => r.patientId === patientId).map((r) => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-gray-500 font-medium mb-1">
                        <span className="font-bold text-slate-900">{r.doctorName}</span>
                        <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-800">{r.remark}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Care Actions & Medications */}
            <div className="card-clinical p-5 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-1.5 text-teal-700" /> Medications & Care Actions
                </h3>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto text-xs">
                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">Active Medications</div>
                  {medications.filter((m) => m.patientId === patientId).map((m) => (
                    <div key={m.id} className="p-2 bg-teal-50/50 rounded border border-teal-100 flex justify-between mb-1">
                      <span className="font-bold text-slate-900">{m.medicationName} ({m.dosage})</span>
                      <span className="text-teal-800 font-semibold">{m.frequency}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">Care Actions</div>
                  {interventions.filter((i) => i.patientId === patientId).map((i) => (
                    <div key={i.id} className="p-2 bg-gray-50 rounded border border-gray-200 mb-1">
                      <div className="font-bold text-slate-800">{i.action}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Outcome: {i.outcome}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Note Modal */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Doctor Note</h3>
            <form onSubmit={handleAddRemarkSubmit} className="space-y-4">
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Enter clinical assessment or note..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm h-28 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsRemarkModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-lg">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {isMedModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Prescribe Medication</h3>
            <form onSubmit={handleAddMedSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. IV Furosemide"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g. 20 mg"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    placeholder="e.g. Q12H"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsMedModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg">
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Care Action</h3>
            <form onSubmit={handleAddInterventionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Action Performed</label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. High-Flow Oxygen Therapy initiated at 4L/min"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Observed Outcome</label>
                <input
                  type="text"
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  placeholder="e.g. SpO2 stabilized from 90% to 93%"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsInterventionModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg">
                  Record Care Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
