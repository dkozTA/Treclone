'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { useProfile } from '@/hooks/profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, AlertCircle } from 'lucide-react';
import { EditProfileModal } from './_components/edit-profile-modal';
import ProfileLoading from './loading';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Show loading state
  if (authLoading || profileLoading) {
    return <ProfileLoading />;
  }

  // Show error state for missing auth
  if (!user) {
    return (
      <main className="max-w-4xl mx-auto space-y-gap-lg px-gap-md py-gap-lg">
        <div className="flex items-center gap-gap-md p-gap-md bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-body-bold text-red-900">
              Authentication Required
            </h2>
            <p className="text-body text-red-700 mt-gap-sm">
              You must be logged in to view your profile
            </p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            size="sm"
            variant="default"
          >
            Go to Login
          </Button>
        </div>
      </main>
    );
  }

  // Show error state for missing profile data
  if (!profileData?.user) {
    return (
      <main className="max-w-4xl mx-auto space-y-gap-lg px-gap-md py-gap-lg">
        <div className="flex items-center gap-gap-md p-gap-md bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-body-bold text-red-900">
              Failed to load profile
            </h2>
            <p className="text-body text-red-700 mt-gap-sm">
              Unable to fetch your profile data. Please try again.
            </p>
          </div>
          <Button
            onClick={() => globalThis.location.reload()}
            size="sm"
            variant="default"
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const profile = profileData.user;

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg px-gap-md py-gap-lg">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-gap-lg items-start">
              {/* Avatar */}
              <div className="w-20 h-20 bg-primary rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="text-4xl font-heading text-white">
                  {profile.fullName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-gap-sm">
                <div>
                  <h1 className="text-headline-lg font-heading text-ink">
                    {profile.fullName}
                  </h1>
                  <p className="text-body text-ink-muted">{profile.email}</p>
                </div>
                <p className="text-label-sm text-ink-muted">
                  Account created on{' '}
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="h-4 w-4 mr-gap-sm" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-gap-lg">
          {/* Full Name */}
          <div>
            <Label className="text-label-sm font-semibold text-ink mb-gap-xs">
              Full Name
            </Label>
            <p className="text-body text-ink-muted">{profile.fullName}</p>
          </div>

          {/* Email */}
          <div>
            <Label className="text-label-sm font-semibold text-ink mb-gap-xs">
              Email Address
            </Label>
            <p className="text-body text-ink-muted">{profile.email}</p>
          </div>

          {/* Account Status */}
          <div>
            <Label className="text-label-sm font-semibold text-ink mb-gap-xs">
              Account Status
            </Label>
            <div className="flex items-center gap-gap-sm">
              <Badge variant="success">Active</Badge>
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <Label className="text-label-sm font-semibold text-ink mb-gap-xs">
              Last Updated
            </Label>
            <p className="text-body text-ink-muted">
              {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* User ID */}
          <div>
            <Label className="text-label-sm font-semibold text-ink mb-gap-xs">
              User ID
            </Label>
            <p className="text-body text-ink-muted font-mono text-xs break-all">
              {profile.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profile}
      />
    </main>
  );
}
