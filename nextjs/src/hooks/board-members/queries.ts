'use client';

import { useQuery } from '@tanstack/react-query';

export type BoardMemberRole = 'admin' | 'editor' | 'viewer';

export interface BoardMember {
    id: string;
    userId: string;
    boardId: string;
    role: BoardMemberRole;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    joinedAt: string;
}

export interface BoardMembersResponse {
    success: boolean;
    data: BoardMember[];
}

export const boardMembersQueryKey = (
    workspaceId: string,
    boardId: string
) => ['board-members', workspaceId, boardId] as const;

function normalizeBoardMember(member: any): BoardMember {
    return {
        id: String(member.id),
        userId: String(member.userId),
        boardId: String(member.boardId),
        role: member.role,
        user: {
            id: String(member.user?.id ?? ''),
            email: String(member.user?.email ?? ''),
            fullName: String(member.user?.fullName ?? member.user?.name ?? ''),
        },
        joinedAt: String(member.joinedAt ?? member.createdAt ?? new Date().toISOString()),
    };
}

export function useBoardMembers(workspaceId: string, boardId: string) {
    return useQuery<BoardMembersResponse, Error>({
        queryKey: boardMembersQueryKey(workspaceId, boardId),
        enabled: !!workspaceId && !!boardId,
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/members`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || json.message || 'Failed to fetch board members');
            }

            return {
                success: !!json.success,
                data: Array.isArray(json?.data?.members)
                    ? json.data.members.map(normalizeBoardMember)
                    : [],
            };
        },
    });
}