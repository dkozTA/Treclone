'use client'

import { useQuery } from '@tanstack/react-query'

interface WorkspaceNotifications {
    dailySummary?: boolean
    mentionAlerts?: boolean
}

interface WorkspaceSettings {
    id: string
    visibility: 'private' | 'team' | 'public'
    notifications: WorkspaceNotifications
    createdAt?: string
    updatedAt?: string
}

interface FetchWorkspaceSettingsResponse {
    success: boolean
    data: {
        message: string
        settings: WorkspaceSettings
    }
}

export function useWorkspaceSettings(workspaceId: string) {
    return useQuery<FetchWorkspaceSettingsResponse['data'], Error>({
        queryKey: ['workspace-settings', workspaceId],
        queryFn: async () => {
            const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch workspace settings')
            }

            const json = await response.json()
            return json.data
        },
        enabled: !!workspaceId,
    })
}