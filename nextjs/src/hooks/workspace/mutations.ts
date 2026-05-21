'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface WorkspaceResponse {
    success: boolean
    data: {
        id: string
        name: string
        description?: string
        ownerId: string
        createdAt: string
        updatedAt: string
    }
}

interface CreateWorkspaceInput {
    name: string
    description?: string
}

interface UpdateWorkspaceInput {
    name?: string
    description?: string
}

// Create workspace
export function useCreateWorkspace() {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceResponse, Error, CreateWorkspaceInput>({
        mutationFn: async (data) => {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
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
export function useUpdateWorkspace(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation<WorkspaceResponse, Error, UpdateWorkspaceInput>({
        mutationFn: async (data) => {
            const response = await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update workspace')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        },
    })
}

// Delete workspace
export function useDeleteWorkspace(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to delete workspace')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        },
    })
}