'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface AddMemberInput {
    email: string
    role: 'member' | 'admin'
}

interface UpdateMemberInput {
    role: 'member' | 'admin'
}

export function useAddWorkspaceMember(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AddMemberInput) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to add member')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-members', workspaceId],
            })
            queryClient.invalidateQueries({
                queryKey: ['workspaces'],
            })
        },
    })
}

export function useUpdateWorkspaceMember(
    workspaceId: string,
    memberId: string
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UpdateMemberInput) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members/${memberId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update member')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-members', workspaceId],
            })
            queryClient.invalidateQueries({
                queryKey: ['workspace-member', workspaceId, memberId],
            })
        },
    })
}

export function useRemoveWorkspaceMember(
    workspaceId: string,
    memberId: string
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members/${memberId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to remove member')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-members', workspaceId],
            })
            queryClient.invalidateQueries({
                queryKey: ['workspaces'],
            })
        },
    })
}
