'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateCard, useDeleteCard } from '@/hooks/cards';
import { useBoardMembers } from '@/hooks/board-members';
import { AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const updateCardFormSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(255).optional(),
  description: z.string().max(1000).optional(),
  assigneeUserId: z.string().optional(),
});

type UpdateCardFormInput = z.infer<typeof updateCardFormSchema>;

interface CardDetailFormProps {
  workspaceId: string;
  boardId: string;
  card: {
    id: string;
    title: string;
    description?: string;
    assigneeId?: string;
    listId: string;
    createdAt: string;
    updatedAt: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CardDetailForm({
  workspaceId,
  boardId,
  card,
  onSuccess,
  onCancel,
}: Readonly<CardDetailFormProps>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: membersData, isLoading: membersLoading } = useBoardMembers(
    workspaceId,
    boardId
  );
  const updateMutation = useUpdateCard(
    workspaceId,
    boardId,
    card.listId,
    card.id
  );
  const deleteMutation = useDeleteCard(
    workspaceId,
    boardId,
    card.listId,
    card.id
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateCardFormInput>({
    resolver: zodResolver(updateCardFormSchema),
    defaultValues: {
      title: card.title,
      description: card.description || '',
      assigneeUserId: card.assigneeId || '',
    },
  });

  useEffect(() => {
    reset({
      title: card.title,
      description: card.description || '',
      assigneeUserId: card.assigneeId || '',
    });
    setShowDeleteConfirm(false);
  }, [card, reset]);

  const assigneeId = watch('assigneeUserId');
  const members = Array.isArray(membersData?.data) ? membersData.data : [];
  const onSubmit = (formData: UpdateCardFormInput) => {
    updateMutation.mutate(formData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-gap-lg">
      {(updateMutation.error || deleteMutation.error) && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg flex gap-gap-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-gap-sm" />
            <div>
              <p className="text-destructive text-body font-medium">Error</p>
              <p className="text-destructive text-label-sm">
                {updateMutation.error?.message || deleteMutation.error?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{card.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-lg">
            <div className="space-y-gap-sm">
              <Label htmlFor="title">Card Title</Label>
              <Input
                id="title"
                placeholder="Card title"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-destructive text-label-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-gap-sm">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Card description..."
                className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-body font-body disabled:opacity-50"
                disabled={isLoading}
                {...register('description')}
                rows={4}
              />
              {errors.description && (
                <p className="text-destructive text-label-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-gap-sm">
              <Label htmlFor="assignee">Assignee</Label>
              {membersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="assignee"
                  className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-body font-body disabled:opacity-50"
                  value={assigneeId?.toString() || ''}
                  onChange={(e) => {
                    setValue('assigneeUserId', e.target.value);
                  }}
                  disabled={isLoading}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-gap-md pt-gap-md">
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                className="flex items-center gap-gap-sm"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-label-sm text-ink-muted mb-gap-md">
            This action cannot be undone. The card will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
          >
            Delete Card
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Card"
        description={`Delete "${card.title}"? This action cannot be undone.`}
        confirmLabel="Delete Card"
        isLoading={deleteMutation.isPending}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
      />
    </div>
  );
}
