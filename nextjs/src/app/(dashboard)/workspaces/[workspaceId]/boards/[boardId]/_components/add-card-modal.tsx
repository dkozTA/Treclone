'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useCreateCard } from '@/hooks/cards';
import { X } from 'lucide-react';

interface CardItem {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  listId: string;
}

interface AddCardModalProps {
  listId: string;
  workspaceId: string;
  boardId: string;
  onClose: () => void;
  onCardCreated: (card: { card: CardItem }) => void;
}

export function AddCardModal({
  listId,
  workspaceId,
  boardId,
  onClose,
  onCardCreated,
}: Readonly<AddCardModalProps>) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const { mutate: createCard, isPending } = useCreateCard(
    workspaceId,
    boardId,
    listId
  );

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    createCard(formData, {
      onSuccess: (response) => {
        onCardCreated(response.data);
        setFormData({ title: '', description: '' });
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="p-gap-lg space-y-gap-lg border-b border-hairline-ghost flex items-center justify-between">
          <h2 className="text-headline-sm font-heading text-ink">
            Create Card
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink"
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-gap-lg space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Card Title
            </Label>
            <Input
              type="text"
              placeholder="e.g., Design header"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isPending}
              autoFocus
            />
          </div>

          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              Description (Optional)
            </Label>
            <textarea
              placeholder="Add more details..."
              className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm bg-surface-2 text-body"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isPending}
            />
          </div>

          <div className="flex gap-gap-md pt-gap-md">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isPending || !formData.title.trim()}
            >
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
