import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientLabModal } from '../../components/clinical/PatientLabModal';
import { FlaskConical, TrendingUp, Eye, CheckCircle2 } from 'lucide-react';

export const DoctorLabResultsPage: React.FC = () => {
  const { patients, labResults, getPatientById } = useRealtime();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalPatientId, setActiveModalPatientId] = useState<string | null>(null);

  const categories = ['Biochemistry', 'Inflammatory', 'Hematology', 'Coagulation', 'Other'];

  const filteredLabResults = labResults.filter((l) => {
    const matchesPatient = selectedPatientId === 'ALL' || l.patientId === selectedPatientId;
    const matchesCategory = selectedCategory === 'ALL' || l.category === selectedCategory;
    return matchesPatient && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Laboratory Results & Serial Trends" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Description & Controls */}
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2 text-teal-700" />
                  Longitudinal Laboratory Investigation Records
                </h2>
                <p className="text-xs text-gray-500">
                  Track serial laboratory parameters over time to identify subtle deterioration trends
                </p>
              </div>

              <div className="text-xs font-bold text-gray-500">
                {filteredLabResults.length} Lab Entries Recorded
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Filter by Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Hospital Patients</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.hospitalId}) — {p.ward} ({p.bed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Test Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Serial Lab Trends Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-clinical p-4 bg-orange-50/40 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between text-xs font-bold text-orange-900">
                <span>Creatinine Serial Trend</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-2">0.9 → 1.0 → 1.1 → 1.3 mg/dL</div>
              <p className="text-[11px] text-orange-800 font-medium mt-1">
                Gradual upward progression across recent serial blood draws
              </p>
            </div>

            <div className="card-clinical p-4 bg-red-50/40 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between text-xs font-bold text-red-900">
                <span>CRP Inflammatory Trend</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-2">8 → 12 → 18 → 31 mg/L</div>
              <p className="text-[11px] text-red-800 font-medium mt-1">
                Active inflammatory marker elevation detected
              </p>
            </div>

            <div className="card-clinical p-4 bg-emerald-50/40 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Electrolytes Stability</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-2">Na 139 mEq/L • K 4.1 mEq/L</div>
              <p className="text-[11px] text-emerald-800 font-medium mt-1">
                Serum sodium and potassium within baseline limits
              </p>
            </div>
          </div>

          {/* Full Lab Results Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FlaskConical className="w-4 h-4 mr-1.5 text-teal-700" />
                VERIFIED LABORATORY INVESTIGATIONS
              </h3>
              <span className="text-xs text-gray-500 font-medium">Sorted by Sample Time</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Test Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Result Value</th>
                    <th className="p-3.5">Reference Range</th>
                    <th className="p-3.5">Collection Time</th>
                    <th className="p-3.5">Technician / Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredLabResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No laboratory results match the selected patient/category filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLabResults.map((lab) => {
                      const patientObj = getPatientById(lab.patientId);
                      const isHigh = lab.value > lab.referenceHigh;
                      const isLow = lab.value < lab.referenceLow;
                      const isAbnormal = isHigh || isLow;

                      return (
                        <tr key={lab.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{patientObj?.name || lab.patientId}</div>
                            <div className="text-[10px] text-gray-500">{patientObj?.ward} • Bed {patientObj?.bed}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">{lab.testName}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                              {lab.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`font-black text-sm ${isAbnormal ? 'text-orange-600' : 'text-slate-900'}`}>
                              {lab.value} {lab.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500 text-[11px]">
                            {lab.referenceLow} – {lab.referenceHigh} {lab.unit}
                          </td>
                          <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                            {new Date(lab.sampleCollectedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setActiveModalPatientId(lab.patientId)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review Lab Trends</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <PatientLabModal
        patientId={activeModalPatientId}
        isOpen={!!activeModalPatientId}
        onClose={() => setActiveModalPatientId(null)}
      />
    </div>
  );
};

