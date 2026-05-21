'use client';

import { useQuery } from '@tanstack/react-query';

export interface Preferences {
    emailNotifications: boolean;
    darkMode: boolean;
}

interface FetchPreferencesResponse {
    success: boolean;
    data: Preferences;
}

export function usePreferencesSettings() {
    return useQuery<FetchPreferencesResponse['data'], Error>({
        queryKey: ['preferences'],
        queryFn: async () => {
            const response = await fetch('/api/settings/preferences', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch preferences');
            }

            const json: FetchPreferencesResponse = await response.json();
            return json.data;
        },
    });
}