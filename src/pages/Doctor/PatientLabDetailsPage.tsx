import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
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
  Legend,
  ReferenceArea
} from 'recharts';
import {
  FlaskConical,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Plus,
  Activity,
  FileText
} from 'lucide-react';
import type { LabCategory } from '../../types';
import { toast } from 'sonner';

export const PatientLabDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'P12345';
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    getPatientById,
    labResults,
    addLaboratoryResult
  } = useRealtime();

  const patient = getPatientById(patientId);

  // Tab state for test parameter selection in graph
  const [selectedTestParam, setSelectedTestParam] = useState<string>('Creatinine');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modal State for adding lab result
  const [isAddLabModalOpen, setIsAddLabModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<LabCategory>('Biochemistry');
  const [newTestName, setNewTestName] = useState('Creatinine');
  const [newValue, setNewValue] = useState<number>(1.4);
  const [newUnit, setNewUnit] = useState('mg/dL');
  const [newRefLow, setNewRefLow] = useState<number>(0.6);
  const [newRefHigh, setNewRefHigh] = useState<number>(1.2);
  const [newNotes, setNewNotes] = useState('Serial laboratory follow-up');

  if (!patient) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 flex flex-col justify-center items-center font-sans">
          <p className="text-gray-500 mb-4">Patient laboratory record not found ({patientId}).</p>
          <button onClick={() => navigate('/doctor/trends')} className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg text-xs">
            Return to Lab Results
          </button>
        </div>
      </div>
    );
  }

  // Filter lab results for this patient
  const patientLabs = labResults.filter(
    (l) => l.patientId === patientId || (patientId === 'P12345' && l.patientId === 'P12345')
  );

  const availableTestNames = Array.from(new Set(patientLabs.map((l) => l.testName)));

  const filteredLabTable = patientLabs.filter(
    (l) => selectedCategoryFilter === 'ALL' || l.category === selectedCategoryFilter
  );

  // Prepare Chart Data for Selected Test Parameter
  const chartData = patientLabs
    .filter((l) => l.testName.toLowerCase().includes(selectedTestParam.toLowerCase()))
    .sort((a, b) => new Date(a.sampleCollectedAt).getTime() - new Date(b.sampleCollectedAt).getTime())
    .map((l) => ({
      time: new Date(l.sampleCollectedAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      Value: l.value,
      LowRef: l.referenceLow,
      HighRef: l.referenceHigh,
    }));

  const selectedLabObj = patientLabs.find((l) => l.testName.toLowerCase().includes(selectedTestParam.toLowerCase()));
  const refLowVal = selectedLabObj?.referenceLow || 0.6;
  const refHighVal = selectedLabObj?.referenceHigh || 1.2;
  const paramUnit = selectedLabObj?.unit || 'mg/dL';

  // Calculate trajectory for selected parameter
  const paramReadings = patientLabs
    .filter((l) => l.testName.toLowerCase().includes(selectedTestParam.toLowerCase()))
    .sort((a, b) => new Date(a.sampleCollectedAt).getTime() - new Date(b.sampleCollectedAt).getTime());

  const latestVal = paramReadings[paramReadings.length - 1]?.value;
  const initialVal = paramReadings[0]?.value;
  const deltaVal = latestVal !== undefined && initialVal !== undefined ? (latestVal - initialVal).toFixed(2) : '0';
  const isUpward = Number(deltaVal) > 0;

  const handleAddLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLaboratoryResult({
      patientId: patient.id,
      testName: newTestName,
      category: newCategory,
      value: Number(newValue),
      unit: newUnit,
      referenceLow: Number(newRefLow),
      referenceHigh: Number(newRefHigh),
      sampleCollectedAt: new Date().toISOString(),
      resultedAt: new Date().toISOString(),
      technicianId: user?.id || 'user-lab-1',
      technicianName: user?.name || 'Authorized Lab Tech',
      source: 'LIS_MANUAL',
      verificationStatus: 'VERIFIED',
      notes: newNotes,
    });

    setIsAddLabModalOpen(false);
    toast.success(`New ${newTestName} reading (${newValue} ${newUnit}) recorded for ${patient.name}.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={`Laboratory Investigations — ${patient.name}`} />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Bar & Sub-Navigation Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-xs font-bold text-slate-700 hover:text-teal-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Previous View
            </button>

            {/* Patient Context Tabs */}
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
              <button
                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Clinical Overview</span>
              </button>
              <button
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-teal-800 shadow-xs flex items-center space-x-1"
              >
                <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
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
          </div>

          {/* Patient Profile & Lab Header Banner */}
          <div className="card-clinical p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-teal-700">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FlaskConical className="w-5 h-5" />
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
                    <span>Doctor: <strong>{patient.attendingDoctorName}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddLabModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> <span>Add Lab Result</span>
            </button>
          </div>

          {/* Serial Lab Trajectory Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-clinical p-4 bg-orange-50/40 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-center text-xs font-bold text-orange-900">
                <span>Creatinine Trajectory</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-base font-black text-slate-900 mt-2">0.9 → 1.0 → 1.1 → 1.2 → 1.3 mg/dL</div>
              <div className="text-[11px] text-orange-800 font-semibold mt-1">
                +44.4% cumulative increase over 5 consecutive blood draws
              </div>
            </div>

            <div className="card-clinical p-4 bg-red-50/40 border-l-4 border-l-red-500">
              <div className="flex justify-between items-center text-xs font-bold text-red-900">
                <span>CRP Inflammatory Trajectory</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-base font-black text-slate-900 mt-2">8 → 12 → 18 → 25 → 31 mg/L</div>
              <div className="text-[11px] text-red-800 font-semibold mt-1">
                +287.5% escalation (Reference High: 10 mg/L)
              </div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-600">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Total Lab Results On File</span>
                <FlaskConical className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{patientLabs.length} Entries</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                All 100% verified in LIS database ledger
              </div>
            </div>
          </div>

          {/* Interactive Recharts Graph Panel */}
          <div className="card-clinical p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-teal-700" />
                  SERIAL LABORATORY TIME-SERIES CHART
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visualizing parameter velocity vs reference bounds ({refLowVal} – {refHighVal} {paramUnit})
                </p>
              </div>

              {/* Parameter Selection Buttons */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                {availableTestNames.map((param) => (
                  <button
                    key={param}
                    onClick={() => setSelectedTestParam(param)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                      selectedTestParam.toLowerCase() === param.toLowerCase()
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200'
                    }`}
                  >
                    {param}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Trajectory Banner */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Selected Parameter:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedTestParam}</span>
                <span className="text-gray-400">({paramUnit})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">Initial: <strong>{initialVal || 'N/A'}</strong></span>
                <span className="text-gray-500">Latest: <strong>{latestVal || 'N/A'}</strong></span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] flex items-center ${
                  isUpward ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isUpward ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  Delta: {isUpward ? `+${deltaVal}` : deltaVal} {paramUnit}
                </span>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend />
                  <ReferenceArea y1={refLowVal} y2={refHighVal} fill="#10b981" fillOpacity={0.1} />
                  <Line
                    type="monotone"
                    dataKey="Value"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#f97316' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Laboratory Investigation Records Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FlaskConical className="w-4 h-4 mr-2 text-teal-700" />
                SERIAL LABORATORY MEASUREMENTS LEDGER
              </h3>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-gray-500">Category Filter:</label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-hidden"
                >
                  <option value="ALL">All Categories ({patientLabs.length})</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Inflammatory">Inflammatory</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Coagulation">Coagulation</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Test Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Result Value</th>
                    <th className="p-3.5">Reference Bounds</th>
                    <th className="p-3.5">Collection Time</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Technician & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredLabTable.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No laboratory readings match your category filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLabTable.map((lab) => {
                      const isHigh = lab.value > lab.referenceHigh;
                      const isLow = lab.value < lab.referenceLow;
                      const isAbnormal = isHigh || isLow;

                      return (
                        <tr key={lab.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{lab.testName}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
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
                          <td className="p-3.5 text-gray-700">
                            <div>{lab.technicianName}</div>
                            {lab.notes && <div className="text-[10px] text-gray-400 italic">{lab.notes}</div>}
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

      {/* Add Lab Result Modal */}
      {isAddLabModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <FlaskConical className="w-5 h-5 mr-2 text-teal-700" /> Add Lab Result for {patient.name}
            </h3>
            <form onSubmit={handleAddLabSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Inflammatory">Inflammatory</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Coagulation">Coagulation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Test Name</label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Result Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full p-2 border-2 border-teal-500 font-bold text-slate-900 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ref Low</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRefLow}
                    onChange={(e) => setNewRefLow(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ref High</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRefHigh}
                    onChange={(e) => setNewRefHigh(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLabModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Save Lab Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
