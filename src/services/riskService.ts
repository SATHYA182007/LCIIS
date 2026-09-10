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

export class DemoRiskModel implements RiskPredictionModel {
  public name = 'Prototype Longitudinal Risk Model (XGBoost/Temporal Adapter)';
  public version = 'v1.0.4-advisory';

  public predict(input: PatientRiskInput): number {
    let score = 20; // baseline healthy score

    // Evaluate lab trends
    input.trends.forEach((t) => {
      if (t.direction === 'RAPIDLY WORSENING') score += 20;
      else if (t.direction === 'WORSENING') score += 12;
      else if (t.direction === 'VOLATILE') score += 8;
    });

    // Evaluate SpO2 vital breach
    if (input.vitals.spo2?.value) {
      const spo2 = input.vitals.spo2.value;
      if (spo2 < 88) score += 35;
      else if (spo2 < 93) score += 20;
      else if (spo2 < 96) score += 10;
    }

    // Evaluate Heart Rate vital breach
    if (input.vitals.heartRate?.value) {
      const hr = input.vitals.heartRate.value;
      if (hr > 120 || hr < 45) score += 25;
      else if (hr > 100) score += 15;
    }

    // Evaluate Respiratory Rate breach
    if (input.vitals.respiratoryRate?.value) {
      const rr = input.vitals.respiratoryRate.value;
      if (rr > 26 || rr < 10) score += 20;
      else if (rr > 20) score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

export class RiskAggregator {
  // Configurable weights (Must total 1.0)
  private static ruleWeight = 0.30;
  private static trendWeight = 0.25;
  private static anomalyWeight = 0.10;
  private static mlWeight = 0.35;

  private static activeModel: RiskPredictionModel = new DemoRiskModel();

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
    if (input.vitals.spo2?.value && input.vitals.spo2.value < 90) ruleScore += 40;
    if (input.vitals.heartRate?.value && input.vitals.heartRate.value > 110) ruleScore += 25;
    if (input.vitals.respiratoryRate?.value && input.vitals.respiratoryRate.value > 22) ruleScore += 25;
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
