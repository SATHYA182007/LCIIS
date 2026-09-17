import type { Alert, AlertPriority, AlertType, Patient, RiskAssessment } from '../types';
import type { ExplanationSummary } from './explanationService';


export class AlertEngine {
  /**
   * Generates or updates an alert based on clinical findings with deduplication
   */
  public static processAlertEvaluation(
    existingAlerts: Alert[],
    patient: Patient,
    riskAssessment: RiskAssessment,
    explanation: ExplanationSummary
  ): { updatedAlerts: Alert[]; newAlertCreated: Alert | null } {
    // Generate alerts according to situation threshold (Medium: 25-49, High: 50-74, Critical: 75+)
    if (riskAssessment.overallRiskScore < 25 && explanation.concerns.length < 1) {
      return { updatedAlerts: existingAlerts, newAlertCreated: null };
    }

    let alertType: AlertType = 'PHYSIOLOGICAL TREND';
    if (explanation.concerns.length >= 3) alertType = 'MULTI-PARAMETER CHANGE';
    else if (explanation.concerns.some((c) => c.toLowerCase().includes('creatinine') || c.toLowerCase().includes('crp'))) {
      alertType = 'LABORATORY TREND';
    }

    let priority: AlertPriority = 'MEDIUM';
    if (riskAssessment.overallRiskScore >= 75) priority = 'CRITICAL';
    else if (riskAssessment.overallRiskScore >= 50) priority = 'HIGH';
    else priority = 'MEDIUM';

    // Deduplication check: search for existing NEW/ACKNOWLEDGED alert for same patient in last 30 minutes
    const nowMs = Date.now();
    const existingIndex = existingAlerts.findIndex(
      (a) =>
        a.patientId === patient.id &&
        a.type === alertType &&
        (a.status === 'NEW' || a.status === 'ACKNOWLEDGED') &&
        nowMs - new Date(a.createdAt).getTime() < 30 * 60000
    );

    if (existingIndex !== -1) {
      // Update existing alert with latest telemetry & risk
      const updated = [...existingAlerts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        priority,
        advisoryRisk: riskAssessment.overallRiskScore,
        summary: explanation.headline,
        concerns: explanation.concerns,
      };
      return { updatedAlerts: updated, newAlertCreated: null };
    }

    // Create new alert
    const newAlert: Alert = {
      id: `alert-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      ward: patient.ward,
      bed: patient.bed,
      type: alertType,
      priority,
      status: 'NEW',
      summary: explanation.headline,
      concerns: explanation.concerns,
      advisoryRisk: riskAssessment.overallRiskScore,
      createdAt: new Date().toISOString(),
    };

    return {
      updatedAlerts: [newAlert, ...existingAlerts],
      newAlertCreated: newAlert,
    };
  }
}
