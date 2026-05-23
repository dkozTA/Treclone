'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useAddBoardMember,
  useBoardMembers,
  useRemoveBoardMember,
  BoardMemberRole,
} from '@/hooks/board-members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Check } from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

export default function BoardMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  const { data, isLoading, error } = useBoardMembers(workspaceId, boardId);
  const addMemberMutation = useAddBoardMember(workspaceId, boardId);
  const removeMemberMutation = useRemoveBoardMember(workspaceId, boardId);

  const [emailInput, setEmailInput] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [role, setRole] = useState<BoardMemberRole>('viewer');

  const members = data?.data ?? [];

  const canSubmit = !!selectedEmail.trim() && !addMemberMutation.isPending;
  const selectedEmailNormalized = useMemo(
    () => selectedEmail.trim().toLowerCase(),
    [selectedEmail]
  );

  const handlePickEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    setSelectedEmail(email);
    setEmailInput(email);
  };

  const handleAddMember = () => {
    if (!selectedEmailNormalized) return;

    addMemberMutation.mutate(
      { email: selectedEmailNormalized, role },
      {
        onSuccess: () => {
          setEmailInput('');
          setSelectedEmail('');
          setRole('viewer');
        },
      }
    );
  };

  return (
    <main className="mx-auto max-w-4xl space-y-gap-lg px-gap-md py-gap-lg">
      <DashboardPageHeader
        title="Board Members"
        description="Manage who can access this board"
        backHref={`/workspaces/${workspaceId}/boards/${boardId}`}
        actions={
          <div className="flex w-full flex-col gap-gap-sm sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="default"
              onClick={handleAddMember}
              disabled={!canSubmit}
              className="w-full sm:w-auto"
            >
              <UserPlus className="mr-gap-sm h-4 w-4" />
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <p className="text-destructive text-body">
              Failed to load board members: {error.message}
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

        <CardContent className="space-y-gap-lg">
          <div className="grid gap-gap-md md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-gap-sm">
              <Label htmlFor="email">User Email</Label>
              <div className="flex gap-gap-sm">
                <Input
                  id="email"
                  placeholder="Enter user email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePickEmail();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePickEmail}
                  disabled={!emailInput.trim()}
                >
                  Pick
                </Button>
              </div>

              {selectedEmail && (
                <div className="flex items-center gap-gap-sm">
                  <Badge variant="secondary">{selectedEmail}</Badge>
                  <span className="text-label-sm text-ink-muted">
                    <Check className="inline-block h-3.5 w-3.5 align-[-2px]" />
                    Selected
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-gap-sm">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-10 rounded-sm border border-hairline-ghost bg-canvas px-gap-md text-body"
                value={role}
                onChange={(e) => setRole(e.target.value as BoardMemberRole)}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-gap-md">
            {members.map((member) => (
              <BoardMemberRow
                key={member.id}
                workspaceId={workspaceId}
                boardId={boardId}
                member={member}
                onRemove={() =>
                  removeMemberMutation.mutate({ memberId: member.id })
                }
                isRemoving={removeMemberMutation.isPending}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function BoardMemberRow({
  member,
  onRemove,
  isRemoving,
}: Readonly<{
  workspaceId: string;
  boardId: string;
  member: {
    id: string;
    userId: string;
    boardId: string;
    role: BoardMemberRole;
    user: {
      id: string;
      email: string;
      fullName: string;
    };
    joinedAt: string;
  };
  onRemove: () => void;
  isRemoving?: boolean;
}>) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-gap-md rounded-sm bg-surface-1 p-gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-body font-medium text-ink">
            {member.user.fullName || member.user.email}
          </p>
          <p className="text-label-sm text-ink-muted">{member.user.email}</p>
          <p className="text-label-sm text-ink-muted">
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-gap-sm sm:justify-end">
          <Badge variant="secondary">{member.role}</Badge>

          <button
            className="rounded-sm p-gap-sm text-destructive hover:bg-destructive/5"
            onClick={() => setShowConfirm(true)}
            disabled={isRemoving}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Remove Board Member"
        description={`Remove ${member.user.email} from this board?`}
        confirmLabel="Remove"
        loadingLabel="Removing..."
        isLoading={isRemoving}
        onOpenChange={setShowConfirm}
        onConfirm={() => {
          onRemove();
          setShowConfirm(false);
        }}
      />
    </>
  );
}
