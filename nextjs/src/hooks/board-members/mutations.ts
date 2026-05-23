'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    boardMembersQueryKey,
    type BoardMember,
    type BoardMemberRole,
    type BoardMembersResponse,
} from './queries';

interface AddBoardMemberInput {
    email: string;
    role: BoardMemberRole;
}

interface RemoveBoardMemberInput {
    memberId: string;
}

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

function createTempMember(email: string, boardId: string, role: BoardMemberRole): BoardMember {
    const now = new Date().toISOString();

    return {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: 'pending',
        boardId,
        role,
        user: {
            id: 'pending',
            email,
            fullName: email.split('@')[0] || email,
        },
        joinedAt: now,
    };
}

export function useAddBoardMember(workspaceId: string, boardId: string) {
    const queryClient = useQueryClient();
    const queryKey = boardMembersQueryKey(workspaceId, boardId);

    return useMutation<BoardMember, Error, AddBoardMemberInput, { previous?: BoardMembersResponse; tempId: string }>({
        mutationFn: async (data) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/members`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || json.error || 'Failed to add board member');
            }

            return normalizeBoardMember(json?.data?.member ?? json?.data);
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<BoardMembersResponse>(queryKey);
            const tempMember = createTempMember(data.email, boardId, data.role);

            queryClient.setQueryData<BoardMembersResponse>(queryKey, (current) => ({
                success: current?.success ?? true,
                data: [tempMember, ...(current?.data ?? [])],
            }));

            return { previous, tempId: tempMember.id };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSuccess: (member, _variables, context) => {
            queryClient.setQueryData<BoardMembersResponse>(queryKey, (current) => {
                if (!current) {
                    return { success: true, data: [member] };
                }

                return {
                    ...current,
                    data: current.data.map((item) => (item.id === context?.tempId ? member : item)),
                };
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}

export function useRemoveBoardMember(workspaceId: string, boardId: string) {
    const queryClient = useQueryClient();
    const queryKey = boardMembersQueryKey(workspaceId, boardId);

    return useMutation<void, Error, RemoveBoardMemberInput, { previous?: BoardMembersResponse }>({
        mutationFn: async (data) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/members`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ memberId: data.memberId }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || json.error || 'Failed to remove board member');
            }
        },
        onMutate: async ({ memberId }) => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<BoardMembersResponse>(queryKey);

            queryClient.setQueryData<BoardMembersResponse>(queryKey, (current) => ({
                success: current?.success ?? true,
                data: (current?.data ?? []).filter((member) => member.id !== memberId),
            }));

            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}