export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditResource = "USER" | "ROLE" | "SHORTLINK";

export type AuditActor = {
  userId: string | null;
  name: string | null;
  email: string | null;
};

export type AuditRequestContext = {
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

export type CreateAuditLogInput = {
  actor: AuditActor;
  request: AuditRequestContext;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  changedFields?: string[];
  metadata?: Record<string, unknown>;
};
