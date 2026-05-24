'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { z } from 'zod';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validation/auth';
import { changePasswordSchema } from '@/lib/validation/settings';
import { useUpdateProfile, useChangePassword } from '@/hooks/profile';

interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly emailVerifiedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface EditProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly user: UserProfile;
}

type PasswordFormData = z.infer<typeof changePasswordSchema>;

export function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileFormSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordFormSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      passwordConfirmation: '',
    },
  });

  // Mutations
  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  const handleClose = () => {
    resetProfile();
    resetPassword();
    setProfileError(null);
    setPasswordError(null);
    setActiveTab('profile');
    onClose();
  };

  const onProfileSubmit = (data: UpdateProfileInput) => {
    setProfileError(null);
    updateProfile(data, {
      onSuccess: () => {
        resetProfile();
        handleClose();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Failed to update profile';
        setProfileError(message);
      },
    });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordError(null);

    if (!user.emailVerifiedAt) {
      setPasswordError('Please verify your email before changing your password.');
      return;
    }

    changePassword(data, {
      onSuccess: () => {
        resetPassword();
        handleClose();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Failed to change password';
        setPasswordError(message);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information or change your password
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex gap-gap-sm border-b border-hairline-ghost">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-gap-sm px-gap-sm text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-gap-sm px-gap-sm text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleProfileFormSubmit(onProfileSubmit)}
            className="space-y-gap-md"
          >
            {/* Full Name */}
            <div className="space-y-gap-sm">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...registerProfile('fullName')}
                disabled={isUpdatingProfile}
                aria-invalid={!!profileErrors.fullName}
              />
              {profileErrors.fullName && (
                <p className="text-destructive text-sm">
                  {profileErrors.fullName.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {profileError && (
              <Alert variant="destructive">
                <p className="text-sm">{profileError}</p>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-gap-sm justify-end pt-gap-md">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdatingProfile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form
            onSubmit={handlePasswordFormSubmit(onPasswordSubmit)}
            className="space-y-gap-md"
          >
            {!user.emailVerifiedAt && (
              <Alert variant="warning">
                <p className="text-sm">
                  Please verify your email before changing your password.
                </p>
              </Alert>
            )}
            {/* Current Password */}
            <div className="space-y-gap-sm">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...registerPassword('currentPassword')}
                disabled={isChangingPassword || !user.emailVerifiedAt}
                aria-invalid={!!passwordErrors.currentPassword}
              />
              {passwordErrors.currentPassword && (
                <p className="text-destructive text-sm">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-gap-sm">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...registerPassword('newPassword')}
                disabled={isChangingPassword || !user.emailVerifiedAt}
                aria-invalid={!!passwordErrors.newPassword}
              />
              {passwordErrors.newPassword && (
                <p className="text-destructive text-sm">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-gap-sm">
              <Label htmlFor="passwordConfirmation">Confirm New Password</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                placeholder="••••••••"
                {...registerPassword('passwordConfirmation')}
                disabled={isChangingPassword || !user.emailVerifiedAt}
                aria-invalid={!!passwordErrors.passwordConfirmation}
              />
              {passwordErrors.passwordConfirmation && (
                <p className="text-destructive text-sm">
                  {passwordErrors.passwordConfirmation.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {passwordError && (
              <Alert variant="destructive">
                <p className="text-sm">{passwordError}</p>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-gap-sm justify-end pt-gap-md">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isChangingPassword || !user.emailVerifiedAt}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
