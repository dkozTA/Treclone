'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Preferences } from './queries';

type UpdatePreferencesInput = Partial<
  Pick<Preferences, 'emailNotifications' | 'darkMode'>
>;

interface UpdatePreferencesResponse {
  success: boolean;
  data: {
    preferences: Preferences;
  };
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation<Preferences, Error, UpdatePreferencesInput>({
    mutationFn: async (payload) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to update preferences');
      }

      const json: UpdatePreferencesResponse = await response.json();
      return json.data.preferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
    },
  });
}
