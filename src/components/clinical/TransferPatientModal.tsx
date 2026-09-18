import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import type { Patient, PatientStatus } from '../../types';
import { Building2, ArrowRightLeft, CheckCircle2, ShieldCheck, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { updatePatient, addDoctorRemark } = useRealtime();
  const { user } = useAuth();

  const [ward, setWard] = useState('General Ward B');
  const [bed, setBed] = useState('Bed G-08');
  const [departmentId, setDepartmentId] = useState('dept-gen');
  const [departmentName, setDepartmentName] = useState('General Medicine Ward');
  const [currentStatus, setCurrentStatus] = useState<PatientStatus>('STABLE');
  const [advisoryRisk, setAdvisoryRisk] = useState<number>(15);
  const [transferReason, setTransferReason] = useState('Patient hemodynamically stable & recovered from acute ICU condition. Stepped down to General Ward.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      // Pre-fill defaults based on whether patient is in ICU
      if (patient.ward.includes('ICU') || patient.departmentId === 'dept-icu') {
        setWard('General Ward B');
        setBed('Bed G-08');
        setDepartmentId('dept-gen');
        setDepartmentName('General Medicine Ward');
        setCurrentStatus('STABLE');
        setAdvisoryRisk(15);
        setTransferReason(`Patient ${patient.name} successfully cured & stabilized. Stepped down from ICU to General Ward for recovery.`);
      } else {
        setWard(patient.ward);
        setBed(patient.bed);
        setDepartmentId(patient.departmentId || 'dept-gen');
        setDepartmentName(patient.departmentName || 'General Medicine Ward');
        setCurrentStatus(patient.currentStatus || 'STABLE');
        setAdvisoryRisk(patient.advisoryRisk || 20);
        setTransferReason('Routine ward transfer & status update.');
      }
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleApplyPreset = (type: 'GENERAL' | 'STEPDOWN' | 'ICU' | 'DISCHARGE') => {
    if (type === 'GENERAL') {
      setWard('General Ward B');
      setBed('Bed G-08');
      setDepartmentId('dept-gen');
      setDepartmentName('General Medicine Ward');
      setCurrentStatus('STABLE');
      setAdvisoryRisk(15);
      setTransferReason('Patient cured & hemodynamically stable. Stepped down from ICU to General Ward B.');
    } else if (type === 'STEPDOWN') {
      setWard('Telemetry Unit');
      setBed('Bed ST-04');
      setDepartmentId('dept-stepdown');
      setDepartmentName('Stepdown Telemetry');
      setCurrentStatus('MONITOR');
      setAdvisoryRisk(35);
      setTransferReason('Transferred to Stepdown Telemetry unit for intermediate vital monitoring.');
    } else if (type === 'ICU') {
      setWard('ICU Unit A');
      setBed('Bed 12');
      setDepartmentId('dept-icu');
      setDepartmentName('Intensive Care Unit');
      setCurrentStatus('CRITICAL');
      setAdvisoryRisk(85);
      setTransferReason('Escalated to ICU due to acute vital instability & emergency observation.');
    } else if (type === 'DISCHARGE') {
      setWard('Discharged Home');
      setBed('N/A');
      setDepartmentId('dept-discharged');
      setDepartmentName('Outpatient Recovery');
      setCurrentStatus('Discharged');
      setAdvisoryRisk(5);
      setTransferReason('Patient fully recovered and cleared for hospital discharge.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmitting(true);
    try {
      const oldWard = patient.ward;
      const oldBed = patient.bed;

      await updatePatient(patient.id, {
        ward,
        bed,
        departmentId,
        departmentName,
        currentStatus,
        status: currentStatus,
        admissionType: ward.includes('ICU') ? 'ICU Admission' : 'Transfer',
        advisoryRisk,
        updatedAt: new Date().toISOString()
      });

      // Record clinical transfer note
      addDoctorRemark({
        patientId: patient.id,
        doctorId: user?.id || 'user-doc-1',
        doctorName: user?.name || 'Dr. Sarah Jenkins',
        remark: `[WARD TRANSFER] Patient transferred from ${oldWard} (${oldBed}) to ${ward} (${bed}). Status: ${currentStatus}. Note: ${transferReason}`,
        type: 'INSTRUCTION'
      });

      toast.success(`🎉 Patient ${patient.name} successfully transferred!`, {
        description: `New Location: ${ward} (${bed}) • Status: ${currentStatus}`
      });

      onClose();
    } catch (err: any) {
      toast.error('Failed to update patient location: ' + (err.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 select-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Patient Ward Transfer & Step-Down</span>
              </h3>
              <p className="text-xs text-slate-300">
                {patient.name} ({patient.hospitalId}) • Current: <span className="text-amber-400 font-bold">{patient.ward} ({patient.bed})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Preset Buttons */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
              Quick Transfer Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('GENERAL')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black flex items-center text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>Step-Down to General</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">Cured / Recovered • Ward B</div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-extrabold group-hover:scale-105 transition-transform">STABLE</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('STEPDOWN')}
                className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 rounded-xl font-bold text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black flex items-center text-sky-800">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-sky-600" />
                    <span>Stepdown Telemetry</span>
                  </div>
                  <div className="text-[10px] text-sky-700 font-medium">Intermediate Care</div>
                </div>
                <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded-md font-extrabold group-hover:scale-105 transition-transform">MONITOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('ICU')}
                className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 rounded-xl font-bold text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black flex items-center text-red-800">
                    <Activity className="w-3.5 h-3.5 mr-1 text-red-600" />
                    <span>Escalate to ICU</span>
                  </div>
                  <div className="text-[10px] text-red-700 font-medium">Intensive Care Unit</div>
                </div>
                <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded-md font-extrabold group-hover:scale-105 transition-transform">CRITICAL</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('DISCHARGE')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 rounded-xl font-bold text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black flex items-center text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    <span>Discharge Home</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">Cleared for discharge</div>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md font-extrabold group-hover:scale-105 transition-transform">CLEARED</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            {/* Target Ward & Bed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Ward Name</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Bed Number</label>
                <input
                  type="text"
                  value={bed}
                  onChange={(e) => setBed(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Department & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    if (e.target.value === 'dept-gen') setDepartmentName('General Medicine Ward');
                    else if (e.target.value === 'dept-icu') setDepartmentName('Intensive Care Unit');
                    else if (e.target.value === 'dept-stepdown') setDepartmentName('Stepdown Telemetry');
                    else if (e.target.value === 'dept-recovery') setDepartmentName('Surgical Recovery');
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="dept-gen">General Medicine Ward</option>
                  <option value="dept-stepdown">Stepdown Telemetry</option>
                  <option value="dept-recovery">Surgical Recovery</option>
                  <option value="dept-icu">Intensive Care Unit (ICU)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Status</label>
                <select
                  value={currentStatus}
                  onChange={(e: any) => {
                    const statusVal = e.target.value;
                    setCurrentStatus(statusVal);
                    if (statusVal === 'STABLE') setAdvisoryRisk(15);
                    else if (statusVal === 'MONITOR') setAdvisoryRisk(35);
                    else if (statusVal === 'HIGH RISK') setAdvisoryRisk(60);
                    else if (statusVal === 'CRITICAL') setAdvisoryRisk(88);
                    else if (statusVal === 'Discharged') setAdvisoryRisk(5);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="STABLE">STABLE (Cured / Recovered)</option>
                  <option value="MONITOR">MONITOR (Observation)</option>
                  <option value="HIGH RISK">HIGH RISK</option>
                  <option value="CRITICAL">CRITICAL (ICU Needed)</option>
                  <option value="Discharged">Discharged Home</option>
                </select>
              </div>
            </div>

            {/* Transfer Reason / Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Transfer & Recovery Note</label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                placeholder="Details about patient recovery, vitals stabilization..."
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating Location...' : 'CONFIRM WARD TRANSFER'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
