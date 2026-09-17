import { rtdb } from '../lib/firebase';
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  type DataSnapshot
} from 'firebase/database';
import type {
  Patient,
  LiveVitals,
  Alert,
  DeviceRecord,
  VitalMeasurement
} from '../types';

/**
 * Ensures Firebase RTDB is initialized before attempting operations.
 */
const getRTDB = () => {
  if (!rtdb) {
    throw new Error('Firebase Realtime Database is not initialized. Please verify VITE_FIREBASE_DATABASE_URL in .env');
  }
  return rtdb;
};

/**
 * Recursively strips undefined fields from an object to satisfy Firebase RTDB set() rules.
 */
export const cleanUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanUndefined(obj[key]);
    }
  });
  return cleaned;
};

// ==========================================
// PATIENT OPERATIONS
// ==========================================

export const generateNextPatientId = async (): Promise<string> => {
  if (!rtdb) {
    return `LCIIS-P-${Date.now().toString().slice(-6)}`;
  }
  try {
    const patientsRef = ref(rtdb, 'patients');
    const snapshot = await get(patientsRef);
    let maxNum = 0;
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const match = key.match(/LCIIS-P-(\d+)/i) || (data[key]?.hospitalId || '').match(/LCIIS-P-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
    }
    const nextNum = maxNum + 1;
    return `LCIIS-P-${nextNum.toString().padStart(6, '0')}`;
  } catch (err) {
    console.warn('Error calculating sequential patient ID:', err);
    return `LCIIS-P-${Date.now().toString().slice(-6)}`;
  }
};

export const createPatient = async (patient: Patient): Promise<void> => {
  const db = getRTDB();
  const id = patient.id || patient.hospitalId;
  const patientRef = ref(db, `patients/${id}`);
  const cleanedPayload = cleanUndefined({
    ...patient,
    id,
    hospitalId: id,
    updatedAt: new Date().toISOString()
  });
  await set(patientRef, cleanedPayload);
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  const db = getRTDB();
  const patientRef = ref(db, `patients/${patientId}`);
  const snapshot = await get(patientRef);
  if (snapshot.exists()) {
    return snapshot.val() as Patient;
  }
  return null;
};

export const subscribeToPatients = (
  callback: (patients: Patient[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!rtdb) {
    if (onError) onError(new Error('Firebase RTDB not connected'));
    return () => {};
  }
  const patientsRef = ref(rtdb, 'patients');
  const unsubscribe = onValue(
    patientsRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const patientList: Patient[] = Object.keys(data).map((key) => ({
          ...data[key],
          id: data[key].id || key
        }));
        callback(patientList);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Firebase patients subscription error:', error);
      if (onError) onError(error);
    }
  );

  return () => off(patientsRef, 'value', unsubscribe);
};

// ==========================================
// LIVE VITALS OPERATIONS
// ==========================================

export interface RawVitalsInput {
  heartRate?: number | VitalMeasurement;
  spo2?: number | VitalMeasurement;
  temperature?: number | VitalMeasurement;
  respiratoryRate?: number | VitalMeasurement;
  systolicBP?: number | VitalMeasurement;
  diastolicBP?: number | VitalMeasurement;
  bloodPressure?: {
    systolic: number | VitalMeasurement;
    diastolic: number | VitalMeasurement;
  };
  urineOutput?: number | VitalMeasurement;
  timestamp?: number | string;
}

export const updateLiveVitals = async (
  patientId: string,
  vitalsData: RawVitalsInput
): Promise<void> => {
  const db = getRTDB();
  const timestamp = vitalsData.timestamp || Date.now();
  const timeString = typeof timestamp === 'number' ? new Date(timestamp).toISOString() : timestamp;

  // Format incoming values to handle both raw numbers and structured VitalMeasurement objects
  const formatVital = (val: any) => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'number') {
      return { value: val, timestamp: timeString, source: 'LIVE_SENSOR', quality: 'GOOD' };
    }
    if (typeof val === 'object' && 'value' in val) {
      return val;
    }
    return null;
  };

  const sysVal = vitalsData.systolicBP !== undefined 
    ? (typeof vitalsData.systolicBP === 'number' ? vitalsData.systolicBP : vitalsData.systolicBP.value)
    : (vitalsData.bloodPressure?.systolic ? (typeof vitalsData.bloodPressure.systolic === 'number' ? vitalsData.bloodPressure.systolic : vitalsData.bloodPressure.systolic.value) : undefined);

  const diaVal = vitalsData.diastolicBP !== undefined 
    ? (typeof vitalsData.diastolicBP === 'number' ? vitalsData.diastolicBP : vitalsData.diastolicBP.value)
    : (vitalsData.bloodPressure?.diastolic ? (typeof vitalsData.bloodPressure.diastolic === 'number' ? vitalsData.bloodPressure.diastolic : vitalsData.bloodPressure.diastolic.value) : undefined);

  const hrVal = typeof vitalsData.heartRate === 'number' ? vitalsData.heartRate : vitalsData.heartRate?.value;
  const spo2Val = typeof vitalsData.spo2 === 'number' ? vitalsData.spo2 : vitalsData.spo2?.value;
  const tempVal = typeof vitalsData.temperature === 'number' ? vitalsData.temperature : vitalsData.temperature?.value;
  const rrVal = typeof vitalsData.respiratoryRate === 'number' ? vitalsData.respiratoryRate : vitalsData.respiratoryRate?.value;

  const rawPayload = {
    heartRate: hrVal,
    spo2: spo2Val,
    temperature: tempVal,
    respiratoryRate: rrVal,
    systolicBP: sysVal,
    diastolicBP: diaVal,
    timestamp: timestamp
  };

  // Structured LiveVitals payload for frontend consumption
  const bpStructured = (sysVal !== undefined || diaVal !== undefined) ? {
    systolic: formatVital(sysVal)!,
    diastolic: formatVital(diaVal)!
  } : undefined;

  const structuredPayload: LiveVitals = {
    heartRate: formatVital(vitalsData.heartRate),
    spo2: formatVital(vitalsData.spo2),
    temperature: formatVital(vitalsData.temperature),
    respiratoryRate: formatVital(vitalsData.respiratoryRate),
    bloodPressure: bpStructured,
    urineOutput: formatVital(vitalsData.urineOutput),
    lastUpdated: timeString
  };

  const fullSetData = cleanUndefined({
    ...rawPayload,
    structured: structuredPayload,
    lastUpdated: timeString
  });

  // Write both flat raw values and structured vitals under liveVitals/{patientId}
  const liveVitalsRef = ref(db, `liveVitals/${patientId}`);
  await set(liveVitalsRef, fullSetData);

  // Also push to vitalHistory/{patientId}
  const historyRef = ref(db, `vitalHistory/${patientId}/${Date.now()}`);
  await set(historyRef, cleanUndefined(rawPayload));
};

export const subscribeToLiveVitals = (
  callback: (vitalsMap: Record<string, LiveVitals>) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!rtdb) {
    if (onError) onError(new Error('Firebase RTDB not connected'));
    return () => {};
  }
  const vitalsRef = ref(rtdb, 'liveVitals');
  const unsubscribe = onValue(
    vitalsRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const map: Record<string, LiveVitals> = {};
        
        Object.keys(data).forEach((patientId) => {
          const item = data[patientId];
          if (item.structured) {
            map[patientId] = item.structured;
          } else {
            const timeStr = item.lastUpdated || (item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString());
            map[patientId] = {
              heartRate: item.heartRate !== undefined ? { value: item.heartRate, unit: 'bpm', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' } : undefined,
              spo2: item.spo2 !== undefined ? { value: item.spo2, unit: '%', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' } : undefined,
              temperature: item.temperature !== undefined ? { value: item.temperature, unit: '°C', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' } : undefined,
              respiratoryRate: item.respiratoryRate !== undefined ? { value: item.respiratoryRate, unit: 'bpm', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' } : undefined,
              bloodPressure: (item.systolicBP !== undefined || item.diastolicBP !== undefined) ? {
                systolic: { value: item.systolicBP ?? 120, unit: 'mmHg', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' },
                diastolic: { value: item.diastolicBP ?? 80, unit: 'mmHg', timestamp: timeStr, source: 'LIVE_SENSOR', quality: 'GOOD' }
              } : undefined,
              lastUpdated: timeStr
            };
          }
        });

        callback(map);
      } else {
        callback({});
      }
    },
    (error) => {
      console.error('Firebase liveVitals subscription error:', error);
      if (onError) onError(error);
    }
  );

  return () => off(vitalsRef, 'value', unsubscribe);
};

// ==========================================
// ALERTS OPERATIONS
// ==========================================

export const createAlert = async (alertData: Alert): Promise<void> => {
  const db = getRTDB();
  const alertRef = ref(db, `alerts/${alertData.id}`);
  await set(alertRef, cleanUndefined(alertData));
};

export const subscribeToAlerts = (
  callback: (alerts: Alert[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!rtdb) {
    if (onError) onError(new Error('Firebase RTDB not connected'));
    return () => {};
  }
  const alertsRef = ref(rtdb, 'alerts');
  const unsubscribe = onValue(
    alertsRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alertList: Alert[] = Object.keys(data).map((key) => ({
          ...data[key],
          id: data[key].id || key
        }));
        callback(alertList);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Firebase alerts subscription error:', error);
      if (onError) onError(error);
    }
  );

  return () => off(alertsRef, 'value', unsubscribe);
};

export const acknowledgeAlert = async (
  alertId: string,
  doctorName: string
): Promise<void> => {
  const db = getRTDB();
  const alertRef = ref(db, `alerts/${alertId}`);
  await update(alertRef, cleanUndefined({
    status: 'ACKNOWLEDGED',
    acknowledgedBy: doctorName,
    acknowledgedAt: new Date().toISOString()
  }));
};

// ==========================================
// DEVICE OPERATIONS
// ==========================================

export const registerDevice = async (device: DeviceRecord): Promise<void> => {
  const db = getRTDB();
  const deviceRef = ref(db, `devices/${device.id}`);
  await set(deviceRef, cleanUndefined(device));
};

export const updateDeviceStatus = async (
  deviceId: string,
  status: string
): Promise<void> => {
  const db = getRTDB();
  const deviceRef = ref(db, `devices/${deviceId}`);
  await update(deviceRef, cleanUndefined({
    connectionStatus: status,
    lastSeen: new Date().toISOString()
  }));
};

// ==========================================
// DATABASE SEEDING UTILITY
// ==========================================

export const seedInitialDatabaseIfEmpty = async (): Promise<boolean> => {
  if (!rtdb) return false;
  try {
    const patientsRef = ref(rtdb, 'patients');
    const snapshot = await get(patientsRef);
    if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
      console.log('🌱 Seeding initial Firebase Realtime Database structure...');
      
      const testPatientId = 'LCIIS-P-000001';
      const initialPatient: Patient = {
        id: testPatientId,
        hospitalId: testPatientId,
        name: 'Test Patient',
        dateOfBirth: '1964-05-14',
        age: 62,
        gender: 'Female',
        phone: '+1 (555) 019-2834',
        emergencyContact: 'John Patient (+1 555-019-2835)',
        bloodGroup: 'O+',
        address: '452 Medical Center Way, ICU Wing',
        admissionDate: new Date().toISOString().split('T')[0],
        departmentId: 'dept-icu',
        departmentName: 'Intensive Care Unit',
        ward: 'ICU',
        bed: '12',
        attendingDoctorId: 'doc-001',
        attendingDoctorName: 'Dr. Sarah Jenkins',
        admissionType: 'ICU Admission',
        primaryComplaint: 'Cardiovascular observation & dyspnea',
        allergies: ['Penicillin'],
        existingConditions: ['Hypertension', 'Type 2 Diabetes'],
        currentStatus: 'MONITOR',
        advisoryRisk: 42,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(ref(rtdb, `patients/${testPatientId}`), cleanUndefined(initialPatient));
      
      await updateLiveVitals(testPatientId, {
        heartRate: 82,
        spo2: 98,
        temperature: 37.1,
        respiratoryRate: 18,
        systolicBP: 120,
        diastolicBP: 80,
        timestamp: Date.now()
      });

      console.log('✅ Initial Firebase Realtime Database seeded successfully.');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error seeding Firebase RTDB:', err);
    return false;
  }
};

export const seedSamplePatientsToFirebase = async (): Promise<number> => {
  if (!rtdb) throw new Error('Firebase Realtime Database is not connected');

  const samplePatients: Patient[] = [
    {
      id: 'LCIIS-P-000001',
      hospitalId: 'LCIIS-P-000001',
      name: 'Test Patient',
      dateOfBirth: '1964-05-14',
      age: 62,
      gender: 'Female',
      phone: '+1 (555) 019-2834',
      emergencyContact: 'John Patient (+1 555-019-2835)',
      bloodGroup: 'O+',
      address: '452 Medical Center Way, ICU Wing',
      admissionDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept-icu',
      departmentName: 'Intensive Care Unit',
      ward: 'ICU',
      bed: 'Bed 12',
      attendingDoctorId: 'doc-001',
      attendingDoctorName: 'Dr. Sarah Jenkins',
      admissionType: 'ICU Admission',
      primaryComplaint: 'Cardiovascular observation & dyspnea',
      allergies: ['Penicillin'],
      existingConditions: ['Hypertension', 'Type 2 Diabetes'],
      currentStatus: 'MONITOR',
      advisoryRisk: 42,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'LCIIS-P-000002',
      hospitalId: 'LCIIS-P-000002',
      name: 'Marcus Vance',
      dateOfBirth: '1972-08-22',
      age: 54,
      gender: 'Male',
      phone: '+1 (555) 321-9876',
      emergencyContact: 'Rachel Vance (+1 555-321-9877)',
      bloodGroup: 'A+',
      address: '108 Oakridge Drive, Metro Ward',
      admissionDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept-icu',
      departmentName: 'Intensive Care Unit',
      ward: 'ICU',
      bed: 'Bed 04',
      attendingDoctorId: 'doc-001',
      attendingDoctorName: 'Dr. Sarah Jenkins',
      admissionType: 'Emergency',
      primaryComplaint: 'Acute Sepsis & Respiratory Distress',
      allergies: ['Sulfa Drugs'],
      existingConditions: ['COPD', 'Chronic Kidney Disease'],
      currentStatus: 'CRITICAL',
      advisoryRisk: 88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'LCIIS-P-000003',
      hospitalId: 'LCIIS-P-000003',
      name: 'Elena Rostova',
      dateOfBirth: '1958-03-11',
      age: 68,
      gender: 'Female',
      phone: '+1 (555) 789-4561',
      emergencyContact: 'Dmitri Rostov (+1 555-789-4562)',
      bloodGroup: 'B-',
      address: '77 Pine Street, Ward 3',
      admissionDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept-cardio',
      departmentName: 'Cardiology',
      ward: 'Cardiology Ward',
      bed: 'Bed 08',
      attendingDoctorId: 'doc-002',
      attendingDoctorName: 'Dr. Robert Chen',
      admissionType: 'Elective',
      primaryComplaint: 'Post-Op Coronary Bypass Monitoring',
      allergies: ['Aspirin'],
      existingConditions: ['Coronary Artery Disease'],
      currentStatus: 'HIGH RISK',
      advisoryRisk: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'LCIIS-P-000004',
      hospitalId: 'LCIIS-P-000004',
      name: 'David Chen',
      dateOfBirth: '1985-11-03',
      age: 41,
      gender: 'Male',
      phone: '+1 (555) 654-3210',
      emergencyContact: 'Mei Chen (+1 555-654-3211)',
      bloodGroup: 'AB+',
      address: '23 Sunset Blvd, Stepdown Unit',
      admissionDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept-stepdown',
      departmentName: 'Stepdown Telemetry',
      ward: 'Telemetry Ward',
      bed: 'Bed 02',
      attendingDoctorId: 'doc-001',
      attendingDoctorName: 'Dr. Sarah Jenkins',
      admissionType: 'Transfer',
      primaryComplaint: 'Transient Arrhythmia',
      allergies: ['None'],
      existingConditions: ['Atrial Fibrillation'],
      currentStatus: 'MONITOR',
      advisoryRisk: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'LCIIS-P-000005',
      hospitalId: 'LCIIS-P-000005',
      name: 'Sophia Patel',
      dateOfBirth: '1997-01-19',
      age: 29,
      gender: 'Female',
      phone: '+1 (555) 987-6543',
      emergencyContact: 'Aarav Patel (+1 555-987-6544)',
      bloodGroup: 'O-',
      address: '542 Elmwood Ave, Recovery',
      admissionDate: new Date().toISOString().split('T')[0],
      departmentId: 'dept-recovery',
      departmentName: 'Surgical Recovery',
      ward: 'Recovery Ward',
      bed: 'Bed 05',
      attendingDoctorId: 'doc-003',
      attendingDoctorName: 'Dr. Emily Watson',
      admissionType: 'Elective',
      primaryComplaint: 'Post-Laparoscopic Appendectomy',
      allergies: ['Latex'],
      existingConditions: ['Asthma'],
      currentStatus: 'STABLE',
      advisoryRisk: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const sampleVitals = [
    { patientId: 'LCIIS-P-000001', hr: 82, spo2: 98, temp: 37.1, sys: 120, dia: 80, rr: 18 }
  ];

  for (const patient of samplePatients) {
    await createPatient(patient);
  }

  for (const v of sampleVitals) {
    await updateLiveVitals(v.patientId, {
      heartRate: v.hr,
      spo2: v.spo2,
      temperature: v.temp,
      systolicBP: v.sys,
      diastolicBP: v.dia,
      respiratoryRate: v.rr,
      timestamp: Date.now()
    });
  }

  return samplePatients.length;
};

// ==========================================
// USER OPERATIONS
// ==========================================

export const subscribeToUsers = (
  callback: (users: any[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  if (!rtdb) return () => {};
  const usersRef = ref(rtdb, 'users');

  const handleValue = (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: any[] = [];
      Object.keys(data).forEach((key) => {
        if (data[key] && typeof data[key] === 'object') {
          list.push({ ...data[key], id: data[key].id || key });
        }
      });
      callback(list);
    } else {
      callback([]);
    }
  };

  const handleError = (error: Error) => {
    if (errorCallback) errorCallback(error);
  };

  onValue(usersRef, handleValue, handleError);

  return () => {
    off(usersRef, 'value', handleValue);
  };
};

export const saveUserToDB = async (userProfile: any): Promise<void> => {
  const db = getRTDB();
  const userRef = ref(db, `users/${userProfile.id}`);
  await set(userRef, cleanUndefined(userProfile));
};

export const updatePatientInDB = async (patientId: string, updates: Partial<Patient>): Promise<void> => {
  const db = getRTDB();
  const patientRef = ref(db, `patients/${patientId}`);
  const cleanedPayload = cleanUndefined({
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await update(patientRef, cleanedPayload);
};

export const deletePatientVitalsFromDB = async (patientId: string): Promise<void> => {
  if (!rtdb) return;
  const vitalsRef = ref(rtdb, `liveVitals/${patientId}`);
  await remove(vitalsRef);
  const historyRef = ref(rtdb, `vitalHistory/${patientId}`);
  await remove(historyRef);
};

export const purgeUnlinkedVitalsFromRTDB = async (): Promise<void> => {
  if (!rtdb) return;
  try {
    // Get active streaming devices from devices/ node
    const devicesSnap = await get(ref(rtdb, 'devices'));
    const activeDevicePatientIds = new Set<string>();
    if (devicesSnap.exists()) {
      const devVal = devicesSnap.val();
      Object.values(devVal).forEach((d: any) => {
        if (d && d.patientId) activeDevicePatientIds.add(d.patientId);
      });
    }

    const vitalsRef = ref(rtdb, 'liveVitals');
    const snapshot = await get(vitalsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const id of Object.keys(data)) {
        if (!activeDevicePatientIds.has(id)) {
          const itemRef = ref(rtdb, `liveVitals/${id}`);
          await remove(itemRef);
          const historyRef = ref(rtdb, `vitalHistory/${id}`);
          await remove(historyRef);
        }
      }
    }

    // Also strip deviceId from patients that don't have active hardware devices
    const patientsSnap = await get(ref(rtdb, 'patients'));
    if (patientsSnap.exists()) {
      const pVal = patientsSnap.val();
      for (const [pId, pObj] of Object.entries<any>(pVal)) {
        if (pObj?.deviceId && !activeDevicePatientIds.has(pId)) {
          await update(ref(rtdb, `patients/${pId}`), { deviceId: null });
        }
      }
    }
  } catch (err) {
    console.warn('Purge unlinked vitals error:', err);
  }
};

export const deletePatientFromDB = async (patientId: string): Promise<void> => {
  const db = getRTDB();
  const patientRef = ref(db, `patients/${patientId}`);
  await remove(patientRef);
  await deletePatientVitalsFromDB(patientId);
};

export const updateUserInDB = async (userId: string, updates: any): Promise<void> => {
  const db = getRTDB();
  const userRef = ref(db, `users/${userId}`);
  const cleanedPayload = cleanUndefined(updates);
  await update(userRef, cleanedPayload);
};

export const deleteUserFromDB = async (userId: string): Promise<void> => {
  const db = getRTDB();
  const userRef = ref(db, `users/${userId}`);
  await remove(userRef);
};
