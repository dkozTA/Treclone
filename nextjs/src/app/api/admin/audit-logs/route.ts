import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'
import { getAuditLogs } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
    try {
        const { valid, userId } = verifyTokenFromCookie(request)

        if (!valid || !userId) {
            return errorResponse('Unauthorized', 401)
        }

        // TODO: Add admin role check
        const { searchParams } = new URL(request.url)
        const workspaceId = searchParams.get('workspaceId')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        if (!workspaceId) {
            return errorResponse('workspaceId is required', 400)
        }

        const logs = await getAuditLogs(workspaceId, { limit, offset })

        return successResponse({
            message: 'Audit logs retrieved',
            logs,
        })
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch audit logs'
        return errorResponse(errorMessage, 400)
    }
}