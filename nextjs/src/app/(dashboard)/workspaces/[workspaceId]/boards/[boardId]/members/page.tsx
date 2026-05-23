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
import {
  Search,
  UserPlus,
  Trash2,
  Check,
  Users,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

export default function BoardMembersPage() {
  const params = useParams();
  const workspaceId =
    typeof params?.workspaceId === 'string' ? params.workspaceId : '';
  const boardId = typeof params?.boardId === 'string' ? params.boardId : '';

  const { data, isLoading, error } = useBoardMembers(workspaceId, boardId);
  const addMemberMutation = useAddBoardMember(workspaceId, boardId);
  const removeMemberMutation = useRemoveBoardMember(workspaceId, boardId);

  const [emailInput, setEmailInput] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [role, setRole] = useState<BoardMemberRole>('viewer');
  const [search, setSearch] = useState('');

  const members = data?.data ?? [];

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;

    const query = search.toLowerCase();
    return members.filter(
      (member) =>
        member.user.fullName.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [members, search]);

  const roleCounts = useMemo(
    () => ({
      admin: members.filter((member) => member.role === 'admin').length,
      editor: members.filter((member) => member.role === 'editor').length,
      viewer: members.filter((member) => member.role === 'viewer').length,
    }),
    [members]
  );

  const canSubmit = !!selectedEmail.trim() && !addMemberMutation.isPending;
  const selectedEmailNormalized = useMemo(
    () => selectedEmail.trim().toLowerCase(),
    [selectedEmail]
  );

  let memberListContent: React.ReactNode;
  if (isLoading) {
    memberListContent = <MemberListSkeleton />;
  } else if (filteredMembers.length === 0) {
    memberListContent = (
      <Card className="border-dashed">
        <CardContent className="py-gap-xl text-center">
          <p className="text-body font-medium text-ink">
            No members match this filter
          </p>
          <p className="text-label-sm text-ink-muted">
            Try a different search term or invite someone new.
          </p>
        </CardContent>
      </Card>
    );
  } else {
    memberListContent = (
      <div className="space-y-gap-md">
        {filteredMembers.map((member) => (
          <BoardMemberRow
            key={member.id}
            member={member}
            onRemove={() =>
              removeMemberMutation.mutate({ memberId: member.id })
            }
            isRemoving={removeMemberMutation.isPending}
          />
        ))}
      </div>
    );
  }

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
    <main className="mx-auto max-w-6xl space-y-gap-lg px-gap-md py-gap-lg">
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

      <div className="grid gap-gap-md md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Members</p>
              <p className="text-title-lg font-heading text-ink">
                {members.length}
              </p>
            </div>
            <Users className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Admins</p>
              <p className="text-title-lg font-heading text-ink">
                {roleCounts.admin}
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Editors</p>
              <p className="text-title-lg font-heading text-ink">
                {roleCounts.editor}
              </p>
            </div>
            <Eye className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Viewers</p>
              <p className="text-title-lg font-heading text-ink">
                {roleCounts.viewer}
              </p>
            </div>
            <Users className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
      </div>

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
          <div className="grid gap-gap-md lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <Card className="border-hairline-ghost bg-surface-1/60">
              <CardContent className="space-y-gap-md pt-gap-lg">
                <div className="space-y-gap-sm">
                  <Label htmlFor="email">Invite by email</Label>
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

                <div className="flex flex-col gap-gap-sm sm:flex-row">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleAddMember}
                    disabled={!canSubmit}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="mr-gap-sm h-4 w-4" />
                    {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmailInput('');
                      setSelectedEmail('');
                      setRole('viewer');
                    }}
                    disabled={!emailInput && !selectedEmail}
                    className="w-full sm:w-auto"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="space-y-gap-md pt-gap-lg">
                <p className="text-title-sm font-heading text-ink">
                  Access summary
                </p>
                <div className="space-y-gap-sm text-body text-ink-muted">
                  <p>Admins can manage board access and board structure.</p>
                  <p>Editors can update cards, lists, and task details.</p>
                  <p>
                    Viewers can inspect progress without changing the board.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by name, email, or role..."
              className="pl-9"
            />
          </div>

          {memberListContent}
        </CardContent>
      </Card>
    </main>
  );
}

function MemberListSkeleton() {
  return (
    <div className="space-y-gap-md">
      {[1, 2, 3].map((index) => (
        <Card key={`board-member-skeleton-${index}`} className="bg-surface-1">
          <CardContent className="flex flex-col gap-gap-md py-gap-md sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-gap-sm">
              <div className="h-4 w-44 animate-pulse rounded-sm bg-surface-container" />
              <div className="h-3 w-52 animate-pulse rounded-sm bg-surface-container" />
              <div className="h-3 w-32 animate-pulse rounded-sm bg-surface-container" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-sm bg-surface-container" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BoardMemberRow({
  member,
  onRemove,
  isRemoving,
}: Readonly<{
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
      <Card className="bg-surface-1">
        <CardContent className="flex flex-col gap-gap-md py-gap-md sm:flex-row sm:items-center sm:justify-between">
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
        </CardContent>
      </Card>
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
