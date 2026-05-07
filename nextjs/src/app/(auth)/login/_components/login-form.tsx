'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../_schema/login-form.schema';

export function UserLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login data:', data);
    // Add your login logic here
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

      <div className="space-y-gap-sm">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-label-sm text-primary hover:text-primary-container"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button variant="default" className="w-full" type="submit">
        Sign in
      </Button>
    </form>
  );
}
