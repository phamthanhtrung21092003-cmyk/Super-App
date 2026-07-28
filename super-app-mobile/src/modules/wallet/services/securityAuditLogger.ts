import { deviceBindingService } from './deviceBindingService';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  deviceId: string;
  userId: string;
  action: string;
  status: 'SUCCESS' | 'FAIL' | 'BLOCKED' | 'WARNING';
  riskScore?: number;
  details?: Record<string, any>;
}

const AUDIT_LOGS_KEY = 'vlife_security_audit_logs';

export const securityAuditLogger = {
  /**
   * Log an immutable security audit event
   */
  async logEvent(
    action: string,
    status: 'SUCCESS' | 'FAIL' | 'BLOCKED' | 'WARNING',
    userId: string = 'current_user',
    riskScore?: number,
    details?: Record<string, any>
  ): Promise<AuditLogEntry> {
    const deviceId = await deviceBindingService.getDeviceId();
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      deviceId,
      userId,
      action,
      status,
      riskScore,
      details,
    };

    try {
      const existingStr = await deviceBindingService.getSecureItem(AUDIT_LOGS_KEY);
      const existingLogs: AuditLogEntry[] = existingStr ? JSON.parse(existingStr) : [];
      
      // Append new entry (Immutable Audit Trail, max 200 records stored locally)
      const updatedLogs = [entry, ...existingLogs].slice(0, 200);
      await deviceBindingService.setSecureItem(AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
      console.warn('Failed to append security audit log:', e);
    }

    return entry;
  },

  /**
   * Fetch stored audit logs (For Admin Fraud Monitoring Inspection)
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const existingStr = await deviceBindingService.getSecureItem(AUDIT_LOGS_KEY);
      return existingStr ? JSON.parse(existingStr) : [];
    } catch {
      return [];
    }
  }
};
