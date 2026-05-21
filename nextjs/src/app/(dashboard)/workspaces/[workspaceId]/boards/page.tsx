'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBoards } from '@/hooks/boards';
import { BoardCard } from './_components/board-card';
import { CreateBoardModal } from './_components/create-board-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, AlertCircle } from 'lucide-react';

export default function BoardsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Query
  const { data: boardsData, isLoading, error } = useBoards(workspaceId);

  const boards = boardsData?.boards || [];

  if (isLoading) {
    return (
      <main className="space-y-gap-lg">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-gap-sm flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-gap-lg space-y-gap-md">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9" />
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
        <div className="space-y-gap-sm">
          <h1 className="text-headline-lg font-heading text-ink">My Boards</h1>
          <p className="text-body text-ink-muted">
            Manage and organize your tasks across different boards
          </p>
        </div>
        <Button variant="default" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-gap-sm" />
          Create Board
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg flex gap-gap-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-destructive text-body font-medium">Error</p>
              <p className="text-destructive text-label-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boards Grid */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              workspaceId={workspaceId}
              board={board}
              onDeleteSuccess={() => {
                // Card will automatically update via query invalidation
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-gap-lg text-center py-gap-xl space-y-gap-md">
            <p className="text-body text-ink-muted">
              No boards yet. Create your first board to get started.
            </p>
            <Button variant="outline" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-gap-sm" />
              Create Board
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          workspaceId={workspaceId}
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </main>
  );
}
