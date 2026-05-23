'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/hooks/profile';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DangerZone() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const deleteAccountMutation = useDeleteAccount();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    deleteAccountMutation.mutate(
      { password },
      {
        onSuccess: async () => {
          setShowDeleteConfirm(false);
          setPassword('');
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
        },
        onSettled: () => {
          setIsDeleting(false);
        },
      }
    );
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
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting || deleteAccountMutation.isPending}
          >
            {isDeleting || deleteAccountMutation.isPending
              ? 'Deleting...'
              : 'Delete Account'}
          </Button>
        </div>
      </CardContent>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account"
        description="This permanently deletes your account and all related data. Enter your password to confirm."
        confirmLabel="Delete Account"
        isLoading={isDeleting || deleteAccountMutation.isPending}
        confirmDisabled={!password.trim()}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open);
          if (!open) {
            setPassword('');
          }
        }}
        onConfirm={handleDeleteAccount}
      >
        <div className="space-y-gap-sm">
          <Label htmlFor="delete-account-password">Password</Label>
          <Input
            id="delete-account-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isDeleting || deleteAccountMutation.isPending}
            aria-invalid={!!deleteAccountMutation.error}
          />
          {deleteAccountMutation.error && (
            <p className="text-label-sm text-destructive">
              {deleteAccountMutation.error.message}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </Card>
  );
}
