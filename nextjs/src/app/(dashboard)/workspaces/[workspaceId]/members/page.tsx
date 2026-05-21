'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useWorkspaceMembers,
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
} from '@/hooks/workspace-members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Trash2 } from 'lucide-react';

export default function MembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data, isLoading, error } = useWorkspaceMembers(workspaceId);
  const addMemberMutation = useAddWorkspaceMember(workspaceId);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');

  const members = data?.data ?? [];

  const handleAddMember = async () => {
    if (!email.trim()) return;

    addMemberMutation.mutate(
      { email, role },
      {
        onSuccess: () => {
          setEmail('');
          setRole('member');
        },
      }
    );
  };

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-heading text-ink">
            Team Members
          </h1>
          <p className="text-body text-ink-muted">
            Manage workspace members and permissions
          </p>
        </div>

        <div className="flex items-center gap-gap-sm">
          <input
            className="px-gap-md py-gap-sm border border-hairline-ghost rounded-sm"
            placeholder="member@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-label-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button
            variant="default"
            onClick={handleAddMember}
            disabled={addMemberMutation.isPending}
          >
            <UserPlus className="h-4 w-4 mr-gap-sm" />
            {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <p className="text-destructive text-body">
              Failed to load members: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? 'Loading...' : `${members.length} Members`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                workspaceId={workspaceId}
                member={member}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function MemberRow({
  workspaceId,
  member,
}: Readonly<{
  workspaceId: string;
  member: {
    id: string;
    role: 'owner' | 'admin' | 'member';
    user: {
      id: string;
      email: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}>) {
  const removeMutation = useRemoveWorkspaceMember(workspaceId, member.id);

  return (
    <div className="flex items-center justify-between p-gap-md bg-surface-1 rounded-sm">
      <div>
        <p className="text-body text-ink font-medium">{member.user.name}</p>
        <p className="text-label-sm text-ink-muted">{member.user.email}</p>
        <p className="text-label-sm text-ink-muted capitalize">{member.role}</p>
      </div>

      <div className="flex gap-gap-sm">
        <select
          className="px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-label-sm"
          defaultValue={member.role}
          disabled
        >
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>

        <button
          className="text-destructive hover:bg-destructive/5 p-gap-sm rounded-sm"
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending || member.role === 'owner'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
