import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenFromCookie } from '@/lib/utils/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-utils';
import prisma from '@/lib/db/prisma';

interface ActivityDisplay {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
}

function parseMetadata(metadata: unknown): Record<string, unknown> | null {
    if (!metadata) return null;
    if (typeof metadata === 'object') return metadata as Record<string, unknown>;
    if (typeof metadata === 'string') {
        try {
            return JSON.parse(metadata) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
    return null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params;
    const { valid, userId } = verifyTokenFromCookie(request);

    if (!valid || !userId) {
        return NextResponse.json(errorResponse('Unauthorized', 401), {
            status: 401,
        });
    }

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: BigInt(workspaceId) },
            select: { ownerId: true },
        });

        if (!workspace) {
            return NextResponse.json(errorResponse('Workspace not found', 404), {
                status: 404,
            });
        }

        const isOwner = workspace.ownerId === BigInt(userId);
        const member = isOwner ? null : await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: BigInt(userId),
                    workspaceId: BigInt(workspaceId),
                },
            },
        });

        if (!isOwner && !member) {
            return NextResponse.json(errorResponse('Access denied', 403), {
                status: 403,
            });
        }

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
            take: 50,
        });

        const activities: ActivityDisplay[] = auditLogs.map((log: any) => {
            let action = '';
            let target = '';
            const metadata = parseMetadata(log.metadata);

            switch (log.entity) {
                case 'BOARD':
                    action = `${log.action.toLowerCase()}ed board`;
                    target =
                        (metadata?.title as string | undefined) ||
                        'Unknown';
                    break;
                case 'CARD':
                    action = `${log.action.toLowerCase()}ed card`;
                    target =
                        (metadata?.title as string | undefined) ||
                        'Unknown';
                    break;
                case 'LIST':
                    action = `${log.action.toLowerCase()}ed list`;
                    target =
                        (metadata?.title as string | undefined) ||
                        'Unknown';
                    break;
                case 'MEMBER':
                    action = `${log.action.toLowerCase()} member`;
                    target =
                        (metadata?.email as string | undefined) ||
                        'Unknown';
                    break;
                default:
                    action = log.action.toLowerCase();
                    target = 'Resource';
            }

            return {
                id: log.id.toString(),
                user: log.user.fullName || log.user.email,
                action,
                target,
                timestamp: log.createdAt.toISOString(),
            };
        });

        return NextResponse.json(
            successResponse({
                message: 'Activities fetched successfully',
                activities,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to fetch activities:', error);
        return NextResponse.json(
            errorResponse('Failed to fetch activities', 500),
            { status: 500 }
        );
    }
}
