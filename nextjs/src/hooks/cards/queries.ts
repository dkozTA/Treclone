'use client'

import { useQuery } from '@tanstack/react-query'

interface Card {
    id: string
    title: string
    description?: string
    assigneeId?: string
    position?: number
    listId: string
    createdAt: string
    updatedAt: string
}

interface FetchCardsResponse {
    success: boolean
    data: Card[]
}

interface FetchCardResponse {
    success: boolean
    data: Card
}

// Fetch all cards in a list
export function useCards(
    workspaceId: string,
    boardId: string,
    listId: string
) {
    return useQuery<FetchCardsResponse, Error>({
        queryKey: ['cards', workspaceId, boardId, listId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`,
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
                throw new Error(error.message || 'Failed to fetch cards')
            }

            return response.json()
        },
        enabled: !!workspaceId && !!boardId && !!listId,
    })
}

// Fetch single card
export function useCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    cardId: string
) {
    return useQuery<FetchCardResponse, Error>({
        queryKey: ['card', workspaceId, boardId, listId, cardId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
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
                throw new Error(error.message || 'Failed to fetch card')
            }

            return response.json()
        },
        enabled: !!workspaceId && !!boardId && !!listId && !!cardId,
    })
}

// Fetch all cards in a board (across all lists)
export function useAllBoardCards(
    workspaceId: string,
    boardId: string
) {
    return useQuery<FetchCardsResponse, Error>({
        queryKey: ['all-board-cards', workspaceId, boardId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/boards/${boardId}/cards`,
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
                throw new Error(error.message || 'Failed to fetch board cards')
            }

            return response.json()
        },
        enabled: !!workspaceId && !!boardId,
    })
}

// Fetch single card by cardId (searches across all board cards)
export function useCardByBoardId(
    workspaceId: string,
    boardId: string,
    cardId: string
) {
    const { data: allCards, isLoading, error } = useAllBoardCards(workspaceId, boardId)

    const card = allCards?.data?.find((c: Card) => c.id === cardId)

    return {
        data: card ? { success: true, data: card } : null,
        isLoading,
        error,
    }
}