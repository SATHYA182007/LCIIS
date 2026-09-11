import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { generateNextPatientId } from '../../services/firebaseService';
import { UserPlus, CheckCircle2, ChevronLeft, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Patient } from '../../types';

export const RegisterPatientPage: React.FC = () => {
  const { addPatient, updateLiveVitals } = useRealtime();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [patientId, setPatientId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('1980-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [email, setEmail] = useState<string>('');
  const [ward, setWard] = useState<string>('General Ward A');
  const [bed, setBed] = useState<string>('Bed 01');
  const [attendingDoctorName, setAttendingDoctorName] = useState<string>('Dr. Sarah Jenkins');
  const [customDoctorName, setCustomDoctorName] = useState<string>('');
  const [admissionType, setAdmissionType] = useState<Patient['admissionType']>('Outpatient Registration');
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [emergencyNotes, setEmergencyNotes] = useState<string>('');

  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);

  const calculateAgeFromDOB = (dobString: string): string => {
    if (!dobString) return '';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '';
    const today = new Date();
    let computedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      computedAge--;
    }
    return computedAge >= 0 ? String(computedAge) : '';
  };

  const handleDobChange = (newDob: string) => {
    setDateOfBirth(newDob);
    const computed = calculateAgeFromDOB(newDob);
    if (computed !== '') {
      setAge(computed);
    }
  };

  const wardOptions = [
    'General Ward A',
    'General Ward B',
    'ICU Unit A',
    'ICU Unit B',
    'Emergency Ward 1',
    'Emergency Ward 2',
    'Cardiology Ward',
    'Surgical Ward',
    'Neurology Unit',
    'Pediatric Care',
    'High Dependency Unit (HDU)',
    'Outpatient Intake'
  ];

  const bedOptions = [
    'Bed 01', 'Bed 02', 'Bed 03', 'Bed 04', 'Bed 05',
    'Bed 06', 'Bed 07', 'Bed 08', 'Bed 09', 'Bed 10',
    'Bed 11', 'Bed 12', 'Bed 14', 'Bed 15', 'Bed 20'
  ];

  const doctorOptions = [
    { id: 'user-doc-1', name: 'Dr. Sarah Jenkins', specialty: 'ICU & Internal Medicine' },
    { id: 'user-doc-2', name: 'Dr. Marcus Vance', specialty: 'General & Emergency' },
    { id: 'doc-003', name: 'Dr. Emily Carter', specialty: 'Cardiology Specialist' },
    { id: 'doc-004', name: 'Dr. Robert Chen', specialty: 'Emergency Specialist' },
    { id: 'doc-005', name: 'Dr. Alexander Wright', specialty: 'Neurology Specialist' },
    { id: 'doc-006', name: 'Dr. Priya Sharma', specialty: 'Pediatric Specialist' },
    { id: 'OTHER', name: '+ Enter Custom Doctor Name...', specialty: 'Custom Entry' }
  ];

  // Generate unique sequential Patient ID on load and calculate initial age
  useEffect(() => {
    const fetchNextId = async () => {
      setIsGeneratingId(true);
      const nextId = await generateNextPatientId();
      setPatientId(nextId);
      setIsGeneratingId(false);
    };
    fetchNextId();
    if (dateOfBirth && !age) {
      setAge(calculateAgeFromDOB(dateOfBirth));
    }
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter the patient\'s full name.');
      return;
    }
    if (!age || Number(age) <= 0) {
      toast.error('Please enter a valid patient age.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter a valid contact phone number.');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter the residential address.');
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      toast.error('Please provide complete emergency contact details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const emergencyContactStr = `${emergencyContactName.trim()} (${emergencyContactPhone.trim()})`;
      const conditionsList = medicalConditions.trim() ? medicalConditions.split(',').map((s) => s.trim()) : [];
      const allergiesList = allergies.trim() ? allergies.split(',').map((s) => s.trim()) : ['No Known Allergies'];

      const finalDoctorName = attendingDoctorName === 'OTHER'
        ? (customDoctorName.trim() || 'Attending Physician')
        : attendingDoctorName;

      const doctorIdMap: Record<string, string> = {
        'Dr. Sarah Jenkins': 'user-doc-1',
        'Dr. Marcus Vance': 'user-doc-2',
        'Dr. Emily Carter': 'doc-003',
        'Dr. Robert Chen': 'doc-004',
        'Dr. Alexander Wright': 'doc-005',
        'Dr. Priya Sharma': 'doc-006',
      };
      const finalDoctorId = doctorIdMap[finalDoctorName] || `doc-${Date.now()}`;

      const deptName = ward.includes('ICU')
        ? 'Intensive Care Unit'
        : ward.includes('ER') || ward.includes('Emergency')
        ? 'Emergency Department'
        : ward.includes('Cardiology')
        ? 'Cardiology Department'
        : 'General Admissions';

      const newPatientPayload: Partial<Patient> = {
        id: patientId,
        hospitalId: patientId,
        name: fullName.trim(),
        dateOfBirth,
        age: Number(age),
        gender,
        phone: phone.trim(),
        address: address.trim(),
        emergencyContact: emergencyContactStr,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        bloodGroup,
        email: email.trim() || undefined,
        admissionDate: new Date().toISOString().split('T')[0],
        departmentId: 'dept-general',
        departmentName: deptName,
        ward,
        bed,
        attendingDoctorId: finalDoctorId,
        attendingDoctorName: finalDoctorName,
        admissionType,
        primaryComplaint: emergencyNotes.trim() || 'Initial Hospital Registration',
        allergies: allergiesList,
        existingConditions: conditionsList,
        emergencyNotes: emergencyNotes.trim() || undefined,
        currentStatus: 'Registered',
        status: 'Registered',
        advisoryRisk: 15,
        registeredBy: user?.name || 'Receptionist',
        registeredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedPatient = await addPatient(newPatientPayload);

      // Initialize default baseline vitals under liveVitals/{patientId}
      await updateLiveVitals(patientId, {
        heartRate: 80,
        spo2: 98,
        temperature: 36.8,
        respiratoryRate: 16,
        systolicBP: 120,
        diastolicBP: 80,
        timestamp: Date.now()
      });

      setCreatedPatient(savedPatient);
      toast.success(`Patient registered successfully! Generated ID: ${patientId}`, {
        description: `Assigned to ${ward} (${bed}) under ${finalDoctorName}.`
      });
    } catch (err: any) {
      toast.error('Registration failed: ' + (err.message || 'Firebase error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patient Registration" />

        <main className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/receptionist/dashboard')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-teal-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-teal-700" />
              <span>Back to Dashboard</span>
            </button>

            <span className="text-xs text-gray-500 font-semibold">Firebase Realtime Sync Active</span>
          </div>

          {/* Success Dialog Modal */}
          {createdPatient && (
            <div className="card-clinical p-6 bg-emerald-50 border border-emerald-200 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-emerald-950 flex items-center space-x-2">
                    <span>Patient Registered Successfully</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-mono font-bold">
                      {createdPatient.hospitalId}
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Patient <strong>{createdPatient.name}</strong> ({createdPatient.age} yrs, {createdPatient.gender}) has been assigned to <strong>{createdPatient.ward}</strong> ({createdPatient.bed}) under <strong>{createdPatient.attendingDoctorName}</strong> and broadcasted via real-time WebSocket to the Doctor and Nurse portals.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setCreatedPatient(null);
                    setFullName('');
                    setPhone('');
                    setAddress('');
                    setEmergencyContactName('');
                    setEmergencyContactPhone('');
                    setMedicalConditions('');
                    setAllergies('');
                    setEmergencyNotes('');
                    generateNextPatientId().then(setPatientId);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Another Patient</span>
                </button>

                <button
                  onClick={() => navigate('/receptionist/patients')}
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-all"
                >
                  View Patients Directory
                </button>
              </div>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="card-clinical p-6 bg-white space-y-6">
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-teal-700" />
                  REGISTER NEW PATIENT
                </h2>
                <p className="text-xs text-gray-500">
                  Initial patient intake & central hospital ID assignment
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                <span className="text-xs font-bold text-teal-900">Patient ID:</span>
                <span className="font-mono font-black text-teal-800 text-xs tracking-wider">
                  {isGeneratingId ? 'Generating...' : patientId}
                </span>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                  1. Basic Patient Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Auto-calculated from DOB (e.g. 46)"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Address */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider">
                  2. Contact & Emergency Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Sector 4"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. John Vance"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2835"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Admission & Doctor Assignment */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Admission, Ward & Doctor Assignment</span>
                  <span className="text-[11px] text-teal-700 font-semibold normal-case bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    Selectable Toggles & Doctor Assignment
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Ward */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Ward <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden mb-2"
                    >
                      {wardOptions.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>

                    {/* Ward Quick Toggle Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {['General Ward A', 'ICU Unit A', 'Emergency Ward 1', 'Cardiology Ward'].map((w) => (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setWard(w)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            ward === w
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Bed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Bed <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bed}
                      onChange={(e) => setBed(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden mb-2"
                    >
                      {bedOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Bed Quick Toggle Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {['Bed 01', 'Bed 02', 'Bed 03', 'Bed 04', 'Bed 05', 'Bed 06'].map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBed(b)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            bed === b
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Doctor */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Assigned Attending Doctor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={attendingDoctorName}
                      onChange={(e) => setAttendingDoctorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      {doctorOptions.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} — {doc.specialty}
                        </option>
                      ))}
                    </select>

                    {/* Doctor Quick Selection Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doctorOptions.slice(0, 4).map((doc) => (
                        <button
                          type="button"
                          key={doc.id}
                          onClick={() => setAttendingDoctorName(doc.name)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            attendingDoctorName === doc.name
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>

                    {/* Custom Doctor Name Input if 'OTHER' selected */}
                    {attendingDoctorName === '+ Enter Custom Doctor Name...' && (
                      <div className="pt-2">
                        <input
                          type="text"
                          value={customDoctorName}
                          onChange={(e) => setCustomDoctorName(e.target.value)}
                          placeholder="Type custom attending doctor name (e.g. Dr. Jonathan Reed)"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-teal-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Admission Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admission Type</label>
                    <select
                      value={admissionType}
                      onChange={(e) => setAdmissionType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="Outpatient Registration">Outpatient Registration</option>
                      <option value="Emergency">Emergency Intake</option>
                      <option value="ICU Admission">ICU Admission</option>
                      <option value="Elective">Elective Admission</option>
                      <option value="Transfer">Ward Transfer</option>
                    </select>
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Existing Medical Conditions</label>
                    <input
                      type="text"
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      placeholder="e.g. Hypertension, Type 2 Diabetes"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Allergies */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Sulfa, Latex"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Emergency Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency & Triage Notes</label>
                    <textarea
                      rows={2}
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      placeholder="e.g. Patient admitted with mild dyspnea. Initial triage completed at intake desk."
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Form Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isGeneratingId}
                className="w-full bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering Patient in Firebase...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>REGISTER PATIENT</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
