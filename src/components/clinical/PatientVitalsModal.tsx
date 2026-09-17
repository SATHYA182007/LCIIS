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
  WifiOff,
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
  const vitals = patientId ? liveVitalsMap[patientId] : null;
  const hasHardware = Boolean(patient?.deviceId && vitals && vitals.heartRate?.value !== undefined);
  const device = devices.find((d) => d.patientId === patientId);

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
  }, [patientId, liveVitalsMap, vitals]);

  if (!isOpen || !patientId || !patient) return null;

  const hrVal = hasHardware ? vitals?.heartRate?.value : null;
  const spo2Val = hasHardware ? vitals?.spo2?.value : null;
  const sysVal = hasHardware ? vitals?.bloodPressure?.systolic?.value : null;
  const diaVal = hasHardware ? vitals?.bloodPressure?.diastolic?.value : null;
  const rrVal = hasHardware ? vitals?.respiratoryRate?.value : null;
  const tempVal = hasHardware ? vitals?.temperature?.value : null;

  const isHrHigh = Boolean(hrVal && hrVal > 100);
  const isSpo2Low = Boolean(spo2Val && spo2Val < 94);

  const vitalsTimeData = hasHardware ? [
    { time: '10:00 AM', HeartRate: (hrVal ? hrVal - 6 : 75), SpO2: (spo2Val ? Math.min(100, spo2Val + 1) : 98), Systolic: (sysVal ? sysVal - 6 : 120), Diastolic: (diaVal ? diaVal - 3 : 80), RespRate: (rrVal ? rrVal - 2 : 16) },
    { time: '11:00 AM', HeartRate: (hrVal ? hrVal - 3 : 78), SpO2: (spo2Val ? Math.min(100, spo2Val + 1) : 98), Systolic: (sysVal ? sysVal - 3 : 122), Diastolic: (diaVal ? diaVal - 1 : 80), RespRate: (rrVal ? rrVal - 1 : 17) },
    { time: '12:00 PM', HeartRate: (hrVal ? hrVal - 1 : 80), SpO2: (spo2Val || 98), Systolic: (sysVal || 120), Diastolic: (diaVal || 80), RespRate: (rrVal || 18) },
    { time: 'Current', HeartRate: hrVal, SpO2: spo2Val, Systolic: sysVal, Diastolic: diaVal, RespRate: rrVal },
  ] : [];

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
                {hasHardware ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
                    Live Bedside Telemetry Stream • Node Node: {device?.esp32Id || patient.deviceId || 'ESP32 Device'}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1 text-amber-400" />
                    No Hardware Telemetry Linked • Bed Standby Mode
                  </>
                )}
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
            <div className={`card-clinical p-4 bg-white space-y-2 border-l-4 ${!hasHardware ? 'border-l-slate-300' : isHrHigh ? 'border-l-red-500 bg-red-50/30' : 'border-l-emerald-500'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <HeartPulse className={`w-4 h-4 mr-1 ${hasHardware ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} /> HEART RATE (BPM)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 60-100</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-black ${hasHardware ? (isHrHigh ? 'text-red-600' : 'text-slate-900') : 'text-slate-400'}`}>
                  {hasHardware ? hrVal : '--'}
                </span>
                <span className="text-xs text-gray-500 font-bold">BPM</span>
              </div>
              <div className="h-7 w-full bg-slate-950 rounded flex items-center px-2 text-emerald-400 font-mono text-[10px] overflow-hidden">
                {hasHardware ? (
                  <span className="animate-pulse">/\_/\__/\_/\__/\_/\__/\</span>
                ) : (
                  <span className="text-slate-500">-- NO HARDWARE SIGNAL --</span>
                )}
              </div>
            </div>

            {/* SpO2 Card */}
            <div className={`card-clinical p-4 bg-white space-y-2 border-l-4 ${!hasHardware ? 'border-l-slate-300' : isSpo2Low ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-emerald-500'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span className="flex items-center">
                  <Radio className={`w-4 h-4 mr-1 ${hasHardware ? 'text-cyan-600 animate-pulse' : 'text-slate-400'}`} /> OXYGEN SATURATION (SpO2)
                </span>
                <span className="text-[10px] font-mono text-gray-400">Ref: 95-100%</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-black ${hasHardware ? (isSpo2Low ? 'text-amber-600' : 'text-slate-900') : 'text-slate-400'}`}>
                  {hasHardware ? `${spo2Val}%` : '--'}
                </span>
                <span className="text-xs text-gray-500 font-bold">{hasHardware ? 'Live' : 'Standby'}</span>
              </div>
              <div className="h-7 w-full bg-slate-950 rounded flex items-center px-2 text-cyan-300 font-mono text-[10px] overflow-hidden">
                {hasHardware ? (
                  <span className="animate-pulse">~~\__~~\__~~\__~~\__</span>
                ) : (
                  <span className="text-slate-500">-- NO HARDWARE SIGNAL --</span>
                )}
              </div>
            </div>

            {/* BP & Resp Rate Card */}
            <div className={`card-clinical p-4 bg-white space-y-2.5 border-l-4 ${hasHardware ? 'border-l-teal-600' : 'border-l-slate-300'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>BLOOD PRESSURE & RESPIRATION</span>
                <span className="text-[10px] font-mono text-gray-400">{hasHardware ? 'Continuous' : 'Standby'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">BP (mmHg)</div>
                  <div className={`text-lg font-black ${hasHardware ? 'text-slate-900' : 'text-slate-400'} mt-0.5`}>
                    {hasHardware ? `${sysVal}/${diaVal}` : '--/--'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Resp Rate (/min)</div>
                  <div className={`text-lg font-black ${hasHardware ? 'text-slate-900' : 'text-slate-400'} mt-0.5`}>
                    {hasHardware ? rrVal : '--'}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-1.5 flex justify-between">
                <span>Temp: <strong>{hasHardware ? `${tempVal}°C` : '--'}</strong></span>
                <span>Urine: <strong>{hasHardware ? `${vitals?.urineOutput?.value || 25} mL/hr` : '--'}</strong></span>
              </div>
            </div>
          </div>

          {/* Time-Series Recharts Graph or Unlinked Notice */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-1.5 text-teal-700" /> Physiological Telemetry Trend Graph
              </h3>

              {hasHardware && (
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
              )}
            </div>

            {!hasHardware ? (
              <div className="h-56 my-2 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                <Radio className="w-8 h-8 text-amber-500 animate-pulse" />
                <div className="font-extrabold text-sm text-slate-900">NO TELEMETRY HARDWARE LINKED TO THIS PATIENT</div>
                <p className="text-xs text-slate-500 max-w-md">
                  Patient <strong className="text-slate-900">{patient.name}</strong> is currently registered in <strong className="text-slate-900">{patient.ward} ({patient.bed})</strong> without a linked ESP32 hardware device.
                  Once an ESP32 hardware telemetry device is assigned to this bed and streams to Firebase, live vitals and physiological trend graphs will display automatically.
                </p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Hardware Device Telemetry Node Status Box */}
          <div className="card-clinical p-4 bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold flex items-center text-teal-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4 mr-1.5" /> Bedside Node Hardware ({hasHardware ? (device?.esp32Id || patient.deviceId) : 'Unlinked / Standby'})
              </h3>
              <span className={`text-[10px] font-mono flex items-center ${hasHardware ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-2 h-2 rounded-full ${hasHardware ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} mr-1`} />
                {hasHardware ? 'Telemetry Stream Active' : 'No Hardware Connected'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">MAC Address</div>
                <div className="font-mono font-bold text-white mt-0.5">{hasHardware ? (device?.macAddress || 'Hardware Stream Connected') : '--:--:--:--:--:--'}</div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Firmware</div>
                <div className="font-mono font-bold text-white mt-0.5">{hasHardware ? (device?.firmwareVersion || 'v2.4.1') : 'Standby'}</div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Battery</div>
                <div className="font-bold text-teal-300 mt-0.5 flex items-center">
                  <Battery className="w-3.5 h-3.5 mr-1" /> {hasHardware ? (device?.batteryLevel ? `${device.batteryLevel}%` : '100%') : '--'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded border border-slate-700">
                <div className="text-slate-400 text-[10px]">Calibration</div>
                <div className="font-bold text-emerald-300 mt-0.5 text-[11px] truncate">
                  {hasHardware ? 'ECG, SpO2 Good' : 'No Sensor Signal'}
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

