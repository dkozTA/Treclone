export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    READ = 'READ',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

export enum AuditEntity {
    USER = 'USER',
    WORKSPACE = 'WORKSPACE',
    BOARD = 'BOARD',
    LIST = 'LIST',
    CARD = 'CARD',
    MEMBER = 'MEMBER',
}

export interface AuditLogData {
    userId: bigint | string
    action: AuditAction
    entity: AuditEntity
    entityId: string
    workspaceId?: string
    changes?: Record<string, any> // Before/after values
    ipAddress: string
    userAgent?: string
    status: 'SUCCESS' | 'FAILURE'
    errorMessage?: string
    metadata?: Record<string, any>
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        // If your schema doesn't have an AuditLog table yet, you can use a file-based approach
        // or send to an external logging service

        const logEntry = {
            userId: typeof data.userId === 'string' ? BigInt(data.userId) : data.userId,
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            workspaceId: data.workspaceId ? BigInt(data.workspaceId) : null,
            changes: data.changes ? JSON.stringify(data.changes) : null,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent || null,
            status: data.status,
            errorMessage: data.errorMessage || null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            timestamp: new Date(),
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[AUDIT]', logEntry)
        }

        // TODO: Uncomment when AuditLog table is added to schema
        // await prisma.auditLog.create({ data: logEntry })

        // Alternative: Send to external service
        if (process.env.AUDIT_LOG_ENDPOINT) {
            await fetch(process.env.AUDIT_LOG_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry),
            }).catch((err) => console.error('Failed to send audit log:', err))
        }
    } catch (error) {
        console.error('Failed to create audit log:', error)
        // Don't throw - audit logging failure shouldn't break the API
    }
}

export async function getAuditLogs(
    workspaceId: string,
    options: { limit?: number; offset?: number; userId?: string } = {}
) {
    // Placeholder - implement when AuditLog table is added
    console.log('Fetching audit logs for workspace:', workspaceId, options)
    return []
}