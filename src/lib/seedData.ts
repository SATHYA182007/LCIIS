import type { 
  Patient, 
  LaboratoryResult, 
  LiveVitals, 
  Alert, 
  InventoryItem, 
  DeviceRecord, 
  AuditLog, 
  DoctorRemark, 
  MedicationRecord, 
  InterventionRecord,
  UserProfile
} from '../types';


export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-doc-1',
    email: 'doctor@hospital.demo',
    name: 'Dr. Sarah Jenkins',
    role: 'doctor',
    department: 'Intensive Care Unit (ICU)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-nurse-1',
    email: 'nurse@hospital.demo',
    name: 'Nurse Michael Chen, RN',
    role: 'nurse',
    department: 'Intensive Care Unit (ICU)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-lab-1',
    email: 'lab@hospital.demo',
    name: 'Robert Vance, MLS',
    role: 'laboratory',
    department: 'Clinical Biochemistry & Hematology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-1',
    email: 'admin@hospital.demo',
    name: 'System Admin (GreenMinds)',
    role: 'admin',
    department: 'Hospital Informatics',
    createdAt: new Date().toISOString(),
  },
];

// Highlighted Demo Patient P12345 (Alias: LCIIS-P-000001)
export const INITIAL_DEMO_PATIENT: Patient = {
  id: 'P12345',
  hospitalId: 'LCIIS-P-000001',
  name: 'Eleanor Vance',
  dateOfBirth: '1964-05-14',
  age: 62,
  gender: 'Female',
  phone: '+1 (555) 019-2834',
  emergencyContact: 'David Vance (Son) - +1 (555) 019-8821',
  bloodGroup: 'A+',
  address: '742 Evergreen Terrace, Ward 4',
  admissionDate: '2026-09-08T08:00:00Z',
  departmentId: 'dept-icu',
  departmentName: 'Intensive Care Unit',
  ward: 'ICU Unit A',
  bed: 'Bed 12',
  attendingDoctorId: 'user-doc-1',
  attendingDoctorName: 'Dr. Sarah Jenkins',
  admissionType: 'ICU Admission',
  primaryComplaint: 'Acute dyspnea, fever, and post-surgical oliguria',
  allergies: ['Penicillin', 'Sulfa Drugs'],
  existingConditions: ['Type 2 Diabetes', 'Hypertension', 'CKD Stage II'],
  currentStatus: 'HIGH RISK',
  advisoryRisk: 74,
  deviceId: 'ESP32-ICU-001',
  createdAt: '2026-09-08T08:00:00Z',
  updatedAt: new Date().toISOString(),
};

// Seed Lab History for Demo Patient P12345 (Section 100 Prompt specs)
export const INITIAL_LAB_RESULTS: LaboratoryResult[] = [
  {
    id: 'lab-p12345-1',
    patientId: 'P12345',
    testName: 'Creatinine',
    category: 'Biochemistry',
    value: 0.9,
    unit: 'mg/dL',
    referenceLow: 0.6,
    referenceHigh: 1.2,
    sampleCollectedAt: '2026-09-09T08:00:00Z',
    resultedAt: '2026-09-09T08:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    notes: 'Normal baseline reading.',
    createdAt: '2026-09-09T08:30:00Z',
  },
  {
    id: 'lab-p12345-2',
    patientId: 'P12345',
    testName: 'CRP (C-Reactive Protein)',
    category: 'Inflammatory',
    value: 8,
    unit: 'mg/L',
    referenceLow: 0,
    referenceHigh: 10,
    sampleCollectedAt: '2026-09-09T08:00:00Z',
    resultedAt: '2026-09-09T08:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T08:30:00Z',
  },
  {
    id: 'lab-p12345-3',
    patientId: 'P12345',
    testName: 'Creatinine',
    category: 'Biochemistry',
    value: 1.0,
    unit: 'mg/dL',
    referenceLow: 0.6,
    referenceHigh: 1.2,
    sampleCollectedAt: '2026-09-09T12:00:00Z',
    resultedAt: '2026-09-09T12:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T12:30:00Z',
  },
  {
    id: 'lab-p12345-4',
    patientId: 'P12345',
    testName: 'CRP (C-Reactive Protein)',
    category: 'Inflammatory',
    value: 12,
    unit: 'mg/L',
    referenceLow: 0,
    referenceHigh: 10,
    sampleCollectedAt: '2026-09-09T12:00:00Z',
    resultedAt: '2026-09-09T12:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T12:30:00Z',
  },
  {
    id: 'lab-p12345-5',
    patientId: 'P12345',
    testName: 'Creatinine',
    category: 'Biochemistry',
    value: 1.1,
    unit: 'mg/dL',
    referenceLow: 0.6,
    referenceHigh: 1.2,
    sampleCollectedAt: '2026-09-09T16:00:00Z',
    resultedAt: '2026-09-09T16:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T16:30:00Z',
  },
  {
    id: 'lab-p12345-6',
    patientId: 'P12345',
    testName: 'CRP (C-Reactive Protein)',
    category: 'Inflammatory',
    value: 18,
    unit: 'mg/L',
    referenceLow: 0,
    referenceHigh: 10,
    sampleCollectedAt: '2026-09-09T16:00:00Z',
    resultedAt: '2026-09-09T16:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T16:30:00Z',
  },
  {
    id: 'lab-p12345-7',
    patientId: 'P12345',
    testName: 'Creatinine',
    category: 'Biochemistry',
    value: 1.2,
    unit: 'mg/dL',
    referenceLow: 0.6,
    referenceHigh: 1.2,
    sampleCollectedAt: '2026-09-09T20:00:00Z',
    resultedAt: '2026-09-09T20:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T20:30:00Z',
  },
  {
    id: 'lab-p12345-8',
    patientId: 'P12345',
    testName: 'CRP (C-Reactive Protein)',
    category: 'Inflammatory',
    value: 25,
    unit: 'mg/L',
    referenceLow: 0,
    referenceHigh: 10,
    sampleCollectedAt: '2026-09-09T20:00:00Z',
    resultedAt: '2026-09-09T20:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-09-09T20:30:00Z',
  },
  {
    id: 'lab-p12345-9',
    patientId: 'P12345',
    testName: 'Creatinine',
    category: 'Biochemistry',
    value: 1.3,
    unit: 'mg/dL',
    referenceLow: 0.6,
    referenceHigh: 1.2,
    sampleCollectedAt: '2026-09-10T00:00:00Z',
    resultedAt: '2026-09-10T00:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    notes: 'Progressive upward trend detected across 5 observations.',
    createdAt: '2026-09-10T00:30:00Z',
  },
  {
    id: 'lab-p12345-10',
    patientId: 'P12345',
    testName: 'CRP (C-Reactive Protein)',
    category: 'Inflammatory',
    value: 31,
    unit: 'mg/L',
    referenceLow: 0,
    referenceHigh: 10,
    sampleCollectedAt: '2026-09-10T00:00:00Z',
    resultedAt: '2026-09-10T00:30:00Z',
    technicianId: 'user-lab-1',
    technicianName: 'Robert Vance, MLS',
    source: 'LIS_AUTOMATED',
    verificationStatus: 'VERIFIED',
    notes: 'Persistent elevated inflammatory trajectory.',
    createdAt: '2026-09-10T00:30:00Z',
  },
];

// Initial Live Vitals for P12345
export const INITIAL_LIVE_VITALS: LiveVitals = {
  heartRate: { value: 112, unit: 'BPM', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
  spo2: { value: 92, unit: '%', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
  bloodPressure: {
    systolic: { value: 138, unit: 'mmHg', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
    diastolic: { value: 84, unit: 'mmHg', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
  },
  respiratoryRate: { value: 24, unit: '/min', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
  temperature: { value: 38.2, unit: '°C', timestamp: new Date().toISOString(), source: 'LIVE_SENSOR', deviceId: 'ESP32-ICU-001', quality: 'GOOD' },
  urineOutput: { value: 25, unit: 'mL/hr', timestamp: new Date().toISOString(), source: 'MANUAL_ENTRY', quality: 'GOOD' },
  lastUpdated: new Date().toISOString(),
};

// Generate 50 Synthetic Patients across 7 Hospital Departments
export const generateSyntheticPatients = (): Patient[] => {
  const departments = [
    { id: 'dept-icu', name: 'Intensive Care Unit (ICU)', prefix: 'ICU' },
    { id: 'dept-er', name: 'Emergency Department', prefix: 'ER' },
    { id: 'dept-cardio', name: 'Cardiology Ward', prefix: 'CARD' },
    { id: 'dept-gen', name: 'General Medicine', prefix: 'GEN' },
    { id: 'dept-surg', name: 'Surgical Suite & Ward', prefix: 'SURG' },
    { id: 'dept-neuro', name: 'Neurology Unit', prefix: 'NEURO' },
    { id: 'dept-peds', name: 'Pediatric Care', prefix: 'PEDS' },
  ];

  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  const complaints = [
    'Acute shortness of breath and chest pressure',
    'Post-operative monitoring following abdominal repair',
    'Severe hypotension and altered mental status',
    'Progressive oliguria and rising inflammatory markers',
    'Hypertensive crisis with persistent headache',
    'Fever of unknown origin with tachycardic spells',
    'Acute ischemic stroke observation protocol',
    'Severe asthma exacerbation requiring high-flow oxygen',
  ];

  const patients: Patient[] = [INITIAL_DEMO_PATIENT];

  for (let i = 2; i <= 52; i++) {
    const dept = departments[i % departments.length];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const age = 18 + ((i * 7) % 70);
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const bedNum = ((i % 15) + 1).toString().padStart(2, '0');
    
    let status: Patient['currentStatus'] = 'STABLE';
    let risk = 15 + ((i * 11) % 25);

    if (i % 7 === 0) {
      status = 'CRITICAL';
      risk = 78 + (i % 18);
    } else if (i % 4 === 0) {
      status = 'HIGH RISK';
      risk = 58 + (i % 16);
    } else if (i % 3 === 0) {
      status = 'MONITOR';
      risk = 32 + (i % 18);
    }

    const patientId = `LCIIS-P-${i.toString().padStart(6, '0')}`;
    
    patients.push({
      id: patientId,
      hospitalId: patientId,
      name: `${firstName} ${lastName}`,
      dateOfBirth: `${1950 + (i % 50)}-0${(i % 9) + 1}-15`,
      age,
      gender,
      phone: `+1 (555) ${100 + i}-${2000 + i}`,
      emergencyContact: `Family Contact - +1 (555) 999-${3000 + i}`,
      bloodGroup: ['A+', 'O+', 'B+', 'AB+', 'O-'][(i % 5)],
      address: `${100 + i} Medical Park Ave, City Hospital Zone`,
      admissionDate: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
      departmentId: dept.id,
      departmentName: dept.name,
      ward: `${dept.prefix} Unit ${((i % 3) + 1)}`,
      bed: `Bed ${bedNum}`,
      attendingDoctorId: i % 2 === 0 ? 'user-doc-1' : 'user-doc-2',
      attendingDoctorName: i % 2 === 0 ? 'Dr. Sarah Jenkins' : 'Dr. Marcus Vance',
      admissionType: i % 5 === 0 ? 'Emergency' : 'ICU Admission',
      primaryComplaint: complaints[i % complaints.length],
      allergies: i % 3 === 0 ? ['Latex'] : ['No Known Allergies'],
      existingConditions: ['Hypertension', 'Hyperlipidemia'],
      currentStatus: status,
      advisoryRisk: risk,
      deviceId: i % 2 === 0 ? `ESP32-${dept.prefix}-${bedNum}` : undefined,
      createdAt: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return patients;
};

// Seed Active Alerts
export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-p12345-01',
    patientId: 'P12345',
    patientName: 'Eleanor Vance',
    ward: 'ICU Unit A',
    bed: 'Bed 12',
    type: 'MULTI-PARAMETER CHANGE',
    priority: 'HIGH',
    status: 'NEW',
    summary: 'Concerning longitudinal trend: Concurrent elevation of Creatinine & CRP with declining SpO2.',
    concerns: [
      'Creatinine: Progressive upward trajectory (0.9 → 1.3 mg/dL)',
      'CRP: Persistent inflammatory escalation (8 → 31 mg/L)',
      'SpO2: Consecutive decrease (98% → 92%)',
      'Heart Rate: Sustained tachycardia (82 → 112 BPM)',
      'Respiratory Rate: Tachypnea (16 → 24 /min)'
    ],
    advisoryRisk: 74,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'alert-icu-02',
    patientId: 'LCIIS-P-000007',
    patientName: 'William Miller',
    ward: 'ICU Unit A',
    bed: 'Bed 07',
    type: 'RAPID DETERIORATION',
    priority: 'CRITICAL',
    status: 'NEW',
    summary: 'Sudden drop in oxygen saturation below clinical threshold.',
    concerns: [
      'SpO2: Acute decline (95% → 86%)',
      'Heart Rate: Acute compensatory spike (92 → 134 BPM)'
    ],
    advisoryRisk: 88,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'alert-er-03',
    patientId: 'LCIIS-P-000004',
    patientName: 'Patricia Johnson',
    ward: 'ER Ward 1',
    bed: 'Bed 04',
    type: 'LABORATORY TREND',
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    summary: 'WBC trajectory escalating over 12 hours.',
    concerns: ['WBC: 11.2 → 17.8 x10^3/uL'],
    advisoryRisk: 62,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledgedBy: 'Dr. Sarah Jenkins',
    acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  }
];

// Seed Inventory Items & Expiry Monitoring Data
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Amoxicillin & Clavulanate Potassium 625mg',
    code: 'MED-AMX-625',
    category: 'Medicines',
    batchNumber: 'AMX-2026-04',
    supplier: 'BioPharma Health',
    quantityReceived: 500,
    currentQuantity: 180,
    unit: 'Tablets',
    mfgDate: '2025-04-10',
    expiryDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0], // 28 days -> Urgent Expiry
    receivedDate: '2025-05-01',
    storageLocation: 'Pharmacy Drawer B-04',
    minimumStockLevel: 200,
    unitCost: 1.85,
    status: 'EXPIRING SOON',
    notes: 'Primary broad-spectrum antibiotic stock.',
  },
  {
    id: 'inv-002',
    name: 'Normal Saline IV 0.9% 500ml',
    code: 'IV-NS-500',
    category: 'IV Supplies',
    batchNumber: 'NS-88392-A',
    supplier: 'Baxter Healthcare',
    quantityReceived: 1000,
    currentQuantity: 85, // Low stock < min 150
    unit: 'Bags',
    mfgDate: '2025-01-15',
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    receivedDate: '2025-02-01',
    storageLocation: 'Main Storage Shelf C1',
    minimumStockLevel: 150,
    unitCost: 4.20,
    status: 'LOW STOCK',
    notes: 'Emergency reorder initiated.',
  },
  {
    id: 'inv-003',
    name: 'N95 Respirator Masks (Sterile)',
    code: 'PPE-N95-ST',
    category: 'PPE',
    batchNumber: 'PPE-9941',
    supplier: '3M Medical Supplies',
    quantityReceived: 2000,
    currentQuantity: 1450,
    unit: 'Pieces',
    mfgDate: '2025-06-01',
    expiryDate: new Date(Date.now() + 500 * 86400000).toISOString().split('T')[0],
    receivedDate: '2025-06-15',
    storageLocation: 'PPE Central Locker',
    minimumStockLevel: 300,
    unitCost: 1.15,
    status: 'SAFE',
  },
  {
    id: 'inv-004',
    name: 'Heparin Sodium Injection 5000 IU/ml',
    code: 'MED-HEP-5000',
    category: 'Medicines',
    batchNumber: 'HEP-2025-09',
    supplier: 'Pfizer Injectables',
    quantityReceived: 300,
    currentQuantity: 40,
    unit: 'Vials',
    mfgDate: '2024-09-01',
    expiryDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // Expired!
    receivedDate: '2024-10-01',
    storageLocation: 'Cold Storage Safe R-2',
    minimumStockLevel: 50,
    unitCost: 12.50,
    status: 'EXPIRED',
    notes: 'Quarantined for disposal.',
  },
  {
    id: 'inv-005',
    name: 'Sterile Luer-Lock Syringes 10ml',
    code: 'SYR-10ML-LL',
    category: 'Syringes',
    batchNumber: 'SYR-2026-X1',
    supplier: 'BD Medical',
    quantityReceived: 3000,
    currentQuantity: 2100,
    unit: 'Units',
    mfgDate: '2025-08-01',
    expiryDate: new Date(Date.now() + 400 * 86400000).toISOString().split('T')[0],
    receivedDate: '2025-08-20',
    storageLocation: 'Supply Rack A-12',
    minimumStockLevel: 500,
    unitCost: 0.35,
    status: 'SAFE',
  }
];

// Seed Physical Devices
export const INITIAL_DEVICES: DeviceRecord[] = [
  {
    id: 'dev-001',
    name: 'ICU Bedside Sensor Hub 01',
    type: 'BEDSIDE_MONITOR',
    esp32Id: 'ESP32-ICU-001',
    macAddress: '24:0A:C4:00:11:A2',
    patientId: 'P12345',
    patientName: 'Eleanor Vance',
    bedId: 'ICU Bed 12',
    departmentId: 'dept-icu',
    firmwareVersion: 'v2.4.1-LCIIS',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    batteryLevel: 98,
    sensorStatus: 'All Sensors Calibrated (ECG, SpO2, Temp, NIBP)',
  },
  {
    id: 'dev-002',
    name: 'Clinical Pocket Alert Dongle #01',
    type: 'POCKET_ALERT_DEVICE',
    esp32Id: 'ESP32-POCKET-01',
    macAddress: '24:0A:C4:88:99:FF',
    patientId: 'P12345',
    patientName: 'Eleanor Vance',
    bedId: 'ICU Bed 12',
    departmentId: 'dept-icu',
    firmwareVersion: 'v1.1.0-OLED',
    connectionStatus: 'ONLINE',
    lastSeen: new Date().toISOString(),
    batteryLevel: 85,
    sensorStatus: 'Display OLED Active, Buzzer Armed',
  },
  {
    id: 'dev-003',
    name: 'Cardiology Bedside Node 04',
    type: 'BEDSIDE_MONITOR',
    esp32Id: 'ESP32-CARD-004',
    macAddress: '24:0A:C4:44:55:66',
    patientId: 'LCIIS-P-000008',
    patientName: 'Sarah Taylor',
    bedId: 'Cardiology Bed 04',
    departmentId: 'dept-cardio',
    firmwareVersion: 'v2.4.0-LCIIS',
    connectionStatus: 'OFFLINE',
    lastSeen: new Date(Date.now() - 45 * 60000).toISOString(),
    batteryLevel: 12,
    sensorStatus: 'Telemetry disconnected — timeout 45 mins',
  }
];

// Seed Remarks & Interventions for P12345
export const INITIAL_REMARKS: DoctorRemark[] = [
  {
    id: 'rem-1',
    patientId: 'P12345',
    doctorId: 'user-doc-1',
    doctorName: 'Dr. Sarah Jenkins',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    remark: 'Noted upward creatinine trend (0.9 → 1.3 mg/dL) combined with elevated CRP. Ordered STAT urine electrolytes and nephrology consultation.',
    type: 'INSTRUCTION',
  }
];

export const INITIAL_MEDICATIONS: MedicationRecord[] = [
  {
    id: 'med-1',
    patientId: 'P12345',
    prescribedBy: 'Dr. Sarah Jenkins',
    medicationName: 'IV Furosemide',
    dosage: '20 mg',
    frequency: 'Q12H',
    startDate: new Date(Date.now() - 24 * 3600000).toISOString().split('T')[0],
    status: 'ACTIVE',
  },
  {
    id: 'med-2',
    patientId: 'P12345',
    prescribedBy: 'Dr. Sarah Jenkins',
    medicationName: 'Piperacillin-Tazobactam IV',
    dosage: '4.5 g',
    frequency: 'Q6H',
    startDate: new Date(Date.now() - 12 * 3600000).toISOString().split('T')[0],
    status: 'ACTIVE',
  }
];

export const INITIAL_INTERVENTIONS: InterventionRecord[] = [
  {
    id: 'int-1',
    patientId: 'P12345',
    performedBy: 'Nurse Michael Chen, RN',
    action: 'Supplemental High-Flow Nasal Cannula (HFNC) oxygen therapy initiated at 4L/min.',
    outcome: 'SpO2 stabilized from 90% back to 92-93%.',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
  }
];

// Initial Audit Log entries
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    userId: 'user-lab-1',
    userName: 'Robert Vance, MLS',
    role: 'laboratory',
    action: 'LAB_RESULT_ENTRY',
    resource: 'laboratoryResults',
    patientId: 'P12345',
    newValue: 'Creatinine: 1.3 mg/dL, CRP: 31 mg/L',
    details: 'Verified and saved laboratory results for patient P12345.',
  },
  {
    id: 'audit-002',
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    userId: 'system-engine',
    userName: 'LCIIS Intelligence Core',
    role: 'admin',
    action: 'RISK_ESCALATION',
    resource: 'riskAssessments',
    patientId: 'P12345',
    previousValue: 'MONITOR (42%)',
    newValue: 'HIGH RISK (74%)',
    details: 'Automated Risk Engine identified concurrent laboratory & physiological deterioration.',
  },
  {
    id: 'audit-003',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    userId: 'system-engine',
    userName: 'LCIIS Alert Dispatcher',
    role: 'admin',
    action: 'POCKET_ALERT_TRIGGERED',
    resource: 'alerts',
    patientId: 'P12345',
    newValue: 'Alert ID: alert-p12345-01',
    details: 'Dispatched HIGH RISK telemetry alert to assigned Pocket Device ESP32-POCKET-01.',
  }
];
