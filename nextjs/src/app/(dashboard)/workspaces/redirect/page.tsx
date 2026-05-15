'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first workspace or create new one
    router.push('/workspaces/1');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-body text-ink-muted">Redirecting...</p>
    </div>
  );
}
