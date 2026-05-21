'use client';

import { useState } from 'react';
import { useChangePassword } from '@/hooks/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SecuritySettings() {
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
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
        <div className="space-y-gap-sm">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={changePasswordMutation.isPending}
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
            disabled={changePasswordMutation.isPending}
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
            disabled={changePasswordMutation.isPending}
          />
        </div>
        <Button
          onClick={handleUpdatePassword}
          disabled={changePasswordMutation.isPending}
          className="mt-gap-md"
        >
          {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
        </Button>
      </CardContent>
    </Card>
  );
}
