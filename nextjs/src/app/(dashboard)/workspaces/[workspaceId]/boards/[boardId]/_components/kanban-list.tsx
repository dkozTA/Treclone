'use client';

import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils/cn';
import { KanbanCard } from './kanban-card';

interface Card {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  listId: string;
}

interface KanbanListProps {
  listId: string;
  title: string;
  cards: Card[];
  onAddCard: (listId: string) => void;
}

export function KanbanList({
  listId,
  title,
  cards,
  onAddCard,
}: KanbanListProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-surface-1 rounded-sm p-gap-md">
      <h2 className="text-title-md font-heading text-ink mb-gap-md">{title}</h2>
      <Droppable droppableId={listId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-28 space-y-gap-sm rounded-sm transition-colors',
              snapshot.isDraggingOver && 'bg-surface-2/40'
            )}
          >
            {cards.map((card, index) => (
              <KanbanCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
            <button
              onClick={() => onAddCard(listId)}
              className="w-full text-ink-muted hover:text-ink text-body py-gap-md transition-colors"
            >
              + Add Card
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}
