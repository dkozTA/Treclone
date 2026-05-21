'use client';

import { useEffect, useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/profile';
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

export function ProfileSettings() {
  const { data: profileData, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (profileData?.user?.fullName) {
      setFullName(profileData.user.fullName);
    }
  }, [profileData?.user?.fullName]);

  const handleSave = async () => {
    if (!fullName.trim()) return;

    updateProfileMutation.mutate({
      fullName: fullName.trim(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-gap-md">
        <div className="space-y-gap-sm">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading || updateProfileMutation.isPending}
          />
        </div>

        <div className="space-y-gap-sm">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profileData?.user?.email || ''}
            disabled
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={
            isLoading || updateProfileMutation.isPending || !fullName.trim()
          }
          className="mt-gap-md"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
