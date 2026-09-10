import type { DeviceConnectionStatus, VitalMeasurement } from '../types';


export interface HardwareTelemetryPayload {
  deviceId: string;
  patientId: string;
  timestamp: number;
  heartRate?: number;
  spo2?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  temperature?: number;
  batteryLevel?: number;
}

export class DeviceService {
  /**
   * Validates raw sensor telemetry to reject out-of-range impossible measurements
   */
  public static validateTelemetry(payload: HardwareTelemetryPayload): {
    isValid: boolean;
    errors: string[];
    validatedVitals: Record<string, VitalMeasurement | undefined>;
  } {
    const errors: string[] = [];
    const validatedVitals: Record<string, VitalMeasurement | undefined> = {};
    const timestampStr = payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString();

    // SpO2 Validation (Normal physiological bounds: 50% - 100%)
    if (payload.spo2 !== undefined) {
      if (payload.spo2 < 50 || payload.spo2 > 100) {
        errors.push(`Invalid SpO2 reading (${payload.spo2}%): Out of valid physiological bounds (50-100%).`);
      } else {
        validatedVitals.spo2 = {
          value: payload.spo2,
          unit: '%',
          timestamp: timestampStr,
          source: 'LIVE_SENSOR',
          deviceId: payload.deviceId,
          quality: payload.spo2 < 90 ? 'WARNING' : 'GOOD',
        };
      }
    }

    // Heart Rate Validation (Normal bounds: 20 - 260 BPM)
    if (payload.heartRate !== undefined) {
      if (payload.heartRate < 20 || payload.heartRate > 260) {
        errors.push(`Invalid Heart Rate reading (${payload.heartRate} BPM): Out of valid bounds.`);
      } else {
        validatedVitals.heartRate = {
          value: payload.heartRate,
          unit: 'BPM',
          timestamp: timestampStr,
          source: 'LIVE_SENSOR',
          deviceId: payload.deviceId,
          quality: payload.heartRate > 120 || payload.heartRate < 50 ? 'WARNING' : 'GOOD',
        };
      }
    }

    // Respiratory Rate Validation (Normal bounds: 4 - 60 /min)
    if (payload.respiratoryRate !== undefined) {
      if (payload.respiratoryRate < 4 || payload.respiratoryRate > 60) {
        errors.push(`Invalid Respiratory Rate reading (${payload.respiratoryRate}/min).`);
      } else {
        validatedVitals.respiratoryRate = {
          value: payload.respiratoryRate,
          unit: '/min',
          timestamp: timestampStr,
          source: 'LIVE_SENSOR',
          deviceId: payload.deviceId,
          quality: payload.respiratoryRate > 24 ? 'WARNING' : 'GOOD',
        };
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedVitals,
    };
  }

  /**
   * Calculates connection status based on heartbeat timestamp
   */
  public static evaluateDeviceStatus(lastSeenIso: string): DeviceConnectionStatus {
    const lastSeenMs = new Date(lastSeenIso).getTime();
    const diffMins = (Date.now() - lastSeenMs) / 60000;

    if (diffMins <= 2) return 'ONLINE';
    if (diffMins <= 10) return 'WARNING';
    return 'OFFLINE';
  }
}
