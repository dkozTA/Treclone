'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validation/auth';
import { useResetPassword } from '@/hooks/auth/use-reset-password';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const { mutate: resetPassword, isPending: isLoading } = useResetPassword();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setApiError(null);

    resetPassword(data, {
      onSuccess: () => {
        router.push('/login?reset=success');
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'An error occurred';
        setApiError(message);
      },
    });
  };

  if (!token) {
    return (
      <div className="text-center space-y-gap-md">
        <p className="text-destructive font-medium">
          Invalid or missing reset token
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
      <div className="space-y-gap-sm">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-gap-sm">
        <Label htmlFor="passwordConfirmation">Confirm Password</Label>
        <Input
          id="passwordConfirmation"
          type="password"
          placeholder="••••••••"
          {...register('passwordConfirmation')}
          disabled={isLoading}
          aria-invalid={!!errors.passwordConfirmation}
        />
        {errors.passwordConfirmation && (
          <p className="text-destructive text-sm">
            {errors.passwordConfirmation.message}
          </p>
        )}
      </div>

      {apiError && (
        <div className="p-gap-md bg-error-container/10 border border-destructive rounded-sm">
          <p className="text-destructive text-sm font-medium">{apiError}</p>
        </div>
      )}

      <Button
        variant="default"
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
