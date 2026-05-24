'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UserResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    fullName: string;
    emailVerifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface UpdateProfileInput {
  fullName?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

// Update user profile (fullName only)
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UpdateProfileInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Change password (separate endpoint)
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to change password');
      }

      return response.json();
    },
  });
}

// Delete account (separate endpoint)
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to delete account');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
