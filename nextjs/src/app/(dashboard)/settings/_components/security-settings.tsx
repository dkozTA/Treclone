'use client';

import { useState } from 'react';
import { useChangePassword } from '@/hooks/profile';
import { usePreferencesSettings } from '@/hooks/preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SecuritySettings() {
  const changePasswordMutation = useChangePassword();
  const { data: preferences, isLoading: isLoadingPreferences } =
    usePreferencesSettings();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const isEmailVerified = !!preferences?.emailVerifiedAt;

  const handleResendVerification = async () => {
    if (!preferences?.email) return;

    setResendStatus(null);
    setResendError(null);
    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: preferences.email }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error || json.message || 'Failed to send verification email'
        );
      }

      setResendStatus('Verification email sent. Please check your inbox.');
    } catch (error) {
      setResendError(
        error instanceof Error
          ? error.message
          : 'Failed to send verification email'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!isEmailVerified) {
      alert('Please verify your email before changing your password.');
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
        passwordConfirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          alert('Password updated successfully');
        },
        onError: (error) => {
          alert(
            error instanceof Error ? error.message : 'Failed to update password'
          );
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage your password and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-gap-md">
        {!isLoadingPreferences && !isEmailVerified && (
          <Alert variant="warning">
            <div className="space-y-gap-sm">
              <p className="font-medium">Email verification required</p>
              <p>
                Verify {preferences?.email} before changing your password.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Send verification email'}
              </Button>
            </div>
          </Alert>
        )}
        {resendStatus && (
          <Alert variant="success">
            <p>{resendStatus}</p>
          </Alert>
        )}
        {resendError && (
          <Alert variant="destructive">
            <p>{resendError}</p>
          </Alert>
        )}
        <div className="space-y-gap-sm">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={changePasswordMutation.isPending || !isEmailVerified}
          />
        </div>
        <div className="space-y-gap-sm">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={changePasswordMutation.isPending || !isEmailVerified}
          />
        </div>
        <div className="space-y-gap-sm">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={changePasswordMutation.isPending || !isEmailVerified}
          />
        </div>
        <Button
          onClick={handleUpdatePassword}
          disabled={changePasswordMutation.isPending || !isEmailVerified}
          className="mt-gap-md"
        >
          {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
        </Button>
      </CardContent>
    </Card>
  );
}
