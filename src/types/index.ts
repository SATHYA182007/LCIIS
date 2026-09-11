export type UserRole = 'receptionist' | 'nurse' | 'doctor' | 'laboratory' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type PatientStatus = 'Registered' | 'Under Care' | 'STABLE' | 'MONITOR' | 'HIGH RISK' | 'CRITICAL' | 'INSUFFICIENT DATA' | 'Discharged';

export interface Patient {
  id: string;
  hospitalId: string; // e.g. LCIIS-P-000001
  name: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  emergencyContact: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup: string;
  address: string;
  email?: string;
  admissionDate: string;
  departmentId: string;
  departmentName: string;
  ward: string;
  bed: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  admissionType: 'Emergency' | 'Elective' | 'Transfer' | 'ICU Admission' | 'Outpatient Registration';
  primaryComplaint: string;
  allergies: string[];
  existingConditions: string[];
  emergencyNotes?: string;
  currentStatus: PatientStatus;
  status?: PatientStatus;
  advisoryRisk: number; // 0-100
  registeredBy?: string;
  registeredAt?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LabCategory = 'Hematology' | 'Biochemistry' | 'Inflammatory' | 'Coagulation' | 'Other';

export interface LaboratoryResult {
  id: string;
  patientId: string;
  testName: string;
  category: LabCategory;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  sampleCollectedAt: string;
  resultedAt: string;
  technicianId: string;
  technicianName: string;
  source: 'LIS_MANUAL' | 'LIS_AUTOMATED';
  verificationStatus: 'VERIFIED' | 'PENDING';
  notes?: string;
  createdAt: string;
}

export type TelemetrySource = 'LIVE_SENSOR' | 'SIMULATED_SENSOR' | 'MANUAL_ENTRY';

export interface VitalMeasurement {
  value: number;
  unit: string;
  timestamp: string;
  source: TelemetrySource;
  deviceId?: string;
  quality: 'GOOD' | 'WARNING' | 'INVALID';
}

export interface LiveVitals {
  heartRate?: VitalMeasurement;
  spo2?: VitalMeasurement;
  bloodPressure?: {
    systolic: VitalMeasurement;
    diastolic: VitalMeasurement;
  };
  respiratoryRate?: VitalMeasurement;
  temperature?: VitalMeasurement;
  urineOutput?: VitalMeasurement;
  lastUpdated?: string;
}

export type TrendDirection = 
  | 'STABLE' 
  | 'IMPROVING' 
  | 'WORSENING' 
  | 'RAPIDLY WORSENING' 
  | 'VOLATILE' 
  | 'INSUFFICIENT DATA';

export interface TrendResult {
  parameterName: string;
  direction: TrendDirection;
  magnitude: number;
  percentageChange: number;
  rateOfChange: number; // change per hour
  persistence: boolean;
  acceleration: boolean;
  volatility: number;
  patientBaseline: number | null;
  referenceRange: { low: number; high: number };
  observationCount: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  explanation: string;
}

export type RiskBand = 'STABLE' | 'MONITOR' | 'HIGH RISK' | 'CRITICAL';

export interface RiskAssessment {
  id: string;
  patientId: string;
  overallRiskScore: number; // 0-100
  riskBand: RiskBand;
  ruleScore: number;
  trendScore: number;
  anomalyScore: number;
  mlScore: number;
  timestamp: string;
  explanations: string[];
}

export type AlertType = 
  | 'LABORATORY TREND' 
  | 'PHYSIOLOGICAL TREND' 
  | 'MULTI-PARAMETER CHANGE' 
  | 'ANOMALY' 
  | 'RISK ESCALATION' 
  | 'RAPID DETERIORATION' 
  | 'DEVICE OFFLINE' 
  | 'DATA QUALITY';

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATION';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN REVIEW' | 'ACTION TAKEN' | 'RESOLVED' | 'OVERRIDDEN';

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  ward: string;
  bed: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  summary: string;
  concerns: string[];
  advisoryRisk: number;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  overrideReason?: string;
}

export interface NurseObservation {
  id: string;
  patientId: string;
  nurseId: string;
  nurseName: string;
  timestamp: string;
  ward: string;
  department: string;
  consciousness: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive';
  painScore: number; // 0-10
  respiratoryNote?: string;
  fluidIntake?: number; // ml
  fluidOutput?: number; // ml
  notes: string;
}

export interface DoctorRemark {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  remark: string;
  type: 'NOTE' | 'INSTRUCTION' | 'REVIEW';
}

export interface MedicationRecord {
  id: string;
  patientId: string;
  prescribedBy: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
}

export interface InterventionRecord {
  id: string;
  patientId: string;
  performedBy: string;
  action: string;
  outcome: string;
  timestamp: string;
}

export type InventoryCategory = 
  | 'Medicines'
  | 'Injection Supplies'
  | 'Surgical Supplies'
  | 'PPE'
  | 'Syringes'
  | 'Gloves'
  | 'Bandages'
  | 'IV Supplies'
  | 'Laboratory Supplies'
  | 'Medical Consumables'
  | 'Other Equipment';

export type ExpiryStatus = 'SAFE' | 'EXPIRING SOON' | 'URGENT EXPIRY' | 'EXPIRED';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: InventoryCategory;
  batchNumber: string;
  supplier: string;
  quantityReceived: number;
  currentQuantity: number;
  unit: string;
  mfgDate: string;
  expiryDate: string;
  receivedDate: string;
  storageLocation: string;
  minimumStockLevel: number;
  unitCost: number;
  status: ExpiryStatus | 'LOW STOCK';
  notes?: string;
}

export type MovementType = 'STOCK IN' | 'STOCK OUT' | 'ADJUSTMENT' | 'RETURN' | 'EXPIRED' | 'DAMAGED';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  type: MovementType;
  performedBy: string;
  timestamp: string;
  reason: string;
}

export type DeviceConnectionStatus = 'ONLINE' | 'WARNING' | 'OFFLINE' | 'MAINTENANCE';

export interface DeviceRecord {
  id: string;
  name: string;
  type: 'BEDSIDE_MONITOR' | 'POCKET_ALERT_DEVICE' | 'VITAL_SENSOR_HUB';
  esp32Id: string;
  macAddress: string;
  patientId?: string;
  patientName?: string;
  bedId?: string;
  departmentId?: string;
  firmwareVersion: string;
  connectionStatus: DeviceConnectionStatus;
  lastSeen: string;
  batteryLevel: number;
  sensorStatus: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  resource: string;
  patientId?: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}
