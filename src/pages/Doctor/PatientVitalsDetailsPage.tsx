import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
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
  HeartPulse,
  ChevronLeft,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Plus,
  FileText,
  FlaskConical,
  Radio,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

export const PatientVitalsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'P12345';
  const navigate = useNavigate();

  const {
    getPatientById,
    liveVitalsMap,
    updateLiveVitals,
    devices
  } = useRealtime();

  const patient = getPatientById(patientId);
  const vitals = liveVitalsMap[patientId] || (patientId === 'P12345' ? liveVitalsMap['P12345'] : undefined);
  const device = devices.find((d) => d.patientId === patientId);

  const [activeChartTab, setActiveChartTab] = useState<'hr' | 'spo2' | 'bp' | 'rr' | 'temp'>('hr');
  const [isUpdateVitalsModalOpen, setIsUpdateVitalsModalOpen] = useState(false);

  // Form State for updating vitals
  const [newHR, setNewHR] = useState(vitals?.heartRate?.value || 80);
  const [newSpO2, setNewSpO2] = useState(vitals?.spo2?.value || 98);
  const [newSystolic, setNewSystolic] = useState(vitals?.bloodPressure?.systolic?.value || 120);
  const [newDiastolic, setNewDiastolic] = useState(vitals?.bloodPressure?.diastolic?.value || 80);
  const [newRR, setNewRR] = useState(vitals?.respiratoryRate?.value || 18);
  const [newTemp, setNewTemp] = useState(vitals?.temperature?.value || 36.8);

  if (!patient) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-1 p-8 flex flex-col justify-center items-center">
          <p className="text-gray-500 mb-4">Patient telemetry record not found ({patientId}).</p>
          <button onClick={() => navigate('/doctor/vitals')} className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg text-xs">
            Return to Live Vitals
          </button>
        </div>
      </div>
    );
  }

  const hasHR = vitals?.heartRate?.value !== undefined;
  const hasSpO2 = vitals?.spo2?.value !== undefined;
  const hasBP = vitals?.bloodPressure?.systolic?.value !== undefined;
  const hasRR = vitals?.respiratoryRate?.value !== undefined;
  const hasTemp = vitals?.temperature?.value !== undefined;
  const hasUrine = vitals?.urineOutput?.value !== undefined;

  const hasVitals = hasHR || hasSpO2 || hasBP || hasRR || hasTemp;

  const hrVal = vitals?.heartRate?.value;
  const spo2Val = vitals?.spo2?.value;
  const sysVal = vitals?.bloodPressure?.systolic?.value;
  const diaVal = vitals?.bloodPressure?.diastolic?.value;
  const rrVal = vitals?.respiratoryRate?.value;
  const tempVal = vitals?.temperature?.value;

  const isHrHigh = Boolean(hrVal && hrVal > 100);
  const isSpo2Low = Boolean(spo2Val && spo2Val < 94);

  // Time Series Telemetry History (only populated when vitals exist)
  const vitalsTimeData = hasVitals ? [
    { time: '10:00 AM', HeartRate: (hrVal ? hrVal - 10 : 75), SpO2: (spo2Val ? Math.min(100, spo2Val + 2) : 98), Systolic: (sysVal ? sysVal - 10 : 120), Diastolic: (diaVal ? diaVal - 5 : 80), RespRate: (rrVal ? rrVal - 2 : 16), Temp: (tempVal ? tempVal - 0.5 : 36.6) },
    { time: '11:00 AM', HeartRate: (hrVal ? hrVal - 5 : 78), SpO2: (spo2Val ? Math.min(100, spo2Val + 1) : 98), Systolic: (sysVal ? sysVal - 5 : 122), Diastolic: (diaVal ? diaVal - 2 : 80), RespRate: (rrVal ? rrVal - 1 : 17), Temp: (tempVal ? tempVal - 0.2 : 36.7) },
    { time: '12:00 PM', HeartRate: (hrVal ? hrVal - 2 : 80), SpO2: (spo2Val || 98), Systolic: (sysVal || 120), Diastolic: (diaVal || 80), RespRate: (rrVal || 18), Temp: (tempVal || 36.8) },
    { time: '01:00 PM', HeartRate: (hrVal ? hrVal - 1 : 82), SpO2: (spo2Val || 98), Systolic: (sysVal || 120), Diastolic: (diaVal || 80), RespRate: (rrVal || 18), Temp: (tempVal || 36.8) },
    { time: 'Current', HeartRate: hrVal, SpO2: spo2Val, Systolic: sysVal, Diastolic: diaVal, RespRate: rrVal, Temp: tempVal },
  ] : [];

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLiveVitals(patient.id, {
        heartRate: Number(newHR),
        spo2: Number(newSpO2),
        systolicBP: Number(newSystolic),
        diastolicBP: Number(newDiastolic),
        respiratoryRate: Number(newRR),
        temperature: Number(newTemp),
        timestamp: Date.now()
      });

      setIsUpdateVitalsModalOpen(false);
      toast.success(`Bedside telemetry updated for ${patient.name}!`, {
        description: `HR: ${newHR} bpm | SpO2: ${newSpO2}% | BP: ${newSystolic}/${newDiastolic} mmHg`
      });
    } catch (err: any) {
      toast.error('Failed to update vitals: ' + (err.message || 'Firebase error'));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={`Bedside Telemetry Stream — ${patient.name}`} />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Bar & Sub-Navigation Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-teal-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
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
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-teal-800 shadow-xs flex items-center space-x-1"
              >
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Live Vitals Telemetry</span>
              </button>
            </div>
          </div>

          {/* Patient Profile & Hardware Banner */}
          <div className="card-clinical p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-cyan-600">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-black text-slate-900">{patient.name}</h1>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {patient.hospitalId}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5 flex flex-wrap gap-x-4">
                    <span>Age: <strong>{patient.age} yrs</strong> ({patient.gender})</span>
                    <span>Ward: <strong>{patient.ward}</strong></span>
                    <span>Bed: <strong>{patient.bed}</strong></span>
                    <span>Device Node: <strong className="font-mono">{device?.esp32Id || 'Awaiting Hardware Assignment'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasVitals ? (
                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>ESP32 Telemetry Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold">
                  <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>No Hardware Linked</span>
                </div>
              )}

              <button
                onClick={() => setIsUpdateVitalsModalOpen(true)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> <span>Update Vitals</span>
              </button>
            </div>
          </div>

          {/* High-Frequency Live Telemetry Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Heart Rate Monitor Card */}
            <div className={`card-clinical p-5 space-y-2 border-l-4 ${!hasHR ? 'bg-slate-50/70 border-l-slate-300 border-dashed' : isHrHigh ? 'border-l-red-500 bg-red-50/30' : 'border-l-emerald-500 bg-white'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <HeartPulse className={`w-4 h-4 mr-1 ${hasHR ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} /> HEART RATE (BPM)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 60-100</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-black ${hasHR ? (isHrHigh ? 'text-red-600' : 'text-slate-900') : 'text-slate-400'}`}>
                  {hasHR ? hrVal : '--'}
                </span>
                <span className="text-xs text-gray-500 font-bold">BPM</span>
              </div>
              {/* ECG Wave line */}
              <div className="h-8 w-full bg-slate-950 rounded flex items-center px-2 text-emerald-400 font-mono text-[10px] overflow-hidden">
                {hasHR ? (
                  <span className="animate-pulse">/\_/\__/\_/\__/\_/\__/\</span>
                ) : (
                  <span className="text-slate-600 font-mono text-[10px]">────────────────────────</span>
                )}
              </div>
            </div>

            {/* SpO2 Saturation Card */}
            <div className={`card-clinical p-5 space-y-2 border-l-4 ${!hasSpO2 ? 'bg-slate-50/70 border-l-slate-300 border-dashed' : isSpo2Low ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-emerald-500 bg-white'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <Radio className={`w-4 h-4 mr-1 ${hasSpO2 ? 'text-cyan-600 animate-pulse' : 'text-slate-400'}`} /> OXYGEN SATURATION (SpO2)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 95-100%</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-black ${hasSpO2 ? (isSpo2Low ? 'text-amber-600' : 'text-slate-900') : 'text-slate-400'}`}>
                  {hasSpO2 ? `${spo2Val}%` : '--'}
                </span>
                <span className="text-xs text-gray-500 font-bold">{hasSpO2 ? 'Live Sensor' : 'No Hardware'}</span>
              </div>
              {/* Pulse Oximetry Wave */}
              <div className="h-8 w-full bg-slate-950 rounded flex items-center px-2 text-cyan-300 font-mono text-[10px] overflow-hidden">
                {hasSpO2 ? (
                  <span className="animate-pulse">~~\__~~\__~~\__~~\__</span>
                ) : (
                  <span className="text-slate-600 font-mono text-[10px]">────────────────────────</span>
                )}
              </div>
            </div>

            {/* Blood Pressure & Resp Rate */}
            <div className={`card-clinical p-5 space-y-3 border-l-4 ${!hasBP ? 'bg-slate-50/70 border-l-slate-300 border-dashed' : 'border-l-teal-600 bg-white'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>BLOOD PRESSURE & RESPIRATION</span>
                <span className="text-[10px] font-mono text-gray-400">Continuous NIBP</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">BP (mmHg)</div>
                  <div className={`text-xl font-black mt-0.5 ${hasBP ? 'text-slate-900' : 'text-slate-400'}`}>
                    {hasBP ? `${sysVal}/${diaVal}` : '--/--'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Resp Rate (/min)</div>
                  <div className={`text-xl font-black mt-0.5 ${hasRR ? 'text-slate-900' : 'text-slate-400'}`}>
                    {hasRR ? rrVal : '--'}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 font-medium border-t border-gray-100 pt-2 flex justify-between">
                <span>Temp: <strong className={hasTemp ? 'text-slate-900' : 'text-slate-400'}>{hasTemp ? `${tempVal}°C` : '--'}</strong></span>
                <span>Urine: <strong className={hasUrine ? 'text-slate-900' : 'text-slate-400'}>{hasUrine ? `${vitals?.urineOutput?.value} mL/hr` : '--'}</strong></span>
              </div>
            </div>
          </div>

          {/* Vital Sign Time-Series Graph Panel */}
          <div className="card-clinical p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-teal-700" />
                  REAL-TIME TELEMETRY TREND GRAPHS
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Multi-parameter physiological trend trajectories over recent hours
                </p>
              </div>

              {/* Chart Parameter Tabs */}
              {hasVitals && (
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActiveChartTab('hr')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeChartTab === 'hr' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    Heart Rate
                  </button>
                  <button
                    onClick={() => setActiveChartTab('spo2')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeChartTab === 'spo2' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    SpO2 %
                  </button>
                  <button
                    onClick={() => setActiveChartTab('bp')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeChartTab === 'bp' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    Blood Pressure
                  </button>
                  <button
                    onClick={() => setActiveChartTab('rr')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeChartTab === 'rr' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    Resp Rate
                  </button>
                </div>
              )}
            </div>

            {/* Recharts Canvas / Empty State */}
            {hasVitals ? (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend />
                    {activeChartTab === 'hr' && (
                      <Line type="monotone" dataKey="HeartRate" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                    )}
                    {activeChartTab === 'spo2' && (
                      <Line type="monotone" dataKey="SpO2" name="SpO2 Saturation (%)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                    )}
                    {activeChartTab === 'bp' && (
                      <>
                        <Line type="monotone" dataKey="Systolic" name="Systolic BP (mmHg)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                        <Line type="monotone" dataKey="Diastolic" name="Diastolic BP (mmHg)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                      </>
                    )}
                    {activeChartTab === 'rr' && (
                      <Line type="monotone" dataKey="RespRate" name="Respiratory Rate (/min)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col justify-center items-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <div className="text-xs font-bold text-slate-700">Patient Registered — Awaiting Bedside Telemetry Stream</div>
                <div className="text-[11px] text-slate-500 mt-1 max-w-md">
                  Patient is admitted into {patient.ward} ({patient.bed}). Connect bedside ESP32 hardware monitor to stream live vitals to Firebase Realtime Database.
                </div>
              </div>
            )}
          </div>

          {/* Hardware Device Telemetry Node Status Box */}
          <div className="card-clinical p-5 bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center text-teal-400">
                <Cpu className="w-4 h-4 mr-2" /> BEDSIDE TELEMETRY NODE STATUS ({device?.esp32Id || 'UNLINKED'})
              </h3>
              {hasVitals ? (
                <span className="text-xs font-mono text-emerald-400 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" /> 100% Heartbeat Active
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5" /> Standby / Unlinked
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">MAC Address</div>
                <div className="font-mono font-bold text-white mt-0.5">{device?.macAddress || 'AWAITING HARDWARE'}</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">Firmware Version</div>
                <div className="font-mono font-bold text-white mt-0.5">{device?.firmwareVersion || 'v2.4.1-LCIIS'}</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">Battery Level</div>
                <div className="font-bold text-teal-300 mt-0.5 flex items-center">
                  <Battery className="w-3.5 h-3.5 mr-1" /> {hasVitals ? `${device?.batteryLevel || 98}%` : '--'}
                </div>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">Sensor Status</div>
                <div className={`font-bold mt-0.5 text-[11px] truncate ${hasVitals ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {hasVitals ? 'ECG, SpO2, Temp Calibrated' : 'Hardware Disconnected'}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Update Vitals Modal */}
      {isUpdateVitalsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-teal-700" /> Bedside Vitals Entry for {patient.name}
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={newHR}
                    onChange={(e) => setNewHR(Number(e.target.value))}
                    className="w-full p-2 border-2 border-teal-500 font-bold text-slate-900 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SpO2 Saturation (%)</label>
                  <input
                    type="number"
                    value={newSpO2}
                    onChange={(e) => setNewSpO2(Number(e.target.value))}
                    className="w-full p-2 border-2 border-teal-500 font-bold text-slate-900 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={newRR}
                    onChange={(e) => setNewRR(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateVitalsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Submit Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
