import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="space-y-gap-md">
      {/* Header */}
      <div className="text-center mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Welcome back
        </h1>
        <p className="text-body text-ink-muted">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-gap-md">
        <div className="space-y-gap-sm">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
          />
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
            required
          />
        </div>

        <Button variant="default" className="w-full">
          Sign in
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary hover:text-primary-container font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
