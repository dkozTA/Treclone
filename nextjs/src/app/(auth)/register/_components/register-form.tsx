'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '../_schemas/register-form.schema';

export function UserRegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log('Register data:', data);
    // Add your registration logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
      <div className="space-y-gap-sm">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

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
        <Label htmlFor="password">Password</Label>
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

      <div className="space-y-gap-sm">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button variant="default" className="w-full" type="submit">
        Create account
      </Button>
    </form>
  );
}
