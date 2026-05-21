import prisma from '@/lib/db/prisma'

interface CreateAuditLogParams {
    userId: bigint
    action: string
    entity: string
    entityId: bigint
    workspaceId?: bigint
    changes?: Record<string, any>
    status: 'SUCCESS' | 'FAILURE'
    errorMessage?: string
    metadata?: Record<string, any>
}

export async function createAuditLog({
    userId,
    action,
    entity,
    entityId,
    workspaceId,
    changes,
    status,
    errorMessage,
    metadata,
}: CreateAuditLogParams) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                workspaceId,
                changes: changes ? JSON.stringify(changes) : null,
                status,
                errorMessage: errorMessage || null,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        })
    } catch (error) {
        console.error('Failed to create audit log:', error)
        // Don't throw - audit logging should not break the main operation
    }
}