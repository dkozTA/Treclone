import { ResetPasswordForm } from './_components/reset-password-form';
import Link from 'next/link';

export function ResetPasswordFormWrapper() {
  return (
    <div className="space-y-gap-md">
      {/* Header */}
      <div className="text-center mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Reset password
        </h1>
        <p className="text-body text-ink-muted">
          Enter your new password below
        </p>
      </div>

      {/* Form */}
      <ResetPasswordForm />

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
