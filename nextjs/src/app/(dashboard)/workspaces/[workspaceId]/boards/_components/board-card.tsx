'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useDeleteBoard } from '@/hooks/boards';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
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

        {/* Board Link */}
        {!showDeleteConfirm && (
          <>
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

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
              className="mt-gap-md text-destructive hover:bg-destructive/5 p-gap-sm rounded-sm disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="space-y-gap-md p-gap-md bg-destructive/5 rounded-sm">
            <div>
              <p className="text-body text-ink font-medium mb-gap-sm">
                Delete "{board.title}"?
              </p>
              <p className="text-label-sm text-ink-muted">
                This action cannot be undone. All boards content will be
                deleted.
              </p>
            </div>
            <div className="flex gap-gap-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowError(false);
                }}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-gap-sm"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
