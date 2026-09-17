import type { Patient, RiskAssessment, LaboratoryResult, LiveVitals, TrendResult } from '../types';

export interface ExplanationSummary {
  headline: string;
  concerns: string[];
  recommendation: string;
}

export class ExplanationEngine {
  public static generateExplanation(
    _patient: Patient,
    _riskAssessment: RiskAssessment,
    trends: TrendResult[],
    vitals: LiveVitals,
    _labResults: LaboratoryResult[]
  ): ExplanationSummary {
    const concerns: string[] = [];

    // Analyze Lab Trajectories with simple language
    const creatinineTrend = trends.find((t) => t.parameterName.toLowerCase().includes('creatinine'));
    if (creatinineTrend && (creatinineTrend.direction === 'WORSENING' || creatinineTrend.direction === 'RAPIDLY WORSENING')) {
      concerns.push('Creatinine is gradually increasing over recent laboratory results.');
    }

    const crpTrend = trends.find((t) => t.parameterName.toLowerCase().includes('crp'));
    if (crpTrend && (crpTrend.direction === 'WORSENING' || crpTrend.direction === 'RAPIDLY WORSENING')) {
      concerns.push('Inflammatory CRP has increased across recent readings.');
    }

    // Generic trend fallback
    trends.forEach((t) => {
      if (!t.parameterName.toLowerCase().includes('creatinine') && !t.parameterName.toLowerCase().includes('crp')) {
        if (t.direction === 'WORSENING' || t.direction === 'RAPIDLY WORSENING') {
          concerns.push(`${t.parameterName} is increasing across recent results.`);
        }
      }
    });

    // Analyze Vitals
    if (vitals?.spo2?.value && vitals.spo2.value < 95) {
      concerns.push(`Oxygen level has decreased (${vitals.spo2.value}%).`);
    }

    if (vitals?.heartRate?.value && vitals.heartRate.value > 100) {
      concerns.push(`Heart rate has increased (${vitals.heartRate.value} BPM).`);
    }

    if (vitals?.respiratoryRate?.value && vitals.respiratoryRate.value > 20) {
      concerns.push(`Breathing rate is elevated (${vitals.respiratoryRate.value}/min).`);
    }

    if (concerns.length >= 2) {
      concerns.push('Several values changed together over time.');
    }

    let headline = 'Patient values remain stable.';
    let recommendation = 'Routine monitoring continuation.';

    if (concerns.length >= 2) {
      headline = 'Change seen across recent patient results.';
      recommendation = 'Clinical review recommended.';
    } else if (concerns.length >= 1) {
      headline = 'Subtle change observed in recent readings.';
      recommendation = 'Clinical review recommended.';
    }

    return {
      headline,
      concerns: concerns.length > 0 ? concerns : ['All patient values remain within stable baseline.'],
      recommendation,
    };
  }
}
