import type { AuditLog, UserRole } from '../types';


export class AuditService {
  private static logs: AuditLog[] = [];

  public static initialize(initialLogs: AuditLog[]) {
    this.logs = [...initialLogs];
  }

  public static logAction(
    userId: string,
    userName: string,
    role: UserRole,
    action: string,
    resource: string,
    details: string,
    patientId?: string,
    previousValue?: string,
    newValue?: string
  ): AuditLog {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      role,
      action,
      resource,
      patientId,
      previousValue,
      newValue,
      details,
    };

    this.logs = [entry, ...this.logs];
    return entry;
  }

  public static getLogs(): AuditLog[] {
    return [...this.logs];
  }
}
