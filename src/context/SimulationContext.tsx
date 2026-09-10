import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRealtime } from './RealtimeContext';

export type ScenarioType = 
  | 'P12345_PROGRESSIVE_DETERIORATION'
  | 'RAPID_PHYSIOLOGICAL_DROP'
  | 'PATIENT_RECOVERY'
  | 'DEVICE_DISCONNECT_TEST';

interface SimulationContextType {
  isRunning: boolean;
  activeScenario: ScenarioType;
  setActiveScenario: (scenario: ScenarioType) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  lastSimulatedEvent: string;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export interface LabStepItem {
  testName: string;
  value: number;
  unit: string;
  category: 'Hematology' | 'Biochemistry' | 'Inflammatory' | 'Coagulation' | 'Other';
}

export interface ScenarioStep {
  time: string;
  lab?: LabStepItem;
  lab2?: LabStepItem;
  vitals?: { spo2: number; heartRate: number; respiratoryRate: number };
  note: string;
}

const P12345_STEPS: ScenarioStep[] = [
  {
    time: '08:00',
    lab: { testName: 'Creatinine', value: 0.9, unit: 'mg/dL', category: 'Biochemistry' },
    lab2: { testName: 'CRP (C-Reactive Protein)', value: 8, unit: 'mg/L', category: 'Inflammatory' },
    vitals: { spo2: 98, heartRate: 82, respiratoryRate: 16 },
    note: 'Initial baseline: Creatinine 0.9, CRP 8, SpO2 98%, HR 82 BPM, RR 16',
  },
  {
    time: '12:00',
    lab: { testName: 'Creatinine', value: 1.0, unit: 'mg/dL', category: 'Biochemistry' },
    lab2: { testName: 'CRP (C-Reactive Protein)', value: 12, unit: 'mg/L', category: 'Inflammatory' },
    vitals: { spo2: 97, heartRate: 88, respiratoryRate: 18 },
    note: 'Step 2: Creatinine 1.0, CRP 12, SpO2 97%, HR 88 BPM',
  },
  {
    time: '16:00',
    lab: { testName: 'Creatinine', value: 1.1, unit: 'mg/dL', category: 'Biochemistry' },
    lab2: { testName: 'CRP (C-Reactive Protein)', value: 18, unit: 'mg/L', category: 'Inflammatory' },
    vitals: { spo2: 96, heartRate: 94, respiratoryRate: 19 },
    note: 'Step 3: Creatinine 1.1, CRP 18, SpO2 96%, HR 94 BPM (Subtle trend emerging)',
  },
  {
    time: '20:00',
    lab: { testName: 'Creatinine', value: 1.2, unit: 'mg/dL', category: 'Biochemistry' },
    lab2: { testName: 'CRP (C-Reactive Protein)', value: 25, unit: 'mg/L', category: 'Inflammatory' },
    vitals: { spo2: 94, heartRate: 102, respiratoryRate: 22 },
    note: 'Step 4: Creatinine 1.2, CRP 25, SpO2 94%, HR 102 BPM (Escalation to High Risk)',
  },
  {
    time: '00:00',
    lab: { testName: 'Creatinine', value: 1.3, unit: 'mg/dL', category: 'Biochemistry' },
    lab2: { testName: 'CRP (C-Reactive Protein)', value: 31, unit: 'mg/L', category: 'Inflammatory' },
    vitals: { spo2: 92, heartRate: 112, respiratoryRate: 24 },
    note: 'Step 5: Creatinine 1.3, CRP 31, SpO2 92%, HR 112 BPM (Multi-Parameter Concern Triggered)',
  },
];

const RAPID_STEPS: ScenarioStep[] = [
  { time: '12:00', vitals: { spo2: 97, heartRate: 82, respiratoryRate: 16 }, note: 'Baseline normal' },
  { time: '12:30', vitals: { spo2: 95, heartRate: 91, respiratoryRate: 18 }, note: 'SpO2 95%, HR 91 BPM' },
  { time: '13:00', vitals: { spo2: 93, heartRate: 103, respiratoryRate: 21 }, note: 'SpO2 93%, HR 103 BPM' },
  { time: '13:30', vitals: { spo2: 90, heartRate: 112, respiratoryRate: 25 }, note: 'SpO2 90%, HR 112 BPM (Oxygen Drop)' },
  { time: '14:00', vitals: { spo2: 87, heartRate: 124, respiratoryRate: 28 }, note: 'SpO2 87%, HR 124 BPM (Critical Alarm)' },
];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLaboratoryResult, updateLiveVitals } = useRealtime();
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('P12345_PROGRESSIVE_DETERIORATION');
  const [speed, setSpeed] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [lastSimulatedEvent, setLastSimulatedEvent] = useState<string>('Simulation Ready');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const steps = activeScenario === 'RAPID_PHYSIOLOGICAL_DROP' ? RAPID_STEPS : P12345_STEPS;
  const totalSteps = steps.length;

  useEffect(() => {
    if (isRunning) {
      const intervalMs = Math.max(800, 3000 / speed);

      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= steps.length) {
            setIsRunning(false);
            setLastSimulatedEvent('Scenario completed successfully.');
            return prev;
          }

          // Execute current scenario step
          const step = steps[nextIndex];
          setLastSimulatedEvent(`[${step.time}] ${step.note}`);

          if ('lab' in step && step.lab) {
            addLaboratoryResult({
              patientId: 'P12345',
              testName: step.lab.testName,
              category: step.lab.category,
              value: step.lab.value,
              unit: step.lab.unit,
              referenceLow: 0.6,
              referenceHigh: 1.2,
              sampleCollectedAt: new Date().toISOString(),
              resultedAt: new Date().toISOString(),
              technicianId: 'user-lab-1',
              technicianName: 'Robert Vance, MLS',
              source: 'LIS_AUTOMATED',
              verificationStatus: 'VERIFIED',
            });
          }

          if ('lab2' in step && step.lab2) {
            addLaboratoryResult({
              patientId: 'P12345',
              testName: step.lab2.testName,
              category: step.lab2.category,
              value: step.lab2.value,
              unit: step.lab2.unit,
              referenceLow: 0,
              referenceHigh: 10,
              sampleCollectedAt: new Date().toISOString(),
              resultedAt: new Date().toISOString(),
              technicianId: 'user-lab-1',
              technicianName: 'Robert Vance, MLS',
              source: 'LIS_AUTOMATED',
              verificationStatus: 'VERIFIED',
            });
          }

          if (step.vitals) {
            updateLiveVitals('P12345', {
              spo2: { value: step.vitals.spo2, unit: '%', timestamp: new Date().toISOString(), source: 'SIMULATED_SENSOR', quality: 'GOOD' },
              heartRate: { value: step.vitals.heartRate, unit: 'BPM', timestamp: new Date().toISOString(), source: 'SIMULATED_SENSOR', quality: 'GOOD' },
              respiratoryRate: { value: step.vitals.respiratoryRate, unit: '/min', timestamp: new Date().toISOString(), source: 'SIMULATED_SENSOR', quality: 'GOOD' },
            });
          }

          return nextIndex;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speed, activeScenario, steps, addLaboratoryResult, updateLiveVitals]);

  const startSimulation = () => {
    setIsRunning(true);
    setLastSimulatedEvent(`Started ${activeScenario} at ${speed}x speed.`);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    setLastSimulatedEvent('Simulation paused by user.');
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setLastSimulatedEvent('Simulation reset to step 0.');
  };

  return (
    <SimulationContext.Provider
      value={{
        isRunning,
        activeScenario,
        setActiveScenario,
        speed,
        setSpeed,
        currentStepIndex,
        totalSteps,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        lastSimulatedEvent,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
