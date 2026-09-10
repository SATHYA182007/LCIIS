import type { PatientStatus, Patient, RiskAssessment, LiveVitals, TrendResult } from '../types';

export class PatientStatusEngine {
  public static evaluateStatus(
    patient: Patient,
    riskAssessment: RiskAssessment,
    _vitals: LiveVitals,
    trends: TrendResult[],
    isDeviceOffline: boolean = false
  ): { status: PatientStatus; primaryConcern: string } {
    // If device is offline, DO NOT infer deterioration
    if (isDeviceOffline) {
      return {
        status: patient.currentStatus || 'MONITOR',
        primaryConcern: 'Device offline — live patient readings may be unavailable.',
      };
    }

    const worseningTrends = trends.filter(
      (t) => t.direction === 'WORSENING' || t.direction === 'RAPIDLY WORSENING'
    );

    let calculatedStatus: PatientStatus = 'STABLE';
    let primaryConcern = 'Patient values remain stable.';

    if (riskAssessment.overallRiskScore >= 75 || worseningTrends.length >= 3) {
      calculatedStatus = 'CRITICAL';
      primaryConcern = 'Several recent patient values show concerning changes. Clinical review recommended.';
    } else if (riskAssessment.overallRiskScore >= 50 || worseningTrends.length >= 2) {
      calculatedStatus = 'HIGH RISK';
      primaryConcern = 'Several values changed together over time. Clinical review recommended.';
    } else if (riskAssessment.overallRiskScore >= 25 || worseningTrends.length === 1) {
      calculatedStatus = 'MONITOR';
      primaryConcern = 'Subtle change seen in recent results.';
    }

    return {
      status: calculatedStatus,
      primaryConcern,
    };
  }
}
