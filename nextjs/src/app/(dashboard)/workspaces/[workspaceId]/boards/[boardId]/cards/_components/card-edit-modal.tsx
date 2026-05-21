'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardDetailForm } from './card-detail-form';

interface CardItem {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

interface CardEditModalProps {
  workspaceId: string;
  boardId: string;
  card: CardItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CardEditModal({
  workspaceId,
  boardId,
  card,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CardEditModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the card details or delete the card.
          </DialogDescription>
        </DialogHeader>

        <CardDetailForm
          workspaceId={workspaceId}
          boardId={boardId}
          card={card}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
