'use client'

import { useQuery } from '@tanstack/react-query'

interface Workspace {
    id: string
    name: string
    description?: string
    visibility: string
    createdAt: string
    updatedAt: string
    _count?: { boards: number }
}

interface FetchWorkspacesResponse {
    success: boolean
    message: string
    workspaces: Workspace[]
}

interface WorkspaceSettings {
    visibility: 'private' | 'team' | 'public'
    notifications: {
        dailySummary: boolean
        mentionAlerts: boolean
    }
}

interface WorkspaceSettingsResponse {
    success: boolean
    message: string
    settings: WorkspaceSettings
}

// Fetch all workspaces
export function useWorkspaces(token?: string) {
    return useQuery<FetchWorkspacesResponse, Error>({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const response = await fetch('/api/workspaces', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch workspaces')
            }

            return response.json()
        },
        enabled: !!token || !!localStorage.getItem('authToken'),
    })
}

// Fetch workspace settings
export function useWorkspaceSettings(workspaceId: string, token?: string) {
    return useQuery<WorkspaceSettingsResponse, Error>({
        queryKey: ['workspaceSettings', workspaceId],
        queryFn: async () => {
            const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || localStorage.getItem('authToken')}`,
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch workspace settings')
            }

            return response.json()
        },
        enabled: !!token || !!localStorage.getItem('authToken'),
    })
}