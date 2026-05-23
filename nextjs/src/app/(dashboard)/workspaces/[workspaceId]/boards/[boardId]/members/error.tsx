'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BoardMembersError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('Board members error:', error);
  }, [error]);

  return (
    <main className="mx-auto max-w-4xl space-y-gap-lg px-gap-md py-gap-lg">
      <div className="flex items-center gap-gap-md rounded-lg border border-red-200 bg-red-50 p-gap-md">
        <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <h2 className="text-body-bold text-red-900">
            Failed to load board members
          </h2>
          <p className="mt-gap-sm text-body text-red-700">
            {error.message || 'An error occurred while loading board members'}
          </p>
        </div>
        <Button onClick={() => reset()} size="sm" variant="default">
          Retry
        </Button>
      </div>
    </main>
  );
}
