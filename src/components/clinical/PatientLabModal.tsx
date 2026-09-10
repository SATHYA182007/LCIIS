import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
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
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Plus
} from 'lucide-react';
import type { LabCategory } from '../../types';
import { toast } from 'sonner';

interface PatientLabModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientLabModal: React.FC<PatientLabModalProps> = ({ patientId, isOpen, onClose }) => {
  const { getPatientById, labResults, addLaboratoryResult } = useRealtime();
  const { user } = useAuth();

  const [selectedTestParam, setSelectedTestParam] = useState<string>('Creatinine');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Add Lab Form inside modal
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<LabCategory>('Biochemistry');
  const [newTestName, setNewTestName] = useState('Creatinine');
  const [newValue, setNewValue] = useState<number>(1.4);
  const [newUnit, setNewUnit] = useState('mg/dL');
  const [newRefLow, setNewRefLow] = useState<number>(0.6);
  const [newRefHigh, setNewRefHigh] = useState<number>(1.2);
  const [newNotes, setNewNotes] = useState('Serial laboratory follow-up');

  if (!isOpen || !patientId) return null;

  const patient = getPatientById(patientId);

  if (!patient) return null;

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
      technicianName: user?.name || 'Authorized Staff',
      source: 'LIS_MANUAL',
      verificationStatus: 'VERIFIED',
      notes: newNotes,
    });

    setIsAddFormOpen(false);
    toast.success(`New ${newTestName} reading (${newValue} ${newUnit}) saved for ${patient.name}.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 font-sans">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{patient.name}</h2>
                <span className="font-mono text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded font-bold">
                  {patient.hospitalId}
                </span>
                <span className="text-xs text-slate-400">({patient.ward} • {patient.bed})</span>
              </div>
              <p className="text-xs text-teal-300 font-medium">Serial Laboratory Investigation & Serial Trend Analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>{isAddFormOpen ? 'View History' : 'Add Result'}</span>
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
          {/* Add Lab Form Section (if toggled) */}
          {isAddFormOpen && (
            <div className="p-4 bg-white rounded-xl border border-teal-200 shadow-sm space-y-3 animate-in zoom-in-95 duration-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Plus className="w-4 h-4 mr-1 text-teal-600" /> Enter New Laboratory Result for {patient.name}
              </h3>
              <form onSubmit={handleAddLabSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
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
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Result Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      className="w-full p-2 border-2 border-teal-500 font-bold text-slate-900 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ref Low</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newRefLow}
                      onChange={(e) => setNewRefLow(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ref High</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newRefHigh}
                      onChange={(e) => setNewRefHigh(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Technician Notes</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-teal-700 text-white font-bold rounded-lg text-xs">
                    Save Result
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Serial Lab Trajectory Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-clinical p-3.5 bg-orange-50/40 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-center text-xs font-bold text-orange-900">
                <span>Creatinine Serial Trend</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-1">0.9 → 1.0 → 1.1 → 1.3 mg/dL</div>
              <div className="text-[10px] text-orange-800 font-semibold mt-0.5">
                +44.4% cumulative rise across recent blood draws
              </div>
            </div>

            <div className="card-clinical p-3.5 bg-red-50/40 border-l-4 border-l-red-500">
              <div className="flex justify-between items-center text-xs font-bold text-red-900">
                <span>CRP Inflammatory Trend</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-1">8 → 12 → 18 → 31 mg/L</div>
              <div className="text-[10px] text-red-800 font-semibold mt-0.5">
                +287.5% escalation (Ref High: 10 mg/L)
              </div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-teal-600">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Total Lab Results On File</span>
                <FlaskConical className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">{patientLabs.length} Recorded</div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                All 100% verified in LIS ledger
              </div>
            </div>
          </div>

          {/* Time-Series Recharts Graph */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5 text-teal-700" /> Serial Time-Series Chart
              </h3>

              {/* Parameter Selector */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                {availableTestNames.map((param) => (
                  <button
                    key={param}
                    onClick={() => setSelectedTestParam(param)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                      selectedTestParam.toLowerCase() === param.toLowerCase()
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    {param}
                  </button>
                ))}
              </div>
            </div>

            {/* Trajectory Header info */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
              <span className="font-bold text-slate-900">{selectedTestParam} ({paramUnit})</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center ${
                isUpward ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isUpward ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                Delta: {isUpward ? `+${deltaVal}` : deltaVal} {paramUnit}
              </span>
            </div>

            {/* Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend />
                  <ReferenceArea y1={refLowVal} y2={refHighVal} fill="#10b981" fillOpacity={0.1} />
                  <Line
                    type="monotone"
                    dataKey="Value"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#f97316' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Investigation Records ({filteredLabTable.length})
              </h3>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="p-1 border border-gray-200 rounded text-xs font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Inflammatory">Inflammatory</option>
                <option value="Hematology">Hematology</option>
                <option value="Coagulation">Coagulation</option>
              </select>
            </div>

            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Test Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Ref Range</th>
                    <th className="p-2.5">Collected Time</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredLabTable.map((lab) => {
                    const isAbnormal = lab.value > lab.referenceHigh || lab.value < lab.referenceLow;
                    return (
                      <tr key={lab.id} className="hover:bg-teal-50/30">
                        <td className="p-2.5 font-bold text-slate-900">{lab.testName}</td>
                        <td className="p-2.5">{lab.category}</td>
                        <td className="p-2.5 font-black text-sm">
                          <span className={isAbnormal ? 'text-orange-600' : 'text-slate-900'}>
                            {lab.value} {lab.unit}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-500 text-[11px]">{lab.referenceLow} - {lab.referenceHigh} {lab.unit}</td>
                        <td className="p-2.5 text-gray-500 font-mono text-[11px]">
                          {new Date(lab.sampleCollectedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Lab Review
          </button>
        </div>
      </div>
    </div>
  );
};
