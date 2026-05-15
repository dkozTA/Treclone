'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMembers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          joinedAt: 'Jan 15',
        },
        {
          id: '2',
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          role: 'member',
          joinedAt: 'Feb 20',
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'member',
          joinedAt: 'Mar 10',
        },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-heading text-ink">
            Team Members
          </h1>
          <p className="text-body text-ink-muted">
            Manage workspace members and permissions
          </p>
        </div>
        <Button variant="default">
          <UserPlus className="h-4 w-4 mr-gap-sm" />
          Add Member
        </Button>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>{members.length} Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-gap-md bg-surface-1 rounded-sm"
              >
                <div>
                  <p className="text-body text-ink font-medium">
                    {member.name}
                  </p>
                  <p className="text-label-sm text-ink-muted">{member.email}</p>
                  <p className="text-label-sm text-ink-muted capitalize">
                    {member.role} · Joined {member.joinedAt}
                  </p>
                </div>
                <div className="flex gap-gap-sm">
                  <select className="px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-label-sm">
                    <option value="admin">Admin</option>
                    <option value="member" selected>
                      Member
                    </option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button className="text-destructive hover:bg-destructive/5 p-gap-sm rounded-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
