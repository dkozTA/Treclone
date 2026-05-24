'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? ''
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )
  const [message, setMessage] = React.useState(
    token ? 'Verifying your email...' : 'Invalid or missing verification token'
  )

  React.useEffect(() => {
    if (!token) return

    let isMounted = true

    async function verifyEmail() {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.error || json.message || 'Email verification failed')
        }

        if (isMounted) {
          setStatus('success')
          setMessage('Your email has been verified. You can now sign in.')
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error')
          setMessage(
            error instanceof Error
              ? error.message
              : 'Email verification failed'
          )
        }
      }
    }

    verifyEmail()

    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <div className="space-y-gap-md text-center">
      <div className="mb-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          Verify email
        </h1>
        <p className="text-body text-ink-muted">{message}</p>
      </div>

      {status === 'loading' && (
        <div className="p-gap-lg bg-surface-1 rounded-sm">
          <p className="text-body text-ink-muted">Please wait...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-gap-md">
          <div className="p-gap-lg bg-success-container/20 border border-green-300 rounded-sm">
            <p className="text-green-700 font-medium">Email verified</p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-gap-md">
          <div className="p-gap-lg bg-error-container/10 border border-destructive rounded-sm">
            <p className="text-destructive font-medium">{message}</p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
