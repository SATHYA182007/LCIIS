import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Stethoscope, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const NurseObservationsPage: React.FC = () => {
  const { patients, addNurseObservation } = useRealtime();
  const { user } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState('P12345');
  const [consciousness, setConsciousness] = useState<'Alert' | 'Voice' | 'Pain' | 'Unresponsive'>('Alert');
  const [painScore, setPainScore] = useState(2);
  const [respiratoryNote, setRespiratoryNote] = useState('Respirations regular, no intercostal retractions');
  const [fluidIntake, setFluidIntake] = useState(500);
  const [fluidOutput, setFluidOutput] = useState(450);
  const [notes, setNotes] = useState('Patient comfortable, oxygen cannula in place at 2L/min.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNurseObservation({
      patientId: selectedPatientId,
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

    toast.success('Nurse observation recorded successfully');
    setNotes('');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Nurse Clinical Observations Entry" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="card-clinical p-6 bg-white max-w-3xl mx-auto space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">BEDSIDE NURSING OBSERVATION RECORD</h2>
                <p className="text-xs text-gray-500">Record consciousness, pain scale, fluid balance, and clinical notes</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Ward Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.hospitalId}) — {p.ward} ({p.bed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Consciousness Level (AVPU)</label>
                  <select
                    value={consciousness}
                    onChange={(e: any) => setConsciousness(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Alert">Alert (A)</option>
                    <option value="Voice">Responds to Voice (V)</option>
                    <option value="Pain">Responds to Pain (P)</option>
                    <option value="Unresponsive">Unresponsive (U)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pain Scale Score: {painScore}/10</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fluid Intake (mL)</label>
                  <input
                    type="number"
                    value={fluidIntake}
                    onChange={(e) => setFluidIntake(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fluid Output / Urine (mL)</label>
                  <input
                    type="number"
                    value={fluidOutput}
                    onChange={(e) => setFluidOutput(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Respiratory Observations</label>
                <input
                  type="text"
                  value={respiratoryNote}
                  onChange={(e) => setRespiratoryNote(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nursing Summary Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  placeholder="Enter detailed nursing observation..."
                />
              </div>

              <button type="submit" className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Save Bedside Observation</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
