'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CardResponse {
    success: boolean
    data: {
        message: string
        card: {
            id: string
            title: string
            description?: string
            assigneeUserId?: string
            position: number
            listId: string
            createdAt: string
            updatedAt: string
        }
    }
}

interface CreateCardInput {
    title: string
    description?: string
    assigneeUserId?: string
}

interface UpdateCardInput {
    title?: string
    description?: string
    assigneeUserId?: string
}

interface MoveCardInput {
    listId: string
    position: number
}

// Create card
export function useCreateCard(
    workspaceId: string,
    boardId: string,
    listId: string
) {
    const queryClient = useQueryClient()

    return useMutation<CardResponse, Error, CreateCardInput>({
        mutationFn: async (data) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`,
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
                throw new Error(error.message || 'Failed to create card')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId, boardId, listId],
            })
            queryClient.invalidateQueries({
                queryKey: ['all-board-cards', workspaceId, boardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['lists', workspaceId, boardId],
            })
            queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] })
        },
    })
}

// Update card
export function useUpdateCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    cardId: string
) {
    const queryClient = useQueryClient()

    return useMutation<CardResponse, Error, UpdateCardInput>({
        mutationFn: async (data) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
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
                throw new Error(error.message || 'Failed to update card')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId, boardId, listId],
            })
            queryClient.invalidateQueries({
                queryKey: ['card', workspaceId, boardId, listId, cardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['all-board-cards', workspaceId, boardId],
            })
        },
    })
}

// Delete card
export function useDeleteCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    cardId: string
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
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
                throw new Error(error.message || 'Failed to delete card')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId, boardId, listId],
            })
            queryClient.invalidateQueries({
                queryKey: ['all-board-cards', workspaceId, boardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['lists', workspaceId, boardId],
            })
            queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] })
        },
    })
}

// Move card to different list
export function useMoveCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    cardId: string
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: MoveCardInput) => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/move`,
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
                throw new Error(error.message || 'Failed to move card')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId, boardId, listId],
            })
            queryClient.invalidateQueries({
                queryKey: ['all-board-cards', workspaceId, boardId],
            })
            queryClient.invalidateQueries({
                queryKey: ['lists', workspaceId, boardId],
            })
            queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] })
        },
    })
}

// Duplicate card
export function useDuplicateCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    cardId: string
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/duplicate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to duplicate card')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['cards', workspaceId, boardId, listId],
            })
            queryClient.invalidateQueries({
                queryKey: ['all-board-cards', workspaceId, boardId],
            })
        },
    })
}
