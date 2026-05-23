import { NextRequest } from 'next/server';
import { BoardMemberController } from '@/lib/controllers/board-member.controller';
import { verifyTokenFromCookie } from '@/lib/utils/auth';
import { badRequest, unauthorized } from '@/lib/utils/api-utils';

const controller = new BoardMemberController();

type RouteParams = {
    workspaceId: string;
    boardId: string;
};

function parseBoardId(boardId: string): bigint | null {
    try {
        return BigInt(boardId);
    } catch {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteParams> }
) {
    const { boardId } = await params;
    const parsedBoardId = parseBoardId(boardId);

    if (!parsedBoardId) {
        return badRequest('Invalid board ID');
    }

    const { valid, userId } = verifyTokenFromCookie(request);

    if (!valid || !userId) {
        return unauthorized('Unauthorized');
    }

    return controller.getMembers(request, parsedBoardId, userId);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<RouteParams> }
) {
    const { boardId } = await params;
    const parsedBoardId = parseBoardId(boardId);

    if (!parsedBoardId) {
        return badRequest('Invalid board ID');
    }

    const { valid, userId } = verifyTokenFromCookie(request);

    if (!valid || !userId) {
        return unauthorized('Unauthorized');
    }

    return controller.addMember(request, parsedBoardId, userId);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<RouteParams> }
) {
    const { boardId } = await params;
    const parsedBoardId = parseBoardId(boardId);

    if (!parsedBoardId) {
        return badRequest('Invalid board ID');
    }

    const { valid, userId } = verifyTokenFromCookie(request);

    if (!valid || !userId) {
        return unauthorized('Unauthorized');
    }

    return controller.removeMember(request, parsedBoardId, userId);
}
