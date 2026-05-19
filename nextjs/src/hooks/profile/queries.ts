'use client'

import { useQuery } from '@tanstack/react-query'

interface UserProfile {
    id: string
    email: string
    fullName: string
    createdAt: string
    updatedAt: string
}

interface ProfileResponse {
    success: boolean
    message: string
    user: UserProfile
}

export function useProfile() {
    return useQuery<ProfileResponse, Error>({
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
                throw new Error(error.message || 'Failed to fetch profile')
            }

            return response.json()
        },
    })
}