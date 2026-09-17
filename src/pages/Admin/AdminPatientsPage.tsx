import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  ShieldCheck,
  Plus,
  Eye,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Layers,
  Activity,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import type { Patient, PatientStatus } from '../../types';

export const AdminPatientsPage: React.FC = () => {
  const {
    patients,
    addPatient,
    updatePatient,
    removePatient,
    bulkRemovePatients,
    bulkUpdatePatients,
    liveVitalsMap
  } = useRealtime();

  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');

  // Selection State for Mass Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isBulkReassignModalOpen, setIsBulkReassignModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  // Form State (Add / Edit Patient)
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [ward, setWard] = useState('General Ward A');
  const [bed, setBed] = useState('Bed 01');
  const [attendingDoctorName, setAttendingDoctorName] = useState('Dr. Sarah Jenkins');
  const [currentStatus, setCurrentStatus] = useState<PatientStatus>('MONITOR');
  const [primaryComplaint, setPrimaryComplaint] = useState('Acute dyspnea and fever observation');

  // Bulk Action Inputs
  const [bulkWard, setBulkWard] = useState('General Ward A');
  const [bulkBed, setBulkBed] = useState('Bed 01');
  const [bulkStatus, setBulkStatus] = useState<PatientStatus>('MONITOR');

  const wards = Array.from(new Set(patients.map((p) => p.ward)));

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ward.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'ALL' || p.ward === selectedWard;
    return matchesSearch && matchesWard;
  });

  // Checkbox Selection Logic
  const isAllSelected =
    filteredPatients.length > 0 &&
    filteredPatients.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPatients.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add Patient Handler
  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter patient name.');
      return;
    }

    const created = await addPatient({
      name,
      age: Number(age),
      gender,
      ward,
      bed,
      attendingDoctorName,
      currentStatus,
      primaryComplaint,
    });

    setIsAddPatientModalOpen(false);
    resetForm();
    toast.success(`Patient ${created.name} (${created.hospitalId || created.id}) registered into ${ward}.`);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setWard(p.ward);
    setBed(p.bed);
    setAttendingDoctorName(p.attendingDoctorName || 'Dr. Sarah Jenkins');
    setCurrentStatus(p.currentStatus || 'MONITOR');
    setPrimaryComplaint(p.primaryComplaint || '');
  };

  // Save Edit Handler
  const handleEditPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    await updatePatient(editingPatient.id, {
      name,
      age: Number(age),
      gender,
      ward,
      bed,
      attendingDoctorName,
      currentStatus,
      primaryComplaint,
    });

    toast.success(`Patient ${name} updated successfully in Firebase.`);
    setEditingPatient(null);
    resetForm();
  };

  // Single Delete Handler
  const handleDeletePatient = async (p: Patient) => {
    if (window.confirm(`Are you sure you want to remove patient "${p.name}" (${p.hospitalId}) from Firebase?`)) {
      await removePatient(p.id);
      setSelectedIds((prev) => prev.filter((id) => id !== p.id));
      toast.success(`Patient "${p.name}" removed from inpatient registry.`);
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to PERMANENTLY remove ${selectedIds.length} selected patient(s) from Firebase RTDB?`)) {
      await bulkRemovePatients(selectedIds);
      toast.success(`Successfully removed ${selectedIds.length} patients.`);
      setSelectedIds([]);
    }
  };

  // Bulk Ward & Bed Reassign
  const handleBulkReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    await bulkUpdatePatients(selectedIds, { ward: bulkWard, bed: bulkBed });
    toast.success(`Reassigned ${selectedIds.length} patients to ${bulkWard} - ${bulkBed}.`);
    setIsBulkReassignModalOpen(false);
    setSelectedIds([]);
  };

  // Bulk Status Update
  const handleBulkStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    await bulkUpdatePatients(selectedIds, { currentStatus: bulkStatus });
    toast.success(`Updated status of ${selectedIds.length} patients to ${bulkStatus}.`);
    setIsBulkStatusModalOpen(false);
    setSelectedIds([]);
  };

  const resetForm = () => {
    setName('');
    setAge(45);
    setGender('Male');
    setWard('General Ward A');
    setBed('Bed 01');
    setAttendingDoctorName('Dr. Sarah Jenkins');
    setCurrentStatus('MONITOR');
    setPrimaryComplaint('Acute dyspnea and fever observation');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patient Registration & Bed Assignment Management" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Summary & Provision Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-teal-700" />
                Hospital Inpatient Registry & Bed Allocations
              </h2>
              <p className="text-xs text-gray-500">
                Central administrative admission, bed assignment, mass actions, and live RTDB syncing
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddPatientModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Inpatient</span>
            </button>
          </div>

          {/* Search & Ward Filter Bar */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient name, hospital ID, ward, or bed..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Hospital Wards ({patients.length})</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mass Selection Toolbar Banner */}
          {selectedIds.length > 0 && (
            <div className="bg-teal-900 text-white p-3.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center font-black text-xs text-teal-200">
                  {selectedIds.length}
                </div>
                <span className="text-xs font-bold">Patients Selected for Mass Action</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setIsBulkReassignModalOpen(true)}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-lg flex items-center space-x-1 border border-teal-700 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Reassign Ward & Bed</span>
                </button>

                <button
                  onClick={() => setIsBulkStatusModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Update Advisory Status</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 bg-teal-950 hover:bg-black text-gray-300 rounded-lg transition-all cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Patient Registry Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button type="button" onClick={toggleSelectAll} className="cursor-pointer text-gray-500 hover:text-teal-700">
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-700 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">Hospital ID & Name</th>
                    <th className="p-3.5">Ward & Bed</th>
                    <th className="p-3.5">Advisory Status</th>
                    <th className="p-3.5">Risk %</th>
                    <th className="p-3.5">Live Vitals</th>
                    <th className="p-3.5">Attending Doctor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredPatients.map((p) => {
                    const vitals = liveVitalsMap[p.id] || (p.id === 'P12345' ? liveVitalsMap['P12345'] : undefined);
                    const isChecked = selectedIds.includes(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isChecked ? 'bg-teal-50/70 border-l-4 border-l-teal-700' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <button type="button" onClick={() => toggleSelectOne(p.id)} className="cursor-pointer text-gray-400 hover:text-teal-700">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-teal-700 mx-auto" />
                            ) : (
                              <Square className="w-4 h-4 mx-auto" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-500">{p.hospitalId} • Age {p.age} ({p.gender})</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-800">{p.ward}</div>
                          <div className="text-[10px] text-gray-500">{p.bed}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                            p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{p.advisoryRisk || 15}%</td>
                        <td className="p-3.5 text-[11px]">
                          {vitals && vitals.heartRate?.value !== undefined ? (
                            <span className="font-semibold text-slate-800">
                              HR {vitals.heartRate.value} • SpO2 {vitals.spo2?.value !== undefined ? `${vitals.spo2.value}%` : '--'}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold text-[10px]">Awaiting Telemetry</span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-700">{p.attendingDoctorName}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => navigate(`/doctor/patients/${p.id}`)}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs border border-teal-200 transition-all flex items-center space-x-1 cursor-pointer"
                              title="View Clinical Dashboard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
                              title="Edit Patient Information"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeletePatient(p)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs border border-red-200 transition-all flex items-center space-x-1 cursor-pointer"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Register / Edit Patient Modal */}
      {(isAddPatientModalOpen || editingPatient) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPatient ? `Edit Patient — ${editingPatient.name} (${editingPatient.hospitalId})` : 'Register New Inpatient'}
              </h3>
              <button
                onClick={() => {
                  setIsAddPatientModalOpen(false);
                  setEditingPatient(null);
                  resetForm();
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingPatient ? handleEditPatientSubmit : handleAddPatientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ward Location *</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. ICU Unit A"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bed Number *</label>
                  <input
                    type="text"
                    value={bed}
                    onChange={(e) => setBed(e.target.value)}
                    placeholder="e.g. Bed 08"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Attending Doctor *</label>
                  <input
                    type="text"
                    value={attendingDoctorName}
                    onChange={(e) => setAttendingDoctorName(e.target.value)}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Advisory Status *</label>
                  <select
                    value={currentStatus}
                    onChange={(e: any) => setCurrentStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Registered">Registered</option>
                    <option value="Under Care">Under Care</option>
                    <option value="STABLE">STABLE</option>
                    <option value="MONITOR">MONITOR</option>
                    <option value="HIGH RISK">HIGH RISK</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Clinical Complaint / Diagnosis</label>
                <textarea
                  value={primaryComplaint}
                  onChange={(e) => setPrimaryComplaint(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPatientModalOpen(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 shadow-xs">
                  {editingPatient ? 'Save Patient Changes' : 'Register Inpatient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Reassign Ward & Bed Modal */}
      {isBulkReassignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Mass Reassign Ward & Bed ({selectedIds.length} Selected)
            </h3>
            <form onSubmit={handleBulkReassignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Ward</label>
                <input
                  type="text"
                  value={bulkWard}
                  onChange={(e) => setBulkWard(e.target.value)}
                  placeholder="e.g. ICU Unit B"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Starting Bed Number</label>
                <input
                  type="text"
                  value={bulkBed}
                  onChange={(e) => setBulkBed(e.target.value)}
                  placeholder="e.g. Bed 01"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBulkReassignModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800">
                  Apply Mass Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Status Modal */}
      {isBulkStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Mass Update Advisory Status ({selectedIds.length} Selected)
            </h3>
            <form onSubmit={handleBulkStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select New Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e: any) => setBulkStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  <option value="Registered">Registered</option>
                  <option value="Under Care">Under Care</option>
                  <option value="STABLE">STABLE</option>
                  <option value="MONITOR">MONITOR</option>
                  <option value="HIGH RISK">HIGH RISK</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBulkStatusModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-800">
                  Apply Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
