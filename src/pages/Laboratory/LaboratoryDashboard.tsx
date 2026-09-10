import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { FlaskConical, CheckCircle2, History } from 'lucide-react';
import type { LabCategory } from '../../types';
import { toast } from 'sonner';


export const LaboratoryDashboard: React.FC = () => {
  const { patients, labResults, addLaboratoryResult } = useRealtime();
  const { user } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState('P12345');
  const [category, setCategory] = useState<LabCategory>('Biochemistry');
  const [testName, setTestName] = useState('Creatinine');
  const [value, setValue] = useState<number>(1.3);
  const [unit, setUnit] = useState('mg/dL');
  const [refLow, setRefLow] = useState<number>(0.6);
  const [refHigh, setRefHigh] = useState<number>(1.2);
  const [notes, setNotes] = useState('Sequential measurement for longitudinal analysis');

  const commonTests: Record<LabCategory, { name: string; unit: string; low: number; high: number }[]> = {
    Biochemistry: [
      { name: 'Creatinine', unit: 'mg/dL', low: 0.6, high: 1.2 },
      { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', low: 7, high: 20 },
      { name: 'Sodium', unit: 'mEq/L', low: 135, high: 145 },
      { name: 'Potassium', unit: 'mEq/L', low: 3.5, high: 5.0 },
      { name: 'Glucose', unit: 'mg/dL', low: 70, high: 99 },
    ],
    Inflammatory: [
      { name: 'CRP (C-Reactive Protein)', unit: 'mg/L', low: 0, high: 10 },
      { name: 'Procalcitonin', unit: 'ng/mL', low: 0, high: 0.15 },
      { name: 'ESR', unit: 'mm/hr', low: 0, high: 20 },
    ],
    Hematology: [
      { name: 'WBC (White Blood Cells)', unit: 'x10^3/uL', low: 4.5, high: 11.0 },
      { name: 'Hemoglobin', unit: 'g/dL', low: 12.0, high: 16.0 },
      { name: 'Platelets', unit: 'x10^3/uL', low: 150, high: 450 },
    ],
    Coagulation: [
      { name: 'D-Dimer', unit: 'ng/mL', low: 0, high: 500 },
      { name: 'INR', unit: 'Ratio', low: 0.8, high: 1.1 },
    ],
    Other: [
      { name: 'Lactate', unit: 'mmol/L', low: 0.5, high: 1.0 },
    ],
  };

  const handleTestSelect = (t: { name: string; unit: string; low: number; high: number }) => {
    setTestName(t.name);
    setUnit(t.unit);
    setRefLow(t.low);
    setRefHigh(t.high);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || value === undefined) {
      toast.error('Please complete all required laboratory fields.');
      return;
    }

    addLaboratoryResult({
      patientId: selectedPatientId,
      testName,
      category,
      value: Number(value),
      unit,
      referenceLow: Number(refLow),
      referenceHigh: Number(refHigh),
      sampleCollectedAt: new Date().toISOString(),
      resultedAt: new Date().toISOString(),
      technicianId: user?.id || 'user-lab-1',
      technicianName: user?.name || 'Robert Vance, MLS',
      source: 'LIS_MANUAL',
      verificationStatus: 'VERIFIED',
      notes,
    });

    toast.success(`Lab result saved for ${selectedPatientId}. Clinical pipeline recalculated.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Laboratory Information System (LIS) Entry & Verification" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Lab Entry Form */}
            <div className="lg:col-span-7 card-clinical p-6 bg-white">
              <div className="flex items-center space-x-3 border-b border-gray-200 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">LABORATORY INVESTIGATION ENTRY</h2>
                  <p className="text-xs text-gray-500">
                    Saves result into historical time-series and triggers the Trend & Risk Engine.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Select Patient */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.hospitalId}) — {p.ward} ({p.bed})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category & Preset Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => {
                        setCategory(e.target.value);
                        const first = commonTests[e.target.value as LabCategory][0];
                        if (first) handleTestSelect(first);
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    >
                      <option value="Biochemistry">Biochemistry</option>
                      <option value="Inflammatory">Inflammatory</option>
                      <option value="Hematology">Hematology</option>
                      <option value="Coagulation">Coagulation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Preset Tests</label>
                    <select
                      onChange={(e) => {
                        const found = commonTests[category].find((t) => t.name === e.target.value);
                        if (found) handleTestSelect(found);
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-teal-800"
                    >
                      {commonTests[category].map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} ({t.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Test Name & Result Value */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block font-bold text-gray-700 mb-1">Test Name</label>
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Result Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full p-2.5 border-2 border-teal-500 font-black text-slate-900 text-sm rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Reference Bounds */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reference Low</label>
                    <input
                      type="number"
                      step="0.01"
                      value={refLow}
                      onChange={(e) => setRefLow(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reference High</label>
                    <input
                      type="number"
                      step="0.01"
                      value={refHigh}
                      onChange={(e) => setRefHigh(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Technician Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sample details, instrument notes..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="submit"
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SAVE RESULT & TRIGGER INTELLIGENCE PIPELINE</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 5 Columns: Verified Lab History */}
            <div className="lg:col-span-5 card-clinical p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <History className="w-4 h-4 mr-1.5 text-teal-600" /> Recent Verified Lab Results
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Firestore Ledger</span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {labResults.slice(-8).reverse().map((l) => (
                    <div key={l.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{l.testName}: <span className="text-teal-700 font-black">{l.value} {l.unit}</span></div>
                        <div className="text-[10px] text-gray-500">
                          Ref ({l.referenceLow}-{l.referenceHigh}) • {l.patientId}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {l.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
