'use client';

import { useState } from 'react';
import {
  useWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
} from '@/hooks/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Settings, Trash, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DisplayWorkspace {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  boardsCount: number;
}

export default function WorkspacesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading, error } = useWorkspaces();
  const createMutation = useCreateWorkspace();

  const workspaces: DisplayWorkspace[] =
    data?.workspaces?.map((ws: any) => ({
      id: ws.id,
      name: ws.name,
      description: ws.description || '',
      membersCount: ws._count?.members || 0,
      boardsCount: ws._count?.boards || 0,
    })) || [];

  const handleCreate = (formData: { name: string; description: string }) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const skeletonIds = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

  return (
    <main className="space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-gap-sm">
          <h1 className="text-headline-lg font-heading text-ink">Workspaces</h1>
          <p className="text-body text-ink-muted">
            Manage your workspaces and teams
          </p>
        </div>
        <Button variant="default" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-gap-sm" />
          New Workspace
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <p className="text-destructive text-body">
              Failed to load workspaces: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {skeletonIds.map((id) => (
            <Card key={id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-gap-lg space-y-gap-md">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-gap-sm pt-gap-md">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Workspaces Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="hover:shadow-md transition-shadow group"
              >
                <CardContent className="pt-gap-lg space-y-gap-md">
                  {/* Workspace Name */}
                  <a href={`/workspaces/${workspace.id}`}>
                    <h3 className="text-title-md font-heading text-ink hover:text-primary transition-colors">
                      {workspace.name}
                    </h3>
                  </a>

                  {/* Description */}
                  <p className="text-body text-ink-muted line-clamp-2">
                    {workspace.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-gap-lg text-label-sm text-ink-muted">
                    <div className="flex items-center gap-gap-xs">
                      <Users className="w-4 h-4" />
                      <span>{workspace.membersCount}</span>
                    </div>
                    <div>
                      <span>{workspace.boardsCount} boards</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-gap-sm pt-gap-md border-t border-hairline-ghost">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <a href={`/workspaces/${workspace.id}`}>Open</a>
                    </Button>
                    <Button asChild variant="ghost" size="icon-sm">
                      <a href={`/workspaces/${workspace.id}/edit`}>
                        <Settings className="w-4 h-4" />
                      </a>
                    </Button>
                    <DeleteWorkspaceButton
                      workspaceId={workspace.id}
                      workspaceName={workspace.name}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-gap-xl text-center">
                <p className="text-body text-ink-muted mb-gap-md">
                  No workspaces yet. Create one to get started!
                </p>
                <Button
                  variant="default"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Workspace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}
    </main>
  );
}

function DeleteWorkspaceButton({
  workspaceId,
  workspaceName,
}: Readonly<{
  workspaceId: string;
  workspaceName: string;
}>) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteWorkspaceMutation = useDeleteWorkspace(workspaceId);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10"
        type="button"
        disabled={deleteWorkspaceMutation.isPending}
        onClick={() => setShowConfirm(true)}
      >
        <Trash className="w-4 h-4" />
      </Button>
      <ConfirmDialog
        open={showConfirm}
        title="Delete Workspace"
        description={`Delete "${workspaceName}"? This will delete its boards, lists, and cards.`}
        isLoading={deleteWorkspaceMutation.isPending}
        onOpenChange={setShowConfirm}
        onConfirm={() => {
          deleteWorkspaceMutation.mutate(undefined, {
            onSuccess: () => setShowConfirm(false),
          });
        }}
      />
    </>
  );
}

function CreateWorkspaceModal({
  onClose,
  onCreate,
  isLoading,
}: Readonly<{
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => void;
  isLoading?: boolean;
}>) {
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onCreate(formData);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="p-gap-lg space-y-gap-lg border-b border-hairline-ghost">
          <h2 className="text-headline-sm font-heading text-ink">
            Create Workspace
          </h2>
        </div>

        <div className="p-gap-lg space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Workspace Name
            </Label>
            <input
              type="text"
              placeholder="e.g., Design Team"
              className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm bg-surface-2 text-body"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Description (Optional)
            </Label>
            <textarea
              placeholder="What's this workspace for?"
              className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm bg-surface-2 text-body"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-gap-md pt-gap-md">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
