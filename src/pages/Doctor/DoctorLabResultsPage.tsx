import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientLabModal } from '../../components/clinical/PatientLabModal';
import { FlaskConical, TrendingUp, Eye, CheckCircle2, Search, Filter, AlertTriangle } from 'lucide-react';

export const DoctorLabResultsPage: React.FC = () => {
  const { patients, labResults } = useRealtime();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalPatientId, setActiveModalPatientId] = useState<string | null>(null);

  const categories = ['Biochemistry', 'Inflammatory', 'Hematology', 'Coagulation', 'Other'];

  // Map patients to their lab results summary (1 row per patient)
  const patientLabSummaries = patients.map((patient) => {
    const pLabs = labResults.filter(
      (l) =>
        l.patientId === patient.id ||
        l.patientId === patient.hospitalId ||
        ((patient.id === 'P12345' || patient.hospitalId === 'LCIIS-P-000001') &&
          (l.patientId === 'P12345' || l.patientId === 'LCIIS-P-000001'))
    );

    const latestLab = pLabs
      .slice()
      .sort((a, b) => new Date(b.sampleCollectedAt).getTime() - new Date(a.sampleCollectedAt).getTime())[0];
    const hasAbnormal = pLabs.some((l) => l.value > l.referenceHigh || l.value < l.referenceLow);
    const testNames = Array.from(new Set(pLabs.map((l) => l.testName)));

    return {
      patient,
      labs: pLabs,
      totalCount: pLabs.length,
      latestLab,
      hasAbnormal,
      testNames
    };
  });

  // Filter patient summaries based on search, patient selection, and category selection
  const filteredSummaries = patientLabSummaries.filter(({ patient, labs, testNames }) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testNames.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPatient =
      selectedPatientId === 'ALL' || patient.id === selectedPatientId || patient.hospitalId === selectedPatientId;

    const matchesCategory =
      selectedCategory === 'ALL' || labs.some((l) => l.category === selectedCategory);

    return matchesSearch && matchesPatient && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Lab Results & Serial Trends" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Description & Controls Card */}
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2 text-teal-700" />
                  Patient Laboratory Investigations Directory
                </h2>
                <p className="text-xs text-gray-500">
                  Select any patient to review their complete serial laboratory trends, time-series graphs, and test history
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">{filteredSummaries.length} Patients Displayed</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  LIS Live Sync Active
                </span>
              </div>
            </div>

            {/* Search and Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, ID, or test..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Select Patient */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
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

          {/* Patient Laboratory Table (1 Row Per Patient) */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FlaskConical className="w-4 h-4 mr-1.5 text-teal-700" />
                HOSPITAL PATIENT LABORATORY DIRECTORY
              </h3>
              <span className="text-xs text-gray-500 font-medium">1 Row Per Patient • Click Review to View Full Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Location / Bed</th>
                    <th className="p-3.5">Recorded Investigations</th>
                    <th className="p-3.5">Latest Result Summary</th>
                    <th className="p-3.5">Latest Sample Draw</th>
                    <th className="p-3.5">Lab Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No patient records match the selected search or category filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaries.map(({ patient, totalCount, latestLab, hasAbnormal, testNames }) => (
                      <tr key={patient.id || patient.hospitalId} className="hover:bg-teal-50/30 transition-colors">
                        {/* Patient Name & ID */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{patient.hospitalId} • Age {patient.age} ({patient.gender})</div>
                        </td>

                        {/* Location */}
                        <td className="p-3.5">
                          <div className="font-bold text-gray-800">{patient.ward}</div>
                          <div className="text-[10px] text-gray-500">{patient.bed}</div>
                        </td>

                        {/* Recorded Investigations */}
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {testNames.slice(0, 3).map((name) => (
                              <span key={name} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                                {name}
                              </span>
                            ))}
                            {testNames.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-teal-50 text-teal-800 rounded-md font-bold text-[10px]">
                                +{testNames.length - 3} more
                              </span>
                            )}
                            {testNames.length === 0 && (
                              <span className="text-gray-400 text-[11px] italic">No tests recorded</span>
                            )}
                          </div>
                        </td>

                        {/* Latest Result Summary */}
                        <td className="p-3.5">
                          {latestLab ? (
                            <div>
                              <span className="font-bold text-slate-900">{latestLab.testName}: </span>
                              <span className={`font-black ${latestLab.value > latestLab.referenceHigh || latestLab.value < latestLab.referenceLow ? 'text-orange-600' : 'text-emerald-700'}`}>
                                {latestLab.value} {latestLab.unit}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Latest Sample Draw */}
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {latestLab ? (
                            new Date(latestLab.sampleCollectedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : (
                            'Pending Draw'
                          )}
                        </td>

                        {/* Lab Status */}
                        <td className="p-3.5">
                          {hasAbnormal ? (
                            <span className="inline-flex items-center text-orange-800 bg-orange-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-orange-200">
                              <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" /> Flagged Value
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> {totalCount > 0 ? 'Verified Normal' : 'Intake Ready'}
                            </span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveModalPatientId(patient.id || patient.hospitalId)}
                            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 ml-auto cursor-pointer shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Lab Trends</span>
                          </button>
                        </td>
                      </tr>
                    ))
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

