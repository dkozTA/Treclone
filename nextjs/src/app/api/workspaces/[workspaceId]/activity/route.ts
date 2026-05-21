import { NextRequest } from 'next/server'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse, successResponse } from '@/lib/utils/api-utils'
import prisma from '@/lib/db/prisma'

interface ActivityDisplay {
    id: string
    user: string
    action: string
    target: string
    timestamp: string
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    try {
        // Verify user is member of workspace
        const member = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: BigInt(userId),
                    workspaceId: BigInt(workspaceId),
                },
            },
        })

        if (!member) {
            return errorResponse('Access denied', 403)
        }

        // Fetch recent audit logs from workspace
        const auditLogs = await prisma.auditLog.findMany({
            where: {
                workspaceId: BigInt(workspaceId),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to last 50 activities
        })

        // Transform audit logs to activity display format
        const activities: ActivityDisplay[] = auditLogs.map((log) => {
            let action = ''
            let target = ''

            // Format action and target based on entity type
            switch (log.entity) {
                case 'BOARD':
                    action = `${log.action.toLowerCase()}ed board`
                    target = log.metadata ? JSON.parse(log.metadata).title || 'Unknown' : 'Unknown'
                    break
                case 'CARD':
                    action = `${log.action.toLowerCase()}ed card`
                    target = log.metadata ? JSON.parse(log.metadata).title || 'Unknown' : 'Unknown'
                    break
                case 'LIST':
                    action = `${log.action.toLowerCase()}ed list`
                    target = log.metadata ? JSON.parse(log.metadata).title || 'Unknown' : 'Unknown'
                    break
                case 'MEMBER':
                    action = `${log.action.toLowerCase()} member`
                    target = log.metadata ? JSON.parse(log.metadata).email || 'Unknown' : 'Unknown'
                    break
                default:
                    action = log.action.toLowerCase()
                    target = 'Resource'
            }

            return {
                id: log.id.toString(),
                user: log.user.fullName || log.user.email,
                action,
                target,
                timestamp: log.createdAt.toISOString(),
            }
        })

        return successResponse({
            message: 'Activities fetched successfully',
            activities,
        })
    } catch (error) {
        console.error('Failed to fetch activities:', error)
        return errorResponse('Failed to fetch activities', 500)
    }
}