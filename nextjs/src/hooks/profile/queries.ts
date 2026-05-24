'use client'

import { useQuery } from '@tanstack/react-query'

interface User {
    id: string
    email: string
    fullName: string
    emailVerifiedAt?: string | null
    createdAt: string
    updatedAt: string
}

interface FetchUserResponse {
    success: boolean
    data: {
        message: string
        user: User
    }
}

// Fetch current user profile
export function useProfile() {
    return useQuery<FetchUserResponse['data'], Error>({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || error.message || 'Failed to fetch profile')
            }

            const json = await response.json()
            return json.data
        },
    })
}
