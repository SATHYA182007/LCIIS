import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Patient,
  LaboratoryResult,
  LiveVitals,
  Alert,
  InventoryItem,
  StockMovement,
  DeviceRecord,
  AuditLog,
  NurseObservation,
  DoctorRemark,
  MedicationRecord,
  InterventionRecord,
  RiskAssessment,
  TrendResult,
  UserProfile
} from '../types';
import {
  DEMO_USERS,
  INITIAL_DEMO_PATIENT,
  INITIAL_LAB_RESULTS,
  INITIAL_LIVE_VITALS,
  INITIAL_ALERTS,
  INITIAL_INVENTORY,
  INITIAL_DEVICES,
  INITIAL_REMARKS,
  INITIAL_MEDICATIONS,
  INITIAL_INTERVENTIONS,
  INITIAL_AUDIT_LOGS,
  generateSyntheticPatients
} from '../lib/seedData';

import { TrendAnalysisEngine } from '../services/trendService';
import { AnomalyEngine, type AnomalyDetectionResult } from '../services/anomalyService';
import { RiskAggregator } from '../services/riskService';
import { PatientStatusEngine } from '../services/statusService';
import { ExplanationEngine } from '../services/explanationService';
import { AlertEngine } from '../services/alertService';
import { InventoryService } from '../services/inventoryService';
import { AuditService } from '../services/auditService';


interface RealtimeContextType {
  users: UserProfile[];
  patients: Patient[];
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  
  labResults: LaboratoryResult[];
  liveVitalsMap: Record<string, LiveVitals>;
  alerts: Alert[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  devices: DeviceRecord[];
  auditLogs: AuditLog[];
  nurseObservations: NurseObservation[];
  doctorRemarks: DoctorRemark[];
  medications: MedicationRecord[];
  interventions: InterventionRecord[];

  // Dynamic Calculators & Readers
  getPatientTrends: (patientId: string) => TrendResult[];
  getPatientRiskAssessment: (patientId: string) => RiskAssessment;
  getPatientExplanation: (patientId: string) => ReturnType<typeof ExplanationEngine.generateExplanation>;

  // Clinical & Operations Mutations
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'INACTIVE') => void;
  addPatient: (patient: Partial<Patient>) => Patient;
  addLaboratoryResult: (result: Omit<LaboratoryResult, 'id' | 'createdAt'>) => void;
  updateLiveVitals: (patientId: string, vitals: Partial<LiveVitals>) => void;
  acknowledgeAlert: (alertId: string, doctorName: string) => void;
  overrideAlert: (alertId: string, doctorName: string, reason: string) => void;
  addNurseObservation: (observation: Omit<NurseObservation, 'id' | 'timestamp'>) => void;
  addDoctorRemark: (remark: Omit<DoctorRemark, 'id' | 'timestamp'>) => void;
  addMedication: (med: Omit<MedicationRecord, 'id'>) => void;
  addIntervention: (intervention: Omit<InterventionRecord, 'id' | 'timestamp'>) => void;
  processStockMovement: (itemId: string, qty: number, type: StockMovement['type'], performedBy: string, reason: string) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceRecord['connectionStatus']) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [patients, setPatients] = useState<Patient[]>(() => generateSyntheticPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P12345');
  const [labResults, setLabResults] = useState<LaboratoryResult[]>(INITIAL_LAB_RESULTS);
  const [liveVitalsMap, setLiveVitalsMap] = useState<Record<string, LiveVitals>>({
    P12345: INITIAL_LIVE_VITALS,
    'LCIIS-P-000001': INITIAL_LIVE_VITALS,
  });
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>(INITIAL_DEVICES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  const [nurseObservations, setNurseObservations] = useState<NurseObservation[]>([]);
  const [doctorRemarks, setDoctorRemarks] = useState<DoctorRemark[]>(INITIAL_REMARKS);
  const [medications, setMedications] = useState<MedicationRecord[]>(INITIAL_MEDICATIONS);
  const [interventions, setInterventions] = useState<InterventionRecord[]>(INITIAL_INTERVENTIONS);

  useEffect(() => {
    AuditService.initialize(auditLogs);
  }, []);

  const getPatientById = useCallback((id: string) => {
    return patients.find((p) => p.id === id || p.hospitalId === id);
  }, [patients]);

  // Dynamic Trend Analysis Calculation for a patient
  const getPatientTrends = useCallback((patientId: string): TrendResult[] => {
    const patientLabs = labResults.filter((l) => l.patientId === patientId || (patientId === 'P12345' && l.patientId === 'P12345'));
    
    // Group lab measurements by testName
    const labGroups: Record<string, LaboratoryResult[]> = {};
    patientLabs.forEach((l) => {
      if (!labGroups[l.testName]) labGroups[l.testName] = [];
      labGroups[l.testName].push(l);
    });

    const trends: TrendResult[] = [];

    // Analyze Creatinine
    if (labGroups['Creatinine']) {
      const dataPoints = labGroups['Creatinine'].map((l) => ({ timestamp: l.sampleCollectedAt, value: l.value }));
      trends.push(
        TrendAnalysisEngine.analyzeTimeSeries('Creatinine', dataPoints, { low: 0.6, high: 1.2 }, false)
      );
    }

    // Analyze CRP
    if (labGroups['CRP (C-Reactive Protein)'] || labGroups['CRP']) {
      const group = labGroups['CRP (C-Reactive Protein)'] || labGroups['CRP'];
      const dataPoints = group.map((l) => ({ timestamp: l.sampleCollectedAt, value: l.value }));
      trends.push(
        TrendAnalysisEngine.analyzeTimeSeries('CRP', dataPoints, { low: 0, high: 10 }, false)
      );
    }

    return trends;
  }, [labResults]);

  // Dynamic Risk Assessment Calculation for a patient
  const getPatientRiskAssessment = useCallback((patientId: string): RiskAssessment => {
    const patient = getPatientById(patientId) || INITIAL_DEMO_PATIENT;
    const vitals = liveVitalsMap[patientId] || INITIAL_LIVE_VITALS;
    const trends = getPatientTrends(patientId);
    const labList = labResults.filter((l) => l.patientId === patientId);

    const anomalies: AnomalyDetectionResult[] = [];
    trends.forEach((t) => {
      const pts = labList
        .filter((l) => l.testName === t.parameterName || (t.parameterName === 'CRP' && l.testName.includes('CRP')))
        .map((l) => ({ timestamp: l.sampleCollectedAt, value: l.value }));
      
      const anomaly = AnomalyEngine.detectAnomaly(t.parameterName, pts, t.referenceRange);
      if (anomaly.isAnomaly) anomalies.push(anomaly);
    });

    return RiskAggregator.calculateRisk({
      patient,
      labResults: labList,
      vitals,
      trends,
      anomalies,
    });
  }, [getPatientById, liveVitalsMap, getPatientTrends, labResults]);

  const getPatientExplanation = useCallback((patientId: string) => {
    const patient = getPatientById(patientId) || INITIAL_DEMO_PATIENT;
    const risk = getPatientRiskAssessment(patientId);
    const trends = getPatientTrends(patientId);
    const vitals = liveVitalsMap[patientId] || INITIAL_LIVE_VITALS;
    const labs = labResults.filter((l) => l.patientId === patientId);

    return ExplanationEngine.generateExplanation(patient, risk, trends, vitals, labs);
  }, [getPatientById, getPatientRiskAssessment, getPatientTrends, liveVitalsMap, labResults]);

  // Recalculates patient advisory status and checks for alert creation
  const runClinicalPipeline = useCallback((patientId: string, newVitals?: LiveVitals) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.hospitalId === patientId) {
          const currentVitals = newVitals || liveVitalsMap[patientId] || INITIAL_LIVE_VITALS;
          const trends = getPatientTrends(patientId);
          const risk = getPatientRiskAssessment(patientId);
          const explanation = ExplanationEngine.generateExplanation(p, risk, trends, currentVitals, []);
          
          const device = devices.find((d) => d.patientId === patientId);
          const isOffline = device ? device.connectionStatus === 'OFFLINE' : false;

          const statusEval = PatientStatusEngine.evaluateStatus(p, risk, currentVitals, trends, isOffline);

          // Evaluate alerts
          setAlerts((prevAlerts) => {
            const { updatedAlerts } = AlertEngine.processAlertEvaluation(prevAlerts, p, risk, explanation);
            return updatedAlerts;
          });

          return {
            ...p,
            currentStatus: statusEval.status,
            advisoryRisk: risk.overallRiskScore,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, [liveVitalsMap, getPatientTrends, getPatientRiskAssessment, devices]);

  const addPatient = useCallback((newP: Partial<Patient>): Patient => {
    const newId = `LCIIS-P-${(patients.length + 1).toString().padStart(6, '0')}`;
    const fullPatient: Patient = {
      id: newId,
      hospitalId: newId,
      name: newP.name || 'New Patient',
      dateOfBirth: newP.dateOfBirth || '1970-01-01',
      age: newP.age || 45,
      gender: newP.gender || 'Male',
      phone: newP.phone || '+1 (555) 000-0000',
      emergencyContact: newP.emergencyContact || 'Emergency Contact',
      bloodGroup: newP.bloodGroup || 'O+',
      address: newP.address || 'Hospital Ward',
      admissionDate: new Date().toISOString(),
      departmentId: newP.departmentId || 'dept-icu',
      departmentName: newP.departmentName || 'Intensive Care Unit',
      ward: newP.ward || 'General Ward A',
      bed: newP.bed || 'Bed 01',
      attendingDoctorId: newP.attendingDoctorId || 'user-doc-1',
      attendingDoctorName: newP.attendingDoctorName || 'Dr. Sarah Jenkins',
      admissionType: newP.admissionType || 'Emergency',
      primaryComplaint: newP.primaryComplaint || 'Routine Observation',
      allergies: newP.allergies || ['No Known Allergies'],
      existingConditions: newP.existingConditions || [],
      currentStatus: 'STABLE',
      advisoryRisk: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPatients((prev) => [fullPatient, ...prev]);

    const logEntry = AuditService.logAction(
      'current-user',
      'Authorized Staff',
      'nurse',
      'PATIENT_REGISTRATION',
      'patients',
      `Registered new patient ${fullPatient.name} (${fullPatient.id}) in ${fullPatient.departmentName}.`,
      fullPatient.id
    );
    setAuditLogs((prev) => [logEntry, ...prev]);

    return fullPatient;
  }, [patients]);

  const addLaboratoryResult = useCallback((res: Omit<LaboratoryResult, 'id' | 'createdAt'>) => {
    const newResult: LaboratoryResult = {
      ...res,
      id: `lab-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setLabResults((prev) => [...prev, newResult]);

    // Audit Logging
    const logEntry = AuditService.logAction(
      res.technicianId || 'user-lab-1',
      res.technicianName || 'Laboratory Staff',
      'laboratory',
      'LAB_RESULT_ENTRY',
      'laboratoryResults',
      `Entered ${res.testName} value ${res.value} ${res.unit} for Patient ID ${res.patientId}.`,
      res.patientId,
      undefined,
      `${res.value} ${res.unit}`
    );
    setAuditLogs((prev) => [logEntry, ...prev]);

    // Re-run intelligence pipeline for patient
    runClinicalPipeline(res.patientId);
  }, [runClinicalPipeline]);

  const updateLiveVitals = useCallback((patientId: string, vitalsPartial: Partial<LiveVitals>) => {
    setLiveVitalsMap((prev) => {
      const existing = prev[patientId] || {};
      const updated: LiveVitals = {
        ...existing,
        ...vitalsPartial,
        lastUpdated: new Date().toISOString(),
      };
      
      runClinicalPipeline(patientId, updated);
      return { ...prev, [patientId]: updated };
    });
  }, [runClinicalPipeline]);

  const acknowledgeAlert = useCallback((alertId: string, doctorName: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const logEntry = AuditService.logAction(
            'doc-user',
            doctorName,
            'doctor',
            'ALERT_ACKNOWLEDGEMENT',
            'alerts',
            `Doctor ${doctorName} acknowledged clinical alert ${alertId} for ${a.patientName}.`,
            a.patientId
          );
          setAuditLogs((l) => [logEntry, ...l]);

          return {
            ...a,
            status: 'ACKNOWLEDGED',
            acknowledgedBy: doctorName,
            acknowledgedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
  }, []);

  const overrideAlert = useCallback((alertId: string, doctorName: string, reason: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const logEntry = AuditService.logAction(
            'doc-user',
            doctorName,
            'doctor',
            'ALERT_OVERRIDE',
            'alerts',
            `Doctor ${doctorName} OVERRODE clinical alert ${alertId}. Mandatory Reason: "${reason}".`,
            a.patientId,
            a.status,
            'OVERRIDDEN'
          );
          setAuditLogs((l) => [logEntry, ...l]);

          return {
            ...a,
            status: 'OVERRIDDEN',
            overrideReason: reason,
            acknowledgedBy: doctorName,
            acknowledgedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
  }, []);

  const addNurseObservation = useCallback((obs: Omit<NurseObservation, 'id' | 'timestamp'>) => {
    const newObs: NurseObservation = {
      ...obs,
      id: `obs-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNurseObservations((prev) => [newObs, ...prev]);

    const log = AuditService.logAction(
      obs.nurseId,
      obs.nurseName,
      'nurse',
      'NURSE_OBSERVATION_RECORDED',
      'clinicalObservations',
      `Recorded clinical observation for patient ${obs.patientId}. Consciousness: ${obs.consciousness}, Pain: ${obs.painScore}/10.`,
      obs.patientId
    );
    setAuditLogs((prev) => [log, ...prev]);
  }, []);

  const addDoctorRemark = useCallback((rem: Omit<DoctorRemark, 'id' | 'timestamp'>) => {
    const newRem: DoctorRemark = {
      ...rem,
      id: `rem-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setDoctorRemarks((prev) => [newRem, ...prev]);

    const log = AuditService.logAction(
      rem.doctorId,
      rem.doctorName,
      'doctor',
      'DOCTOR_REMARK_ADDED',
      'doctorRemarks',
      `Doctor ${rem.doctorName} added remark to patient ${rem.patientId}: "${rem.remark}".`,
      rem.patientId
    );
    setAuditLogs((prev) => [log, ...prev]);
  }, []);

  const addMedication = useCallback((med: Omit<MedicationRecord, 'id'>) => {
    const newMed: MedicationRecord = {
      ...med,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [newMed, ...prev]);

    const log = AuditService.logAction(
      'doc-user',
      med.prescribedBy,
      'doctor',
      'MEDICATION_PRESCRIBED',
      'medications',
      `Prescribed ${med.medicationName} (${med.dosage}, ${med.frequency}) for patient ${med.patientId}.`,
      med.patientId
    );
    setAuditLogs((prev) => [log, ...prev]);
  }, []);

  const addIntervention = useCallback((inter: Omit<InterventionRecord, 'id' | 'timestamp'>) => {
    const newInter: InterventionRecord = {
      ...inter,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setInterventions((prev) => [newInter, ...prev]);

    const log = AuditService.logAction(
      'staff-user',
      inter.performedBy,
      'nurse',
      'CLINICAL_INTERVENTION_RECORDED',
      'interventions',
      `Intervention for patient ${inter.patientId}: ${inter.action}. Outcome: ${inter.outcome}.`,
      inter.patientId
    );
    setAuditLogs((prev) => [log, ...prev]);
  }, []);

  const processStockMovement = useCallback(
    (itemId: string, qty: number, type: StockMovement['type'], performedBy: string, reason: string) => {
      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;

      const { updatedItem, movementRecord } = InventoryService.processStockMovement(
        item,
        qty,
        type,
        performedBy,
        reason
      );

      setInventory((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));
      setStockMovements((prev) => [movementRecord, ...prev]);

      const log = AuditService.logAction(
        'admin-user',
        performedBy,
        'admin',
        'INVENTORY_STOCK_MOVEMENT',
        'inventory',
        `${type} executed for ${item.name}: Quantity ${qty}. Reason: "${reason}".`,
        undefined,
        `${item.currentQuantity}`,
        `${updatedItem.currentQuantity}`
      );
      setAuditLogs((prev) => [log, ...prev]);
    },
    [inventory]
  );

  const updateDeviceStatus = useCallback((deviceId: string, status: DeviceRecord['connectionStatus']) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId || d.esp32Id === deviceId) {
          const log = AuditService.logAction(
            'system',
            'Device Heartbeat Service',
            'admin',
            'DEVICE_STATUS_CHANGE',
            'devices',
            `Device ${d.name} (${d.esp32Id}) status changed from ${d.connectionStatus} to ${status}.`,
            d.patientId
          );
          setAuditLogs((prevLogs) => [log, ...prevLogs]);

          return {
            ...d,
            connectionStatus: status,
            lastSeen: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  }, []);

  const addUser = useCallback((newUser: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const userObj: UserProfile = {
      ...newUser,
      id: `user-${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [userObj, ...prev]);

    const log = AuditService.logAction(
      'admin-user',
      'System Administrator',
      'admin',
      'USER_ACCOUNT_PROVISIONED',
      'users',
      `Provisioned new staff account ${userObj.name} (${userObj.email}) with role ${userObj.role}.`
    );
    setAuditLogs((prev) => [log, ...prev]);
  }, []);

  const updateUserStatus = useCallback((userId: string, status: 'ACTIVE' | 'INACTIVE') => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const log = AuditService.logAction(
            'admin-user',
            'System Administrator',
            'admin',
            'USER_STATUS_UPDATED',
            'users',
            `Updated account status for ${u.name} (${u.email}) to ${status}.`
          );
          setAuditLogs((prevLogs) => [log, ...prevLogs]);
          return { ...u, status };
        }
        return u;
      })
    );
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        users,
        patients,
        selectedPatientId,
        setSelectedPatientId,
        getPatientById,
        labResults,
        liveVitalsMap,
        alerts,
        inventory,
        stockMovements,
        devices,
        auditLogs,
        nurseObservations,
        doctorRemarks,
        medications,
        interventions,

        getPatientTrends,
        getPatientRiskAssessment,
        getPatientExplanation,

        addUser,
        updateUserStatus,
        addPatient,
        addLaboratoryResult,
        updateLiveVitals,
        acknowledgeAlert,
        overrideAlert,
        addNurseObservation,
        addDoctorRemark,
        addMedication,
        addIntervention,
        processStockMovement,
        updateDeviceStatus,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
