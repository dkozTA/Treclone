'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/hooks/profile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DangerZone() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    deleteAccountMutation.mutate(undefined, {
      onSuccess: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
      },
      onError: (error) => {
        alert(
          error instanceof Error ? error.message : 'Failed to delete account'
        );
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-gap-md">
        <div className="p-gap-md bg-destructive/5 rounded-sm space-y-gap-sm">
          <p className="text-body text-ink font-medium">Delete Account</p>
          <p className="text-label-sm text-ink-muted">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button
            variant="destructive"
            className="mt-gap-sm"
            onClick={handleDeleteAccount}
            disabled={isDeleting || deleteAccountMutation.isPending}
          >
            {isDeleting || deleteAccountMutation.isPending
              ? 'Deleting...'
              : 'Delete Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
