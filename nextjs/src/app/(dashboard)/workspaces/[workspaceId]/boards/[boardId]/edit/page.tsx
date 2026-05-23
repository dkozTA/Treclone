'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';
import { useBoard, useDeleteBoard, useUpdateBoard } from '@/hooks/boards';
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  Columns3,
  LayoutList,
} from 'lucide-react';

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId =
    typeof params?.workspaceId === 'string' ? params.workspaceId : '';
  const boardId = typeof params?.boardId === 'string' ? params.boardId : '';

  const [formData, setFormData] = useState({ title: '', description: '' });
  const [showError, setShowError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: board,
    isLoading,
    error: fetchError,
  } = useBoard(workspaceId, boardId);
  const updateMutation = useUpdateBoard(workspaceId, boardId);
  const deleteMutation = useDeleteBoard(workspaceId, boardId);

  // Populate form with board data
  useEffect(() => {
    if (board) {
      setFormData({
        title: board.title ?? '',
        description: board.description ?? '',
      });
    }
  }, [board]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      setShowError(true);
      return;
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        router.push(`/workspaces/${workspaceId}/boards/${boardId}`);
      },
      onError: () => {
        setShowError(true);
      },
    });
  };

  const boardUpdatedAt = useMemo(
    () =>
      board?.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : null,
    [board?.updatedAt]
  );

  const handleDeleteBoard = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        router.push(`/workspaces/${workspaceId}`);
      },
    });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl space-y-gap-lg px-gap-md py-gap-lg">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-gap-md md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={`board-edit-skeleton-${i}`}>
              <CardContent className="space-y-gap-sm pt-gap-lg">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-gap-md">
            <div className="space-y-gap-sm">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-gap-sm">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex gap-gap-md">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="mx-auto max-w-5xl space-y-gap-lg px-gap-md py-gap-lg">
        <DashboardPageHeader
          title="Edit Board"
          description="Update board details, then return to the board canvas."
          backHref={`/workspaces/${workspaceId}/boards/${boardId}`}
        />
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <div className="flex gap-gap-md items-start">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-gap-sm" />
              <div>
                <p className="text-destructive text-body font-medium">
                  Failed to load board
                </p>
                <p className="text-destructive text-label-sm">
                  {fetchError.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-gap-lg px-gap-md py-gap-lg">
      <DashboardPageHeader
        title="Edit Board"
        description="Update the title and description, or delete the board if you no longer need it."
        backHref={`/workspaces/${workspaceId}/boards/${boardId}`}
      />

      <div className="grid gap-gap-md md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Board</p>
              <p className="text-title-lg font-heading text-ink">
                {board?.title || 'Untitled'}
              </p>
            </div>
            <LayoutList className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Lists</p>
              <p className="text-title-lg font-heading text-ink">Editable</p>
            </div>
            <Columns3 className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Updated</p>
              <p className="text-title-lg font-heading text-ink">
                {boardUpdatedAt || 'Today'}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
      </div>

      {showError && updateMutation.error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <div className="flex gap-gap-md items-start">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-gap-sm" />
              <div>
                <p className="text-destructive text-body font-medium">
                  Failed to save changes
                </p>
                <p className="text-destructive text-label-sm">
                  {updateMutation.error.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Board Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label htmlFor="title">Board Title</Label>
            <Input
              id="title"
              placeholder="Board title..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-gap-sm">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Board description..."
              className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex gap-gap-md">
            <Button
              variant="default"
              onClick={handleSave}
              disabled={updateMutation.isPending || !formData.title.trim()}
              className="flex items-center gap-gap-sm"
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/workspaces/${workspaceId}/boards/${boardId}`)
              }
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <p className="text-body text-ink-muted">
            Deleting this board removes its lists and cards permanently.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending || updateMutation.isPending}
          >
            Delete Board
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Board"
        description={`Delete "${board?.title || 'this board'}"? This will delete its lists and cards.`}
        confirmLabel="Delete Board"
        isLoading={deleteMutation.isPending}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteBoard}
      />
    </main>
  );
}
