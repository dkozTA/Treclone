'use client';

import { useState } from 'react';
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

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      {/* Header */}
      <div className="space-y-gap-sm">
        <h1 className="text-headline-lg font-heading text-ink">Settings</h1>
        <p className="text-body text-ink-muted">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
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
              defaultValue="John Doe"
            />
          </div>
          <div className="space-y-gap-sm">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              defaultValue="john@example.com"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-gap-md"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
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
            />
          </div>
          <div className="space-y-gap-sm">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-gap-sm">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-gap-md"
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <div className="flex items-center justify-between py-gap-sm">
            <div>
              <p className="text-body text-ink font-medium">
                Email Notifications
              </p>
              <p className="text-label-sm text-ink-muted">
                Receive updates about your boards
              </p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between py-gap-sm border-t border-hairline-ghost pt-gap-md">
            <div>
              <p className="text-body text-ink font-medium">Dark Mode</p>
              <p className="text-label-sm text-ink-muted">
                Use dark theme by default
              </p>
            </div>
            <input type="checkbox" className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <div className="p-gap-md bg-destructive/5 rounded-sm space-y-gap-sm">
            <p className="text-body text-ink font-medium">Delete Account</p>
            <p className="text-label-sm text-ink-muted">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive" className="mt-gap-sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
