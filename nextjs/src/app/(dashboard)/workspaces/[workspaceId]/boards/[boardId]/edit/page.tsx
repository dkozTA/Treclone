'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoard } from '@/hooks/boards/queries';
import { useUpdateBoard } from '@/hooks/boards/mutations';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  const [formData, setFormData] = useState({ title: '', description: '' });
  const [showError, setShowError] = useState(false);

  const {
    data: board,
    isLoading,
    error: fetchError,
  } = useBoard(workspaceId, boardId);
  const updateMutation = useUpdateBoard(workspaceId, boardId);

  // Populate form with board data
  useEffect(() => {
    if (board) {
      setFormData({
        title: board.title,
        description: board.description || '',
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

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <Skeleton className="h-10 w-48" />
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
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <h1 className="text-headline-lg font-heading text-ink">Edit Board</h1>
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
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      <h1 className="text-headline-lg font-heading text-ink">Edit Board</h1>

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
    </main>
  );
}
