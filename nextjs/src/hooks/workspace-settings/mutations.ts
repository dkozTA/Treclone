'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface WorkspaceSettingsResponse {
    success: boolean
    data: {
        id: string
        workspaceId: string
        visibility: 'private' | 'team' | 'public'
        dailySummary: boolean
        mentionAlerts: boolean
        createdAt: string
        updatedAt: string
    }
}

interface UpdateWorkspaceSettingsInput {
    visibility?: 'private' | 'team' | 'public'
    notifications?: {
        dailySummary?: boolean
        mentionAlerts?: boolean
    }
}

export function useUpdateWorkspaceSettings(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceSettingsResponse, Error, UpdateWorkspaceSettingsInput>({
        mutationFn: async (data) => {
            // Translate form shape to API payload
            const payload: Record<string, any> = {}
            if (data.visibility !== undefined) payload.visibility = data.visibility
            if (data.notifications) {
                if (data.notifications.dailySummary !== undefined) payload.dailySummary = data.notifications.dailySummary
                if (data.notifications.mentionAlerts !== undefined) payload.mentionAlerts = data.notifications.mentionAlerts
            }

            const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update workspace settings')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-settings', workspaceId] })
        },
    })
}

export function useDeleteWorkspaceSettings(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to delete workspace settings')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-settings', workspaceId] })
        },
    })
}