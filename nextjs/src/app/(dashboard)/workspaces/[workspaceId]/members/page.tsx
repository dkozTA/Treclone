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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';
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
      <DashboardPageHeader
        title="Team Members"
        description="Manage workspace members and permissions"
        actions={
          <div className="grid w-full gap-gap-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <input
              className="w-full rounded-sm border border-hairline-ghost px-gap-md py-gap-sm"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="w-full rounded-sm border border-hairline-ghost px-gap-md py-gap-sm text-label-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              variant="default"
              className="w-full lg:w-auto"
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending}
            >
              <UserPlus className="h-4 w-4 mr-gap-sm" />
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        }
      />

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
  const [showConfirm, setShowConfirm] = useState(false);
  const removeMutation = useRemoveWorkspaceMember(workspaceId, member.id);

  return (
    <>
      <div className="flex flex-col gap-gap-md rounded-sm bg-surface-1 p-gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-body text-ink font-medium">{member.user.name}</p>
          <p className="text-label-sm text-ink-muted">{member.user.email}</p>
          <p className="text-label-sm text-ink-muted capitalize">
            {member.role}
          </p>
        </div>

        <div className="flex flex-wrap gap-gap-sm sm:justify-end">
          <select
            className="w-full rounded-sm border border-hairline-ghost px-gap-md py-gap-sm text-label-sm sm:w-auto"
            defaultValue={member.role}
            disabled
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>

          <button
            className="rounded-sm p-gap-sm text-destructive hover:bg-destructive/5"
            onClick={() => setShowConfirm(true)}
            disabled={removeMutation.isPending || member.role === 'owner'}
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Remove Member"
        description={`Remove ${member.user.email} from this workspace?`}
        confirmLabel="Remove"
        loadingLabel="Removing..."
        isLoading={removeMutation.isPending}
        onOpenChange={setShowConfirm}
        onConfirm={() => {
          removeMutation.mutate(undefined, {
            onSuccess: () => setShowConfirm(false),
          });
        }}
      />
    </>
  );
}
