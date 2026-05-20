'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AddListModalProps {
  onClose: () => void;
  onCreate: (data: { title: string }) => void;
  isLoading?: boolean;
}

export function AddListModal({
  onClose,
  onCreate,
  isLoading,
}: AddListModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({ title });
    setTitle('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="p-gap-lg space-y-gap-lg border-b border-hairline-ghost flex items-center justify-between">
          <h2 className="text-headline-sm font-heading text-ink">
            Create List
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-gap-lg space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label className="text-label-sm font-medium text-ink">
              List Title
            </Label>
            <Input
              type="text"
              placeholder="e.g., To Do"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
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
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
