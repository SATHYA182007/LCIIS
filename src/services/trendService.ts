import type { TrendResult, TrendDirection } from '../types';


export interface DataPoint {
  timestamp: string;
  value: number;
}

export class TrendAnalysisEngine {
  /**
   * Main entry point to analyze a time series of measurements for a parameter
   */
  public static analyzeTimeSeries(
    parameterName: string,
    dataPoints: DataPoint[],
    referenceRange: { low: number; high: number },
    isHigherBetter: boolean = false
  ): TrendResult {
    // 1. Data Sufficiency Check
    if (!dataPoints || dataPoints.length < 2) {
      return {
        parameterName,
        direction: 'INSUFFICIENT DATA',
        magnitude: 0,
        percentageChange: 0,
        rateOfChange: 0,
        persistence: false,
        acceleration: false,
        volatility: 0,
        patientBaseline: dataPoints.length === 1 ? dataPoints[0].value : null,
        referenceRange,
        observationCount: dataPoints.length,
        confidence: 'INSUFFICIENT',
        explanation: `Insufficient historical observations (${dataPoints.length}) to establish a longitudinal trend trajectory.`,
      };
    }

    // Sort chronologically ascending
    const sorted = [...dataPoints].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const latest = sorted[sorted.length - 1];
    const initial = sorted[0];



    // 2. Patient-Specific Baseline Calculation (Rolling Mean of historical points)
    const patientBaseline = this.calculatePatientBaseline(sorted);

    // 3. Magnitude & Percentage Change
    const magnitude = latest.value - initial.value;
    const percentageChange = initial.value !== 0 ? (magnitude / Math.abs(initial.value)) * 100 : 0;

    // 4. Rate of Change (per hour)
    const rateOfChange = this.calculateRateOfChange(sorted);

    // 5. Persistence & Acceleration
    const persistence = this.calculatePersistence(sorted, isHigherBetter);
    const acceleration = this.detectAcceleration(sorted);

    // 6. Volatility (Standard Deviation)
    const volatility = this.calculateVolatility(sorted);

    // 7. Direction Classification
    const direction = this.calculateDirection(
      sorted,
      percentageChange,
      rateOfChange,
      persistence,
      acceleration,
      volatility,
      isHigherBetter
    );

    // 8. Confidence Score
    const confidence = this.calculateTrendConfidence(sorted);

    // 9. Explainable Plain-Language Summary
    const explanation = this.generateTrendExplanation(
      parameterName,
      sorted,
      direction,
      percentageChange,
      rateOfChange,
      patientBaseline,
      referenceRange,
      isHigherBetter
    );

    return {
      parameterName,
      direction,
      magnitude: Number(magnitude.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(1)),
      rateOfChange: Number(rateOfChange.toFixed(3)),
      persistence,
      acceleration,
      volatility: Number(volatility.toFixed(2)),
      patientBaseline: patientBaseline ? Number(patientBaseline.toFixed(2)) : null,
      referenceRange,
      observationCount: sorted.length,
      confidence,
      explanation,
    };
  }

  public static calculatePatientBaseline(sorted: DataPoint[]): number | null {
    if (sorted.length < 2) return null;
    const sum = sorted.reduce((acc, curr) => acc + curr.value, 0);
    return sum / sorted.length;
  }

  public static calculateRateOfChange(sorted: DataPoint[]): number {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const hours = (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 3600000;
    if (hours <= 0) return 0;
    return (last.value - first.value) / hours;
  }

  public static calculatePersistence(sorted: DataPoint[], isHigherBetter: boolean): boolean {
    if (sorted.length < 3) return false;
    let monotonicIncreases = 0;
    let monotonicDecreases = 0;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].value > sorted[i - 1].value) monotonicIncreases++;
      if (sorted[i].value < sorted[i - 1].value) monotonicDecreases++;
    }

    const requiredConsecutive = sorted.length - 1;
    if (!isHigherBetter) {
      return monotonicIncreases === requiredConsecutive; // Persistent worsening if values increase
    } else {
      return monotonicDecreases === requiredConsecutive; // Persistent worsening if values decrease
    }
  }

  public static detectAcceleration(sorted: DataPoint[]): boolean {
    if (sorted.length < 3) return false;
    const rates: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const dt = (new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()) / 3600000;
      if (dt > 0) {
        rates.push((sorted[i].value - sorted[i - 1].value) / dt);
      }
    }
    if (rates.length < 2) return false;
    return rates[rates.length - 1] > rates[rates.length - 2];
  }

  public static calculateVolatility(sorted: DataPoint[]): number {
    if (sorted.length < 2) return 0;
    const mean = sorted.reduce((acc, c) => acc + c.value, 0) / sorted.length;
    const variance = sorted.reduce((acc, c) => acc + Math.pow(c.value - mean, 2), 0) / sorted.length;
    return Math.sqrt(variance);
  }

  public static calculateDirection(
    sorted: DataPoint[],
    pctChange: number,
    rateOfChange: number,
    persistence: boolean,
    acceleration: boolean,
    volatility: number,
    isHigherBetter: boolean
  ): TrendDirection {
    const mean = sorted.reduce((acc, c) => acc + c.value, 0) / sorted.length;
    const relVolatility = mean !== 0 ? (volatility / mean) * 100 : 0;

    if (relVolatility > 35) return 'VOLATILE';

    const worseningChange = isHigherBetter ? pctChange < -15 : pctChange > 15;
    const rapidWorsening = isHigherBetter ? pctChange < -30 || rateOfChange < -1.5 : pctChange > 30 || rateOfChange > 1.5;
    const improvingChange = isHigherBetter ? pctChange > 15 : pctChange < -15;

    if (rapidWorsening || (worseningChange && acceleration)) return 'RAPIDLY WORSENING';
    if (worseningChange || persistence) return 'WORSENING';
    if (improvingChange) return 'IMPROVING';
    return 'STABLE';
  }

  public static calculateTrendConfidence(sorted: DataPoint[]): 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' {
    if (sorted.length >= 5) return 'HIGH';
    if (sorted.length >= 3) return 'MEDIUM';
    if (sorted.length === 2) return 'LOW';
    return 'INSUFFICIENT';
  }

  public static generateTrendExplanation(
    parameterName: string,
    sorted: DataPoint[],
    direction: TrendDirection,
    pctChange: number,
    _rateOfChange: number,
    _baseline: number | null,
    ref: { low: number; high: number },
    _isHigherBetter: boolean
  ): string {

    const latest = sorted[sorted.length - 1].value;
    const initial = sorted[0].value;
    const count = sorted.length;

    let dirText = '';
    if (direction === 'RAPIDLY WORSENING') dirText = 'exhibiting rapid longitudinal escalation';
    else if (direction === 'WORSENING') dirText = 'showing a persistent progressive upward trajectory';
    else if (direction === 'IMPROVING') dirText = 'demonstrating steady clinical improvement';
    else if (direction === 'VOLATILE') dirText = 'showing high variance across recent readings';
    else dirText = 'remaining overall stable';

    let refNote = '';
    if (latest > ref.high) refNote = ` (Exceeds upper reference limit of ${ref.high})`;
    else if (latest < ref.low) refNote = ` (Below lower reference limit of ${ref.low})`;
    else if (direction === 'WORSENING' || direction === 'RAPIDLY WORSENING') {
      refNote = ` (Within standard reference range ${ref.low}-${ref.high}, but trajectory exhibits early deterioration)`;
    }

    return `${parameterName}: Changed from ${initial} to ${latest} across ${count} observations (${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%). ${dirText}${refNote}.`;
  }
}
