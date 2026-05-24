'use client'

import { useQuery } from '@tanstack/react-query'

interface WorkspaceMember {
    id: string
    userId: string
    workspaceId: string
    role: 'owner' | 'admin' | 'member'
    user: {
        id: string
        email: string
        name: string
    }
    createdAt: string
    updatedAt: string
}

interface FetchWorkspaceMembersResponse {
    success: boolean
    data: WorkspaceMember[]
}

interface FetchWorkspaceMemberResponse {
    success: boolean
    data: WorkspaceMember
}

export function useWorkspaceMembers(workspaceId: string) {
    return useQuery<FetchWorkspaceMembersResponse, Error>({
        queryKey: ['workspace-members', workspaceId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch workspace members')
            }

            const json = await response.json()
            const members = json.data?.members ?? []

            return {
                success: json.success,
                data: members.map((member: {
                    id: string
                    userId: string
                    workspaceId: string
                    role: 'owner' | 'admin' | 'member'
                    joinedAt?: string
                    createdAt?: string
                    updatedAt?: string
                    user: {
                        id: string
                        email: string
                        fullName?: string
                        name?: string
                    }
                }) => ({
                    id: member.id,
                    userId: member.userId,
                    workspaceId: member.workspaceId,
                    role: member.role,
                    user: {
                        id: member.user.id,
                        email: member.user.email,
                        name: member.user.name ?? member.user.fullName ?? member.user.email,
                    },
                    createdAt: member.createdAt ?? member.joinedAt ?? new Date().toISOString(),
                    updatedAt: member.updatedAt ?? member.joinedAt ?? new Date().toISOString(),
                })),
            }
        },
        enabled: !!workspaceId,
    })
}

export function useWorkspaceMember(
    workspaceId: string,
    memberId: string
) {
    return useQuery<FetchWorkspaceMemberResponse, Error>({
        queryKey: ['workspace-member', workspaceId, memberId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/members/${memberId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch workspace member')
            }

            const json = await response.json()
            return json.data
        },
        enabled: !!workspaceId && !!memberId,
    })
}
