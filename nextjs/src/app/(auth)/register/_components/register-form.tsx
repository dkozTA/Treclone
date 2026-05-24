'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth';
import { useAuth } from '@/hooks/auth/use-auth';

export function UserRegisterForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null);
    setSuccessEmail(null);

    try {
      await registerUser(data.email, data.password, data.fullName);
      setSuccessEmail(data.email);
      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      setApiError(message);
    }
  };

  if (successEmail) {
    return (
      <div className="text-center space-y-gap-md">
        <div className="p-gap-lg bg-success-container/20 border border-green-300 rounded-sm">
          <p className="text-green-700 font-medium">Check your email</p>
          <p className="text-sm text-green-600 mt-gap-sm">
            We sent a verification link to {successEmail}. Verify your email
            before signing in.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => setSuccessEmail(null)}
        >
          Use another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
      {/* Full Name */}
      <div className="space-y-gap-sm">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          {...register('fullName')}
          disabled={isLoading}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p className="text-destructive text-sm">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-gap-sm">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          disabled={isLoading}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-gap-sm">
        <Label htmlFor="password">Password</Label>
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

      {/* API Error Container */}
      {apiError && (
        <div className="p-gap-md bg-error-container/10 border border-destructive rounded-sm">
          <p className="text-destructive text-sm font-medium">{apiError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        variant="default"
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
