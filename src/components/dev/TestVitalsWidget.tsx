import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Activity, Send, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const TestVitalsWidget: React.FC = () => {
  const { patients, liveVitalsMap, updateLiveVitals, isFirebaseConnected, firebaseError } = useRealtime();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [heartRate, setHeartRate] = useState<number>(82);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(37.1);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Default selection when patients load
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id || patients[0].hospitalId);
    }
  }, [patients, selectedPatientId]);

  // Sync inputs with selected patient's current vitals
  useEffect(() => {
    if (selectedPatientId && liveVitalsMap[selectedPatientId]) {
      const v = liveVitalsMap[selectedPatientId];
      if (v.heartRate?.value !== undefined) setHeartRate(v.heartRate.value);
      if (v.spo2?.value !== undefined) setSpo2(v.spo2.value);
      if (v.temperature?.value !== undefined) setTemperature(v.temperature.value);
      if (v.respiratoryRate?.value !== undefined) setRespiratoryRate(v.respiratoryRate.value);
      if (v.bloodPressure?.systolic?.value !== undefined) setSystolicBP(v.bloodPressure.systolic.value);
      if (v.bloodPressure?.diastolic?.value !== undefined) setDiastolicBP(v.bloodPressure.diastolic.value);
    }
  }, [selectedPatientId, liveVitalsMap]);

  const handleUpdateVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select or enter a valid Patient ID');
      return;
    }

    setIsUpdating(true);
    try {
      await updateLiveVitals(selectedPatientId, {
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        respiratoryRate: Number(respiratoryRate),
        systolicBP: Number(systolicBP),
        diastolicBP: Number(diastolicBP),
        timestamp: Date.now()
      });

      toast.success(`Live vitals written to Firebase path liveVitals/${selectedPatientId}`, {
        description: `HR: ${heartRate} | SpO2: ${spo2}% | BP: ${systolicBP}/${diastolicBP} | Temp: ${temperature}°C`
      });
    } catch (err: any) {
      toast.error('Failed to write vitals to Firebase: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl border border-teal-500/40 flex items-center space-x-2 transition-all hover:scale-105"
      >
        <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
        <span>⚡ Test Vitals (Firebase RTDB)</span>
        <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      </button>

      {/* Floating Modal / Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 bg-slate-900 border border-slate-700/80 text-white rounded-2xl shadow-2xl p-5 space-y-4 font-sans select-none backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <span>Firebase Vitals Tester</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">path: liveVitals/&#123;patientId&#125;</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Connection Status Banner */}
          <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between font-semibold border ${
            isFirebaseConnected 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isFirebaseConnected ? 'Firebase RTDB Live' : 'Fallback / Offline'}</span>
            </div>
            <span className="text-[10px] opacity-80 font-mono">greenminds-2e90e</span>
          </div>

          {firebaseError && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{firebaseError}</span>
            </div>
          )}

          {/* Vitals Form */}
          <form onSubmit={handleUpdateVitals} className="space-y-3">
            {/* Patient Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Select Patient</label>
              {patients.length > 0 ? (
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id || p.hospitalId} value={p.id || p.hospitalId}>
                      {p.name} ({p.hospitalId || p.id}) — {p.ward} {p.bed}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  placeholder="e.g. LCIIS-P-000001"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              )}
            </div>

            {/* Vitals Grid Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Respiratory Rate (bpm)</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-teal-300 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Writing to Firebase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>UPDATE VITALS</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
