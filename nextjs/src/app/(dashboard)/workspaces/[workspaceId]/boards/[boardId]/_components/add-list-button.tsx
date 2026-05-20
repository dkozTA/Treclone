'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddListButtonProps {
  onAdd: () => void;
  isLoading?: boolean;
}

export function AddListButton({ onAdd, isLoading }: AddListButtonProps) {
  return (
    <div className="flex-shrink-0 w-80 flex items-start">
      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full"
        disabled={isLoading}
      >
        <Plus className="h-4 w-4 mr-gap-sm" />
        Add List
      </Button>
    </div>
  );
}
