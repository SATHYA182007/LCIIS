import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
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
  X,
  Activity,
  Wifi,
  Battery,
  Plus,
  Radio,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientVitalsModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientVitalsModal: React.FC<PatientVitalsModalProps> = ({ patientId, isOpen, onClose }) => {
  const { getPatientById, liveVitalsMap, updateLiveVitals, devices } = useRealtime();

  const [activeChartTab, setActiveChartTab] = useState<'hr' | 'spo2' | 'bp' | 'rr'>('hr');
  const [isUpdateVitalsModalOpen, setIsUpdateVitalsModalOpen] = useState(false);

  // Controlled form state for vitals update
  const [formHR, setFormHR] = useState<number>(80);
  const [formSpO2, setFormSpO2] = useState<number>(98);
  const [formSystolic, setFormSystolic] = useState<number>(120);
  const [formDiastolic, setFormDiastolic] = useState<number>(80);
  const [formRR, setFormRR] = useState<number>(18);
  const [formTemp, setFormTemp] = useState<number>(36.8);

  const patient = patientId ? getPatientById(patientId) : null;
  const vitals = patientId ? (liveVitalsMap[patientId] || (patientId === 'P12345' ? liveVitalsMap['P12345'] : undefined)) : null;
  const device = devices.find((d) => d.patientId === patientId) || devices[0];

  // Sync controlled state whenever vitals or patientId changes
  useEffect(() => {
    if (vitals) {
      if (vitals.heartRate?.value !== undefined) setFormHR(vitals.heartRate.value);
      if (vitals.spo2?.value !== undefined) setFormSpO2(vitals.spo2.value);
      if (vitals.bloodPressure?.systolic?.value !== undefined) setFormSystolic(vitals.bloodPressure.systolic.value);
      if (vitals.bloodPressure?.diastolic?.value !== undefined) setFormDiastolic(vitals.bloodPressure.diastolic.value);
      if (vitals.respiratoryRate?.value !== undefined) setFormRR(vitals.respiratoryRate.value);
      if (vitals.temperature?.value !== undefined) setFormTemp(vitals.temperature.value);
    }
  }, [patientId, liveVitalsMap]);

  if (!isOpen || !patientId || !patient) return null;

  const hrVal = vitals?.heartRate?.value || formHR;
  const spo2Val = vitals?.spo2?.value || formSpO2;
  const isHrHigh = hrVal > 100;
  const isSpo2Low = spo2Val < 94;

  const vitalsTimeData = [
    { time: '10:00 AM', HeartRate: 82, SpO2: 98, Systolic: 120, Diastolic: 80, RespRate: 16, Temp: 37.0 },
    { time: '11:00 AM', HeartRate: 88, SpO2: 97, Systolic: 124, Diastolic: 82, RespRate: 18, Temp: 37.2 },
    { time: '12:00 PM', HeartRate: 94, SpO2: 96, Systolic: 128, Diastolic: 82, RespRate: 19, Temp: 37.5 },
    { time: '01:00 PM', HeartRate: 102, SpO2: 94, Systolic: 134, Diastolic: 84, RespRate: 22, Temp: 37.9 },
    { time: '02:00 PM', HeartRate: hrVal, SpO2: spo2Val, Systolic: formSystolic, Diastolic: formDiastolic, RespRate: formRR, Temp: formTemp },
  ];

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLiveVitals(patient.id, {
        heartRate: Number(formHR),
        spo2: Number(formSpO2),
        systolicBP: Number(formSystolic),
        diastolicBP: Number(formDiastolic),
        respiratoryRate: Number(formRR),
        temperature: Number(formTemp),
        timestamp: Date.now()
      });

      setIsUpdateVitalsModalOpen(false);
      toast.success(`Updated bedside vitals for ${patient.name}!`, {
        description: `HR: ${formHR} bpm | SpO2: ${formSpO2}% | BP: ${formSystolic}/${formDiastolic} mmHg`
      });
    } catch (err: any) {
      toast.error('Failed to update vitals: ' + (err.message || 'Firebase error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 font-sans">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{patient.name}</h2>
                <span className="font-mono text-xs bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold">
                  {patient.hospitalId}
                </span>
                <span className="text-xs text-slate-400">({patient.ward} • {patient.bed})</span>
              </div>
              <p className="text-xs text-cyan-300 font-medium flex items-center mt-0.5">
                <Wifi className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
                Live Bedside Telemetry Stream • Node Node: {device?.esp32Id || 'ESP32-ICU-001'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsUpdateVitalsModalOpen(!isUpdateVitalsModalOpen)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>Update Vitals</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Update Vitals Form if open */}
          {isUpdateVitalsModalOpen && (
            <div className="p-4 bg-white rounded-xl border border-teal-200 shadow-sm space-y-3 animate-in zoom-in-95 duration-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Plus className="w-4 h-4 mr-1 text-teal-600" /> Spot-Check Vital Entry for {patient.name}
              </h3>
              <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">HR (BPM)</label>
                    <input
                      type="number"
                      value={formHR}
                      onChange={(e) => setFormHR(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={formSpO2}
                      onChange={(e) => setFormSpO2(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sys BP</label>
                    <input
                      type="number"
                      value={formSystolic}
                      onChange={(e) => setFormSystolic(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Dia BP</label>
                    <input
                      type="number"
                      value={formDiastolic}
                      onChange={(e) => setFormDiastolic(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">RR (/min)</label>
                    <input
                      type="number"
                      value={formRR}
                      onChange={(e) => setFormRR(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formTemp}
                      onChange={(e) => setFormTemp(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button type="button" onClick={() => setIsUpdateVitalsModalOpen(false)} className="px-3 py-1.5 border border-gray-300 rounded font-bold text-gray-600 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded text-xs transition-colors shadow-xs">
                    Submit Vitals
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* High-Frequency Live Telemetry Display Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Heart Rate Card */}
            <div className={`card-clinical p-4 bg-white space-y-2 border-l-4 ${isHrHigh ? 'border-l-red-500 bg-red-50/30' : 'border-l-emerald-500'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <HeartPulse className="w-4 h-4 mr-1 text-red-500 animate-pulse" /> HEART RATE (BPM)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 60-100</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-black ${isHrHigh ? 'text-red-600' : 'text-slate-900'}`}>{hrVal}</span>
                <span className="text-xs text-gray-500 font-bold">BPM</span>
              </div>
              {/* Simulated ECG Wave */}
              <div className="h-7 w-full bg-slate-950 rounded flex items-center px-2 text-emerald-400 font-mono text-[10px] overflow-hidden">
                <span className="animate-pulse">/\_/\__/\_/\__/\_/\__/\</span>
              </div>
            </div>

            {/* SpO2 Card */}
            <div className={`card-clinical p-4 bg-white space-y-2 border-l-4 ${isSpo2Low ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-emerald-500'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <Radio className="w-4 h-4 mr-1 text-cyan-600 animate-pulse" /> OXYGEN SATURATION (SpO2)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 95-100%</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-black ${isSpo2Low ? 'text-amber-600' : 'text-slate-900'}`}>{spo2Val}%</span>
                <span className="text-xs text-gray-500 font-bold">Live</span>
              </div>
              {/* Pulse Oximetry Wave */}
              <div className="h-7 w-full bg-slate-950 rounded flex items-center px-2 text-cyan-300 font-mono text-[10px] overflow-hidden">
                <span className="animate-pulse">~~\__~~\__~~\__~~\__</span>
              </div>
            </div>

            {/* BP & Resp Rate Card */}
            <div className="card-clinical p-4 bg-white space-y-2.5 border-l-4 border-l-teal-600">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>BLOOD PRESSURE & RESPIRATION</span>
                <span className="text-[10px] font-mono text-gray-400">Continuous</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">BP (mmHg)</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {vitals?.bloodPressure?.systolic.value || 138}/{vitals?.bloodPressure?.diastolic.value || 84}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Resp Rate (/min)</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {vitals?.respiratoryRate?.value || 24}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-1.5 flex justify-between">
                <span>Temp: <strong>{vitals?.temperature?.value || 38.2}°C</strong></span>
                <span>Urine: <strong>{vitals?.urineOutput?.value || 25} mL/hr</strong></span>
              </div>
            </div>
          </div>

          {/* Time-Series Recharts Graph */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-1.5 text-teal-700" /> Physiological Trametry Trend Graph
              </h3>

              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveChartTab('hr')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    activeChartTab === 'hr' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Heart Rate
                </button>
                <button
                  onClick={() => setActiveChartTab('spo2')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    activeChartTab === 'spo2' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  SpO2 %
                </button>
                <button
                  onClick={() => setActiveChartTab('bp')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    activeChartTab === 'bp' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Blood Pressure
                </button>
                <button
                  onClick={() => setActiveChartTab('rr')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    activeChartTab === 'rr' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Resp Rate
                </button>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
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
          </div>

          {/* Hardware Device Telemetry Node Status Box */}
          <div className="card-clinical p-4 bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold flex items-center text-teal-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4 mr-1.5" /> Bedside Node Hardware ({device?.esp32Id || 'ESP32-ICU-001'})
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" /> Telemetry Stream Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">MAC Address</div>
                <div className="font-mono font-bold text-white mt-0.5">{device?.macAddress || '24:0A:C4:00:11:A2'}</div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Firmware</div>
                <div className="font-mono font-bold text-white mt-0.5">{device?.firmwareVersion || 'v2.4.1-LCIIS'}</div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Battery</div>
                <div className="font-bold text-teal-300 mt-0.5 flex items-center">
                  <Battery className="w-3.5 h-3.5 mr-1" /> {device?.batteryLevel || 98}%
                </div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Calibration</div>
                <div className="font-bold text-emerald-300 mt-0.5 text-[11px] truncate">
                  ECG, SpO2 Good
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Telemetry Review
          </button>
        </div>
      </div>
    </div>
  );
};
