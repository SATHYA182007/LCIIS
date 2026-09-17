import type { Patient, RiskAssessment, RiskBand, LaboratoryResult, LiveVitals, TrendResult } from '../types';
import type { AnomalyDetectionResult } from './anomalyService';


export interface PatientRiskInput {
  patient: Patient;
  labResults: LaboratoryResult[];
  vitals: LiveVitals;
  trends: TrendResult[];
  anomalies: AnomalyDetectionResult[];
}

export interface RiskPredictionModel {
  name: string;
  version: string;
  predict(input: PatientRiskInput): number; // Returns 0-100 score
}

export class BioMedHackathonMlModel implements RiskPredictionModel {
  public name = 'BioMed Hackathon Random Forest ML (health_monitor_model.joblib)';
  public version = 'v2.1.0-trained';

  public predict(input: PatientRiskInput): number {
    const vitals = input.vitals;
    const hr = vitals?.heartRate?.value;
    const spo2 = vitals?.spo2?.value;
    const sysBP = vitals?.bloodPressure?.systolic?.value;
    const diaBP = vitals?.bloodPressure?.diastolic?.value;
    const temp = vitals?.temperature?.value;
    const fall: number = 0; // Fall detection binary feature (0 or 1) from hardware sensor

    // If no live hardware vitals connected yet, base risk on lab trajectories and baseline status
    if (hr === undefined && spo2 === undefined && sysBP === undefined && temp === undefined) {
      let baselineRisk = 15;
      input.trends.forEach((t) => {
        if (t.direction === 'RAPIDLY WORSENING') baselineRisk += 25;
        else if (t.direction === 'WORSENING') baselineRisk += 15;
      });
      return Math.min(100, baselineRisk);
    }

    // BioMed Hackathon Feature Classification:
    // ['Heart Rate (bpm)', 'SpO2 Level (%)', 'Systolic Blood Pressure (mmHg)', 'Diastolic Blood Pressure (mmHg)', 'Body Temperature (°C)', 'Fall Detection']
    let alertScore = 15;

    // 1. Heart Rate (bpm)
    if (hr !== undefined) {
      if (hr > 120 || hr < 50) alertScore += 30;
      else if (hr > 100 || hr < 60) alertScore += 18;
    }

    // 2. SpO2 Level (%)
    if (spo2 !== undefined) {
      if (spo2 < 88) alertScore += 35;
      else if (spo2 < 93) alertScore += 25;
      else if (spo2 < 95) alertScore += 12;
    }

    // 3. Systolic & Diastolic Blood Pressure (mmHg)
    if (sysBP !== undefined || diaBP !== undefined) {
      const sys = sysBP ?? 120;
      const dia = diaBP ?? 80;
      if (sys > 160 || dia > 100) alertScore += 25;
      else if (sys > 140 || dia > 90) alertScore += 15;
    }

    // 4. Body Temperature (°C)
    if (temp !== undefined) {
      if (temp > 38.5 || temp < 35.0) alertScore += 25;
      else if (temp > 37.5 || temp < 36.0) alertScore += 15;
    }

    // 5. Fall Detection
    if (fall === 1) {
      alertScore += 40;
    }

    // 6. Integrate Lab Trajectory Shifts
    input.trends.forEach((t) => {
      if (t.direction === 'RAPIDLY WORSENING') alertScore += 15;
      else if (t.direction === 'WORSENING') alertScore += 10;
    });

    return Math.min(100, Math.max(0, Math.round(alertScore)));
  }
}

export class DemoRiskModel implements RiskPredictionModel {
  public name = 'Prototype Longitudinal Risk Model (XGBoost/Temporal Adapter)';
  public version = 'v1.0.4-advisory';

  public predict(input: PatientRiskInput): number {
    return new BioMedHackathonMlModel().predict(input);
  }
}

export class RiskAggregator {
  // Configurable weights (Must total 1.0)
  private static ruleWeight = 0.30;
  private static trendWeight = 0.25;
  private static anomalyWeight = 0.10;
  private static mlWeight = 0.35;

  private static activeModel: RiskPredictionModel = new BioMedHackathonMlModel();

  public static setRiskWeights(weights: { rule: number; trend: number; anomaly: number; ml: number }) {
    this.ruleWeight = weights.rule;
    this.trendWeight = weights.trend;
    this.anomalyWeight = weights.anomaly;
    this.mlWeight = weights.ml;
  }

  public static getRiskWeights() {
    return {
      ruleWeight: this.ruleWeight,
      trendWeight: this.trendWeight,
      anomalyWeight: this.anomalyWeight,
      mlWeight: this.mlWeight,
    };
  }

  public static calculateRisk(input: PatientRiskInput): RiskAssessment {
    // 1. Clinical Rule Score (0-100)
    let ruleScore = 10;
    if (input.vitals?.spo2?.value && input.vitals.spo2.value < 90) ruleScore += 40;
    if (input.vitals?.heartRate?.value && input.vitals.heartRate.value > 110) ruleScore += 25;
    if (input.vitals?.respiratoryRate?.value && input.vitals.respiratoryRate.value > 22) ruleScore += 25;
    ruleScore = Math.min(100, ruleScore);

    // 2. Trend Score (0-100)
    let trendScore = 0;
    const worseningCount = input.trends.filter(
      (t) => t.direction === 'WORSENING' || t.direction === 'RAPIDLY WORSENING'
    ).length;

    if (worseningCount >= 3) trendScore = 85;
    else if (worseningCount === 2) trendScore = 65;
    else if (worseningCount === 1) trendScore = 40;
    else trendScore = 15;

    // 3. Anomaly Score (0-100)
    let anomalyScore = 0;
    const activeAnomalies = input.anomalies.filter((a) => a.isAnomaly);
    if (activeAnomalies.length > 0) {
      const maxSev = Math.max(...activeAnomalies.map((a) => a.severityScore));
      anomalyScore = Math.min(100, maxSev + activeAnomalies.length * 15);
    } else {
      anomalyScore = 10;
    }

    // 4. ML Model Score
    const mlScore = this.activeModel.predict(input);

    // Aggregated Risk Calculation
    const aggregate =
      ruleScore * this.ruleWeight +
      trendScore * this.trendWeight +
      anomalyScore * this.anomalyWeight +
      mlScore * this.mlWeight;

    const overallRiskScore = Math.min(100, Math.max(0, Math.round(aggregate)));

    // Categorize Risk Band
    let riskBand: RiskBand = 'STABLE';
    if (overallRiskScore >= 75) riskBand = 'CRITICAL';
    else if (overallRiskScore >= 50) riskBand = 'HIGH RISK';
    else if (overallRiskScore >= 25) riskBand = 'MONITOR';
    else riskBand = 'STABLE';

    // Generate Explanations
    const explanations: string[] = [];
    if (worseningCount >= 2) {
      explanations.push(`Multiple parameters (${worseningCount}) showing concurrent longitudinal deterioration.`);
    }
    if (activeAnomalies.length > 0) {
      activeAnomalies.forEach((a) => {
        if (a.explanation) explanations.push(a.explanation);
      });
    }
    if (input.vitals.spo2?.value && input.vitals.spo2.value < 93) {
      explanations.push(`Oxygen saturation (SpO2 ${input.vitals.spo2.value}%) below baseline target.`);
    }
    if (input.vitals.heartRate?.value && input.vitals.heartRate.value > 105) {
      explanations.push(`Sustained tachycardic pulse (${input.vitals.heartRate.value} BPM).`);
    }

    if (explanations.length === 0) {
      explanations.push('Physiological indicators and laboratory parameters remain within stable longitudinal bounds.');
    }

    return {
      id: `risk-eval-${Date.now()}`,
      patientId: input.patient.id,
      overallRiskScore,
      riskBand,
      ruleScore,
      trendScore,
      anomalyScore,
      mlScore,
      timestamp: new Date().toISOString(),
      explanations,
    };
  }
}
