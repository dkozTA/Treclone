'use client';

import { useParams } from 'next/navigation';
import { useWorkspace } from '@/hooks/workspace';
import { useBoards, useCreateBoard } from '@/hooks/boards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

  // Queries
  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceId);
  const { data: boardsData, isLoading: boardsLoading } = useBoards(workspaceId);
  const createBoardMutation = useCreateBoard(workspaceId);

  const boards = boardsData?.boards || [];

  // Handle create board
  const handleCreateBoard = (data: { title: string; description: string }) => {
    createBoardMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateBoardModal(false);
      },
    });
  };

  if (workspaceLoading) {
    return (
      <main className="space-y-gap-lg">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {[new Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-gap-lg space-y-gap-md">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
            {workspace?.name}
          </h1>
          <p className="text-body text-ink-muted">
            {workspace?.description || 'Manage your boards and tasks'}
          </p>
        </div>
        <Button variant="default" onClick={() => setShowCreateBoardModal(true)}>
          <Plus className="h-4 w-4 mr-gap-sm" />
          New Board
        </Button>
      </div>

      {/* Boards Grid */}
      {boardsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {[new Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-gap-lg space-y-gap-md">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {boards.map((board: any) => (
            <Card
              key={board.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="pt-gap-lg space-y-gap-md">
                <a href={`/workspaces/${workspaceId}/boards/${board.id}`}>
                  <h3 className="text-title-md font-heading text-ink hover:text-primary transition-colors">
                    {board.title}
                  </h3>
                </a>
                <p className="text-body text-ink-muted line-clamp-2">
                  {board.description}
                </p>
                <div className="flex gap-gap-md text-label-sm text-ink-muted">
                  <span>{board._count?.lists || 0} lists</span>
                  <span>{board._count?.cards || 0} cards</span>
                </div>
                <div className="flex gap-gap-sm">
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <a href={`/workspaces/${workspaceId}/boards/${board.id}`}>
                      Open
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-gap-xl text-center">
            <p className="text-body text-ink-muted mb-gap-md">
              No boards yet. Create one to get started!
            </p>
            <Button
              variant="default"
              onClick={() => setShowCreateBoardModal(true)}
            >
              Create Your First Board
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <CreateBoardModal
          onClose={() => setShowCreateBoardModal(false)}
          onCreate={handleCreateBoard}
          isLoading={createBoardMutation.isPending}
        />
      )}
    </main>
  );
}

function CreateBoardModal({
  onClose,
  onCreate,
  isLoading,
}: Readonly<{
  onClose: () => void;
  onCreate: (data: { title: string; description: string }) => void;
  isLoading?: boolean;
}>) {
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onCreate(formData);
    setFormData({ title: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="p-gap-lg space-y-gap-lg border-b border-hairline-ghost">
          <h2 className="text-headline-sm font-heading text-ink">
            Create Board
          </h2>
        </div>

        <div className="p-gap-lg space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Board Title
            </Label>
            <Input
              type="text"
              placeholder="e.g., Q2 Planning"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Description (Optional)
            </Label>
            <textarea
              placeholder="Describe this board..."
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
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
