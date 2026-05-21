'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Preferences } from './queries';

type UpdatePreferencesInput = Partial<Preferences>;

interface UpdatePreferencesResponse {
    success: boolean;
    data: Preferences;
}

export function useUpdatePreferences() {
    const queryClient = useQueryClient();

    return useMutation<UpdatePreferencesResponse['data'], Error, UpdatePreferencesInput>({
        mutationFn: async (payload) => {
            const response = await fetch('/api/settings/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update preferences');
            }

            const json: UpdatePreferencesResponse = await response.json();
            return json.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['preferences'], data);
        },
    });
}