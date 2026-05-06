import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="space-y-gap-md">
      {/* Header */}
      <div className="text-center mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Create account
        </h1>
        <p className="text-body text-ink-muted">
          Join to start managing your tasks
        </p>
      </div>

      {/* Registration Form */}
      <form className="space-y-gap-md">
        <div className="space-y-gap-sm">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="space-y-gap-sm">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button variant="default" className="w-full">
          Create account
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary-container font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
