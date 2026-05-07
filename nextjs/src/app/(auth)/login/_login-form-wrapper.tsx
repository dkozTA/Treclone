import { UserLoginForm } from './_components/login-form';

export function LoginFormWrapper() {
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

      {/* Form */}
      <UserLoginForm />

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="text-primary hover:text-primary-container font-semibold"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
