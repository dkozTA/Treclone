'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateWorkspaceInput {
    name: string
    description?: string
}

interface UpdateWorkspaceInput {
    name?: string
    description?: string
}

interface UpdateWorkspaceSettingsInput {
    visibility?: 'private' | 'team' | 'public'
    notifications?: {
        dailySummary?: boolean
        mentionAlerts?: boolean
    }
}

interface WorkspaceResponse {
    success: boolean
    message: string
    workspace?: {
        id: string
        name: string
        description?: string
        ownerId: string
        createdAt: string
        updatedAt: string
    }
}

interface WorkspaceSettingsResponse {
    success: boolean
    message: string
    settings?: {
        visibility: string
        notifications: {
            dailySummary: boolean
            mentionAlerts: boolean
        }
    }
}

// Create workspace
export function useCreateWorkspace(token?: string) {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceResponse, Error, CreateWorkspaceInput>({
        mutationFn: async (data) => {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create workspace')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        },
    })
}

// Update workspace
export function useUpdateWorkspace(workspaceId: string, token?: string) {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceResponse, Error, UpdateWorkspaceInput>({
        mutationFn: async (data) => {
            const response = await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update workspace')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
            queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
        },
    })
}

// Delete workspace
export function useDeleteWorkspace(workspaceId: string, token?: string) {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceResponse, Error>({
        mutationFn: async () => {
            const response = await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to delete workspace')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
            queryClient.removeQueries({ queryKey: ['workspace', workspaceId] })
        },
    })
}

// Update workspace settings
export function useUpdateWorkspaceSettings(
    workspaceId: string,
    token?: string
) {
    const queryClient = useQueryClient()

    return useMutation<
        WorkspaceSettingsResponse,
        Error,
        UpdateWorkspaceSettingsInput
    >({
        mutationFn: async (data) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/settings`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                    },
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update workspace settings')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspaceSettings', workspaceId],
            })
        },
    })
}