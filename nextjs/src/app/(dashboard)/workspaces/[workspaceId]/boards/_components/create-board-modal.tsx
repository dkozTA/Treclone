'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBoard } from '@/hooks/boards';
import {
  createBoardSchema,
  type CreateBoardInput,
} from '@/lib/validation/board';
import { AlertCircle, Loader2 } from 'lucide-react';

interface CreateBoardModalProps {
  workspaceId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateBoardModal({
  workspaceId,
  onSuccess,
  onCancel,
}: Readonly<CreateBoardModalProps>) {
  const createMutation = useCreateBoard(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
  });

  const onSubmit = (formData: CreateBoardInput) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Create New Board</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-lg">
            {/* Error State */}
            {createMutation.error && (
              <div className="p-gap-md bg-destructive/5 rounded-sm flex gap-gap-sm">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-destructive text-label-sm font-medium">
                    Error
                  </p>
                  <p className="text-destructive text-label-xs">
                    {createMutation.error.message}
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-gap-sm">
              <Label htmlFor="title">Board Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Q2 Planning"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-destructive text-label-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-gap-sm">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Optional board description..."
                className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-body font-body disabled:opacity-50"
                disabled={isLoading}
                {...register('description')}
                rows={3}
              />
              {errors.description && (
                <p className="text-destructive text-label-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-gap-md pt-gap-md">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  reset();
                  onCancel?.();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1 flex items-center justify-center gap-gap-sm"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Board
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
