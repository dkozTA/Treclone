import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import {
    errorResponse,
    successResponse,
} from '@/lib/utils/api-utils';
import { verifyTokenFromCookie } from '@/lib/utils/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string; boardId: string }> }
) {
    const { workspaceId, boardId } = await params;
    const { valid, userId } = verifyTokenFromCookie(request);

    if (!valid || !userId) {
        return NextResponse.json(errorResponse('Unauthorized', 401), {
            status: 401,
        });
    }

    const board = await prisma.board.findUnique({
        where: {
            id: BigInt(boardId),
        },
        select: {
            id: true,
            ownerId: true,
            workspaceId: true,
        },
    });

    if (board?.workspaceId?.toString() !== workspaceId) {
        return NextResponse.json(errorResponse('Board not found', 404), {
            status: 404,
        });
    }

    if (board.ownerId !== userId) {
        return NextResponse.json(
            errorResponse('Forbidden - you do not own this board', 403),
            { status: 403 }
        );
    }

    const cards = await prisma.card.findMany({
        where: {
            list: {
                boardId: board.id,
            },
        },
        orderBy: [
            { listId: 'asc' },
            { position: 'asc' },
        ],
    });

    return NextResponse.json(successResponse(cards));
}