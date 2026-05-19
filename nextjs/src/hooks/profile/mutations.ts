'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateProfileInput {
    fullName?: string
    password?: string
    passwordConfirmation?: string
}

interface ProfileResponse {
    success: boolean
    message: string
    user?: {
        id: string
        email: string
        fullName: string
        updatedAt: string
    }
}

// Update user profile
export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation<ProfileResponse, Error, UpdateProfileInput>({
        mutationFn: async (data) => {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update profile')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
    })
}