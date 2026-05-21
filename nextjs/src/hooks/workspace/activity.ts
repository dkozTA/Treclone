'use client'

import { useQuery } from '@tanstack/react-query'

interface Activity {
    id: string
    user: string
    action: string
    target: string
    timestamp: string
}

interface FetchActivitiesResponse {
    success: boolean
    data: {
        message: string
        activities: Activity[]
    }
}

export function useActivities(workspaceId: string) {
    return useQuery<FetchActivitiesResponse['data'], Error>({
        queryKey: ['activities', workspaceId],
        queryFn: async () => {
            const response = await fetch(
                `/api/workspaces/${workspaceId}/activity`,
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
                throw new Error(error.message || 'Failed to fetch activities')
            }

            const json = await response.json()
            return json.data
        },
        enabled: !!workspaceId,
    })
}