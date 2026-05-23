'use client';

import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils/cn';
import { KanbanCard } from './kanban-card';
import { Trash2 } from 'lucide-react';

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
  onDeleteList: (listId: string, title: string) => void;
  onDeleteCard: (card: Card) => void;
}

export function KanbanList({
  listId,
  title,
  cards,
  onAddCard,
  onDeleteList,
  onDeleteCard,
}: Readonly<KanbanListProps>) {
  return (
    <div className="min-w-0 bg-surface-1 rounded-sm p-gap-md">
      <div className="mb-gap-md flex items-center justify-between gap-gap-sm">
        <h2 className="truncate text-title-md font-heading text-ink">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => onDeleteList(listId, title)}
          className="rounded-sm p-gap-xs text-destructive transition-colors hover:bg-destructive/10"
          aria-label={`Delete list ${title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
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
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onDelete={onDeleteCard}
              />
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
