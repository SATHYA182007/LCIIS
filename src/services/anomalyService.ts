import type { DataPoint } from './trendService';


export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  parameterName: string;
  anomalyType?: 'Z_SCORE_DEVIATION' | 'RATE_OF_CHANGE_SPIKE' | 'BASELINE_DIVERGENCE';
  severityScore: number; // 0 - 100
  explanation?: string;
}

export class AnomalyEngine {
  /**
   * Detects statistical anomalies in a time series using Z-score and Rate-of-Change divergence
   */
  public static detectAnomaly(
    parameterName: string,
    dataPoints: DataPoint[],
    referenceRange: { low: number; high: number }
  ): AnomalyDetectionResult {
    if (!dataPoints || dataPoints.length < 3) {
      return {
        isAnomaly: false,
        parameterName,
        severityScore: 0,
        explanation: 'Insufficient observations for statistical anomaly detection.',
      };
    }

    const sorted = [...dataPoints].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const latest = sorted[sorted.length - 1];
    const historical = sorted.slice(0, sorted.length - 1);

    // 1. Z-Score Calculation on Historical Mean & Standard Deviation
    const mean = historical.reduce((acc, c) => acc + c.value, 0) / historical.length;
    const variance = historical.reduce((acc, c) => acc + Math.pow(c.value - mean, 2), 0) / historical.length;
    const stdDev = Math.sqrt(variance);

    let zScore = 0;
    if (stdDev > 0) {
      zScore = Math.abs(latest.value - mean) / stdDev;
    }

    // 2. Rate-of-Change Spike Calculation
    const previous = sorted[sorted.length - 2];
    const dtHours = (new Date(latest.timestamp).getTime() - new Date(previous.timestamp).getTime()) / 3600000;
    const delta = Math.abs(latest.value - previous.value);


    // Range-relative jump magnitude
    const rangeSpan = referenceRange.high - referenceRange.low;
    const relJump = rangeSpan > 0 ? delta / rangeSpan : 0;

    // Evaluates triggers
    if (zScore >= 2.5 && stdDev > 0) {
      const severity = Math.min(100, Math.round(zScore * 30));
      return {
        isAnomaly: true,
        parameterName,
        anomalyType: 'Z_SCORE_DEVIATION',
        severityScore: severity,
        explanation: `Statistical Outlier Detected: ${parameterName} value ${latest.value} deviates by ${zScore.toFixed(1)} standard deviations from historical baseline (${mean.toFixed(2)}).`,
      };
    }

    if (relJump >= 0.40 && dtHours <= 4) {
      const severity = Math.min(100, Math.round(relJump * 120));
      return {
        isAnomaly: true,
        parameterName,
        anomalyType: 'RATE_OF_CHANGE_SPIKE',
        severityScore: severity,
        explanation: `Abrupt Shift Detected: ${parameterName} shifted by ${delta} units in ${dtHours.toFixed(1)} hours (represents ${(relJump * 100).toFixed(0)}% of clinical range span).`,
      };
    }

    return {
      isAnomaly: false,
      parameterName,
      severityScore: 0,
    };
  }
}
