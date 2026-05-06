import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-gap-md">
      {/* Header */}
      <div className="text-center mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Forgot password?
        </h1>
        <p className="text-body text-ink-muted">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Forgot Password Form */}
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

        <Button variant="default" className="w-full">
          Send reset link
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary-container font-semibold"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
