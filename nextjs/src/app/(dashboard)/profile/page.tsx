'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Edit2 } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  joinedAt: string;
  boards: number;
  tasks: number;
  teamMembers: number;
  recentActivity: Array<{
    id: string;
    action: string;
    target: string;
    timestamp: string;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Simulate fetching user profile
    const timer = setTimeout(() => {
      setProfile({
        name: 'John Doe',
        email: 'john@example.com',
        joinedAt: 'January 15, 2025',
        boards: 12,
        tasks: 147,
        teamMembers: 8,
        recentActivity: [
          {
            id: '1',
            action: 'Created board',
            target: 'Q2 Planning',
            timestamp: '2 hours ago',
          },
          {
            id: '2',
            action: 'Completed task',
            target: 'Design homepage',
            timestamp: '1 day ago',
          },
          {
            id: '3',
            action: 'Added member',
            target: 'Sarah Chen',
            timestamp: '3 days ago',
          },
          {
            id: '4',
            action: 'Updated board',
            target: 'Marketing Sprint',
            timestamp: '1 week ago',
          },
        ],
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-gap-lg items-start">
              {/* Avatar */}
              <div className="w-20 h-20 bg-primary rounded-md flex items-center justify-center">
                <span className="text-2xl font-heading text-white">
                  {profile.name.charAt(0)}
                </span>
              </div>
              {/* User Info */}
              <div className="space-y-gap-sm">
                <div>
                  <h1 className="text-headline-lg font-heading text-ink">
                    {profile.name}
                  </h1>
                  <p className="text-body text-ink-muted">{profile.email}</p>
                </div>
                <p className="text-label-sm text-ink-muted">
                  Joined {profile.joinedAt}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-gap-sm" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-gap-lg">
        <Card>
          <CardContent className="pt-gap-lg text-center space-y-gap-sm">
            <div className="text-4xl font-heading text-primary">
              {profile.boards}
            </div>
            <p className="text-body text-ink-muted">Active Boards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-gap-lg text-center space-y-gap-sm">
            <div className="text-4xl font-heading text-primary">
              {profile.tasks}
            </div>
            <p className="text-body text-ink-muted">Tasks Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-gap-lg text-center space-y-gap-sm">
            <div className="text-4xl font-heading text-primary">
              {profile.teamMembers}
            </div>
            <p className="text-body text-ink-muted">Team Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {profile.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-gap-md border-b border-hairline-ghost last:border-b-0"
              >
                <div>
                  <p className="text-body text-ink">
                    {activity.action}{' '}
                    <span className="font-semibold text-primary">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-label-sm text-ink-muted">
                    {activity.timestamp}
                  </p>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workspace Memberships */}
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Workspaces you're a member of</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {[
              { name: 'Design Team', role: 'Member', members: 5 },
              { name: 'Product Sprint', role: 'Admin', members: 8 },
              { name: 'Marketing Q2', role: 'Member', members: 3 },
            ].map((workspace) => (
              <div
                key={workspace.name}
                className="flex items-center justify-between p-gap-md bg-surface-1 rounded-sm"
              >
                <div>
                  <p className="text-body text-ink font-medium">
                    {workspace.name}
                  </p>
                  <p className="text-label-sm text-ink-muted">
                    {workspace.role} · {workspace.members} members
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
