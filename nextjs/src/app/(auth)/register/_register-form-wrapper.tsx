import { UserRegisterForm } from './_components/register-form';

export function RegisterFormWrapper() {
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

      {/* Form */}
      <UserRegisterForm />

      {/* Footer Link */}
      <div className="text-center pt-gap-md border-t border-hairline-ghost">
        <p className="text-body text-ink-muted">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-primary hover:text-primary-container font-semibold"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
