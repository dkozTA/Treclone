'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteBoard } from '@/hooks/boards';
import { Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardCardProps {
  workspaceId: string;
  board: {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  onDeleteSuccess?: () => void;
}

export function BoardCard({
  workspaceId,
  board,
  onDeleteSuccess,
}: Readonly<BoardCardProps>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showError, setShowError] = useState(false);

  const deleteMutation = useDeleteBoard(workspaceId, board.id);

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        onDeleteSuccess?.();
      },
      onError: () => {
        setShowError(true);
      },
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="pt-gap-lg space-y-gap-md">
        {/* Error State */}
        {showError && (
          <div className="p-gap-md bg-destructive/5 rounded-sm flex gap-gap-sm items-start">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-gap-sm" />
            <div>
              <p className="text-destructive text-label-sm font-medium">
                Failed to delete board
              </p>
              <p className="text-destructive text-label-xs">
                {deleteMutation.error?.message}
              </p>
            </div>
          </div>
        )}

        <Link href={`/workspaces/${workspaceId}/boards/${board.id}`}>
          <h3 className="text-title-md font-heading text-ink hover:text-primary transition-colors">
            {board.title}
          </h3>
        </Link>

        {board.description && (
          <p className="text-body text-ink-muted line-clamp-2">
            {board.description}
          </p>
        )}

        <div className="text-label-sm text-ink-muted">
          Created {new Date(board.createdAt).toLocaleDateString()}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteMutation.isPending}
          className="text-destructive hover:bg-destructive/10"
          aria-label={`Delete board ${board.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardContent>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Board"
        description={`Delete "${board.title}"? This will delete its lists and cards.`}
        isLoading={deleteMutation.isPending}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open);
          if (!open) setShowError(false);
        }}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
