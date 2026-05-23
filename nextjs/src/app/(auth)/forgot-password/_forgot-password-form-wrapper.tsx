import { ForgotPasswordForm } from './_components/forgot-password-form';
import Link from 'next/link';

export function ForgotPasswordFormWrapper() {
  return (
    <div className="space-y-gap-md">
      {/* Header */}
      <div className="text-center mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Forgot password?
        </h1>
        <p className="text-body text-ink-muted">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordForm />

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Remember your password?
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
