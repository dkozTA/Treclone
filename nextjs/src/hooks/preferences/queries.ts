'use client';

import { useQuery } from '@tanstack/react-query';

export interface Preferences {
  id: string;
  email: string;
  fullName: string;
  emailVerifiedAt: string | null;
  emailNotifications: boolean;
  darkMode: boolean;
}

interface FetchPreferencesResponse {
  success: boolean;
  data: {
    preferences: Preferences;
  };
}

export function usePreferencesSettings() {
  return useQuery<Preferences, Error>({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to fetch preferences');
      }

      const json: FetchPreferencesResponse = await response.json();
      return json.data.preferences;
    },
  });
}
