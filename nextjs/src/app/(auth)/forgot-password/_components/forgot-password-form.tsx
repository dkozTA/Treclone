'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordFormSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' })
    .nonempty('Email is required'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    console.log('Forgot password data:', data);
    // Add your forgot password logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
      <div className="space-y-gap-sm">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <Button variant="default" className="w-full" type="submit">
        Send reset link
      </Button>
    </form>
  );
}
