import React from 'react';
import type { Patient, LaboratoryResult, DoctorRemark, MedicationRecord, InterventionRecord } from '../../types';
import { useRealtime } from '../../context/RealtimeContext';
import { FileText, FlaskConical, Pill, ShieldCheck, History, UserCheck, Heart, Stethoscope } from 'lucide-react';

interface CentralizedPatientHistoryCardProps {
  patient?: Patient;
  patientId?: string;
  labResults?: LaboratoryResult[];
  doctorRemarks?: DoctorRemark[];
  medications?: MedicationRecord[];
  interventions?: InterventionRecord[];
}

export const CentralizedPatientHistoryCard: React.FC<CentralizedPatientHistoryCardProps> = ({
  patient: propsPatient,
  patientId: propsPatientId,
  labResults: propsLabs,
  doctorRemarks: propsRemarks,
  medications: propsMeds,
  interventions: propsInterventions,
}) => {
  const realtime = useRealtime();

  const targetId = propsPatient?.id || propsPatientId || 'P12345';
  const patient = propsPatient || realtime.getPatientById(targetId);

  const labResults = propsLabs || realtime.labResults;
  const doctorRemarks = propsRemarks || realtime.doctorRemarks;
  const medications = propsMeds || realtime.medications;
  const interventions = propsInterventions || realtime.interventions;

  if (!patient) {
    return (
      <div className="card-clinical p-6 bg-white text-center text-gray-400 text-xs">
        No patient record found for EHR lookup ID: {targetId}
      </div>
    );
  }
  const patientLabs = labResults.filter(
    (l) => l.patientId === patient.id || l.patientId === patient.hospitalId || (patient.id === 'P12345' && l.patientId === 'P12345')
  );

  const patientRemarks = doctorRemarks.filter(
    (r) => r.patientId === patient.id || r.patientId === patient.hospitalId
  );

  const patientMeds = medications.filter(
    (m) => m.patientId === patient.id || m.patientId === patient.hospitalId
  );

  const patientInterventions = interventions.filter(
    (i) => i.patientId === patient.id || i.patientId === patient.hospitalId
  );

  return (
    <div className="space-y-6 select-none">
      {/* Centralized EMR Master Identity Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>CENTRALIZED EHR PERMANENT MEDICAL PASSPORT</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center space-x-3">
            <span>{patient.name}</span>
            <span className="text-sm font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40 px-3 py-1 rounded-xl">
              {patient.hospitalId}
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Universal Hospital Master Key • Permanent lifetime medical history preserved across all admissions
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-slate-400">Blood Group: </span>
            <strong className="text-red-400 font-black">{patient.bloodGroup || 'O+'}</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-slate-400">Current Ward: </span>
            <strong className="text-teal-300 font-bold">{patient.ward} ({patient.bed})</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-slate-400">Attending Doctor: </span>
            <strong className="text-white font-bold">{patient.attendingDoctorName}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Demographics & Medical History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lifetime Clinical Profile */}
        <div className="space-y-6">
          <div className="card-clinical p-5 bg-white space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
              <UserCheck className="w-4 h-4 mr-2 text-teal-700" />
              Permanent Patient Demographics
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Hospital Master ID</span>
                <span className="font-mono font-bold text-slate-900">{patient.hospitalId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{patient.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Age & Gender</span>
                <span className="font-bold text-slate-900">{patient.age} yrs ({patient.gender})</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800">{patient.dateOfBirth}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Phone Number</span>
                <span className="font-semibold text-slate-800">{patient.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Emergency Contact</span>
                <span className="font-bold text-red-700">{patient.emergencyContact}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-500 font-medium">Residential Address</span>
                <span className="font-semibold text-slate-800">{patient.address}</span>
              </div>
            </div>
          </div>

          <div className="card-clinical p-5 bg-white space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
              <Heart className="w-4 h-4 mr-2 text-red-600" />
              Allergies & Pre-Existing Conditions
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Documented Allergies</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((a) => (
                      <span key={a} className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-lg text-[10px]">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No known drug allergies</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Chronic Existing Conditions</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.existingConditions && patient.existingConditions.length > 0 ? (
                    patient.existingConditions.map((c) => (
                      <span key={c} className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No chronic conditions recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Longitudinal Clinical Care & Laboratory History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline of Admissions & Ward Transfers */}
          <div className="card-clinical p-5 bg-white space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2 justify-between">
              <span className="flex items-center">
                <History className="w-4 h-4 mr-2 text-teal-700" />
                Longitudinal Visit & Ward Transfer Timeline
              </span>
              <span className="text-[10px] font-mono text-gray-400">Lifetime Ledger</span>
            </h3>

            <div className="relative border-l-2 border-teal-200 ml-3 pl-5 space-y-5 text-xs">
              {/* Current Active Location */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>Current Hospital Location: {patient.ward} ({patient.bed})</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {patient.currentStatus}
                  </span>
                </div>
                <div className="text-gray-500 font-medium text-[11px] mt-0.5">
                  Department: <strong>{patient.departmentName}</strong> • Attending: <strong>{patient.attendingDoctorName}</strong>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Admission Type: {patient.admissionType} • Initial Complaint: {patient.primaryComplaint}
                </div>
              </div>

              {/* Past Visits / Historical Records */}
              <div className="relative pt-2">
                <div className="absolute -left-[27px] top-3 w-3.5 h-3.5 rounded-full bg-slate-400 ring-4 ring-slate-100" />
                <div className="font-bold text-slate-800 text-xs">Initial Admission Registered</div>
                <div className="text-gray-500 font-medium text-[11px]">
                  Date: {new Date(patient.admissionDate).toLocaleDateString([], { dateStyle: 'medium' })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Patient record created under Universal ID <strong className="font-mono text-slate-700">{patient.hospitalId}</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Historical Serial Laboratory Investigation Records */}
          <div className="card-clinical p-5 bg-white space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center">
                <FlaskConical className="w-4 h-4 mr-2 text-teal-700" />
                Permanent Laboratory Investigation History ({patientLabs.length} Reports)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">LIS Time-Series</span>
            </div>

            {patientLabs.length === 0 ? (
              <p className="text-xs text-gray-400 italic p-4 text-center">No laboratory reports recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[9px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-2">Test Parameter</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Result Value</th>
                      <th className="p-2">Reference Range</th>
                      <th className="p-2">Resulted Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {patientLabs.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{lab.testName}</td>
                        <td className="p-2 text-gray-500">{lab.category}</td>
                        <td className="p-2 font-black text-teal-800">{lab.value} {lab.unit}</td>
                        <td className="p-2 text-gray-500">{lab.referenceLow} - {lab.referenceHigh}</td>
                        <td className="p-2 text-gray-400 text-[10px]">
                          {new Date(lab.resultedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical Doctor Notes & Care Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-clinical p-4 bg-white space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
                <FileText className="w-4 h-4 mr-1.5 text-teal-700" />
                Doctor Remarks ({patientRemarks.length})
              </h3>
              {patientRemarks.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No notes recorded.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {patientRemarks.map((r) => (
                    <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-900">{r.remark}</div>
                      <div className="text-[10px] text-gray-400 flex justify-between">
                        <span>{r.doctorName}</span>
                        <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-clinical p-4 bg-white space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
                <Pill className="w-4 h-4 mr-1.5 text-slate-700" />
                Medication History ({patientMeds.length})
              </h3>
              {patientMeds.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No active medications.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {patientMeds.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{m.medicationName}</div>
                        <div className="text-[10px] text-gray-500">{m.dosage} • {m.frequency}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Care Actions History */}
          {patientInterventions.length > 0 && (
            <div className="card-clinical p-4 bg-white space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
                <Stethoscope className="w-4 h-4 mr-1.5 text-emerald-700" />
                Care Actions Recorded ({patientInterventions.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {patientInterventions.map((i) => (
                  <div key={i.id} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                    <div className="font-bold text-slate-900">{i.action}</div>
                    <div className="text-[10px] text-gray-500">Outcome: {i.outcome} • Performed by: {i.performedBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
