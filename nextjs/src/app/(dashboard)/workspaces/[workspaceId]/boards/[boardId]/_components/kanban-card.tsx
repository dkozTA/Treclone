'use client';

import { Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  listId: string;
}

interface KanbanCardProps {
  card: Card;
  index: number;
}

export function KanbanCard({ card, index }: KanbanCardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-surface-2 p-gap-md rounded-sm cursor-grab hover:shadow-sm transition-shadow active:cursor-grabbing',
            snapshot.isDragging && 'shadow-lg ring-1 ring-hairline-ghost'
          )}
        >
          <p className="text-body text-ink">{card.title}</p>
          {card.description && (
            <p className="text-label-sm text-ink-muted mt-gap-sm">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
