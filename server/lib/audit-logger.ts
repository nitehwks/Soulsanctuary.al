import crypto from 'crypto';
import { db } from '../../db';
import { auditLogs } from '@shared/schema';

export type AuditAction = 
  | 'data_access'
  | 'data_create'
  | 'data_update'
  | 'data_delete'
  | 'data_export'
  | 'encryption'
  | 'decryption'
  | 'login'
  | 'logout'
  | 'preference_change'
  | 'consent_given'
  | 'consent_revoked'
  | 'data_retention_cleanup'
  | 'security_event';

export type ResourceType = 
  | 'message'
  | 'conversation'
  | 'user_context'
  | 'mood_observation'
  | 'wellness_assessment'
  | 'user_preferences'
  | 'user'
  | 'system';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

let previousHash = 'genesis';

function computeChainHash(entry: AuditLogEntry, timestamp: string): string {
  const dataToHash = JSON.stringify({
    previousHash,
    timestamp,
    ...entry
  });
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const chainHash = computeChainHash(entry, timestamp);
  
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId || null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      success: entry.success,
      errorMessage: entry.errorMessage || null,
      chainHash,
      previousHash
    });
    
    previousHash = chainHash;
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export async function logDataAccess(
  userId: string, 
  resourceType: ResourceType, 
  resourceId: string,
  accessReason?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'data_access',
    resourceType,
    resourceId,
    details: accessReason ? { reason: accessReason } : undefined,
    success: true
  });
}

export async function logDataModification(
  userId: string,
  action: 'data_create' | 'data_update' | 'data_delete',
  resourceType: ResourceType,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    success: true
  });
}

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  details: Record<string, unknown>,
  success: boolean = true
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'security_event',
    resourceType: 'system',
    details: { eventType, ...details },
    success
  });
}

export async function logConsentChange(
  userId: string,
  consentType: string,
  granted: boolean,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId,
    action: granted ? 'consent_given' : 'consent_revoked',
    resourceType: 'user_preferences',
    details: { consentType, ...details },
    success: true
  });
}

export async function logDataExport(
  userId: string,
  exportFormat: string,
  resourceTypes: ResourceType[]
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'data_export',
    resourceType: 'system',
    details: { format: exportFormat, includedResources: resourceTypes },
    success: true
  });
}
