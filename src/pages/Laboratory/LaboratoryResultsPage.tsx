import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { PatientLabModal } from '../../components/clinical/PatientLabModal';
import { FlaskConical, CheckCircle2, Search, Filter, Eye } from 'lucide-react';

export const LaboratoryResultsPage: React.FC = () => {
  const { labResults, getPatientById } = useRealtime();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalPatientId, setActiveModalPatientId] = useState<string | null>(null);

  const categories = ['Biochemistry', 'Inflammatory', 'Hematology', 'Coagulation', 'Other'];

  const filteredResults = labResults.filter((l) => {
    const p = getPatientById(l.patientId);
    if (!p) return false;
    const matchesSearch =
      l.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Verified Laboratory Results Queue" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="card-clinical p-4 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2 text-teal-700" />
                  Verified LIS Result Records & Audit Queue
                </h2>
                <p className="text-xs text-gray-500">
                  Complete historical log of laboratory investigations committed to the database
                </p>
              </div>

              <div className="text-xs font-bold text-gray-500">
                {filteredResults.length} Verified Records
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search test name or patient..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Test Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Result Value</th>
                    <th className="p-3.5">Reference Range</th>
                    <th className="p-3.5">Collection Time</th>
                    <th className="p-3.5">Verification Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No laboratory results match your search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((l) => {
                      const p = getPatientById(l.patientId);
                      const isHigh = l.value > l.referenceHigh;
                      const isLow = l.value < l.referenceLow;
                      const isAbnormal = isHigh || isLow;

                      return (
                        <tr key={l.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{p?.name || l.patientId}</div>
                            <div className="text-[10px] text-gray-500">{p?.ward} • Bed {p?.bed}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">{l.testName}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                              {l.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`font-black text-sm ${isAbnormal ? 'text-orange-600' : 'text-slate-900'}`}>
                              {l.value} {l.unit}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500 text-[11px]">
                            {l.referenceLow} – {l.referenceHigh} {l.unit}
                          </td>
                          <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                            {new Date(l.sampleCollectedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setActiveModalPatientId(l.patientId)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review Trends</span>
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

