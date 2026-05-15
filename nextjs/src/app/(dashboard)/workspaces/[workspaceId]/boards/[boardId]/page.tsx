'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface List {
  id: string;
  title: string;
  cards: Array<{ id: string; title: string }>;
}

export default function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLists([
        {
          id: '1',
          title: 'To Do',
          cards: [{ id: '1', title: 'Design header' }],
        },
        {
          id: '2',
          title: 'In Progress',
          cards: [{ id: '2', title: 'Build navigation' }],
        },
        {
          id: '3',
          title: 'Done',
          cards: [{ id: '3', title: 'Setup project' }],
        },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="space-y-gap-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-heading text-ink">Q2 Planning</h1>
        <Button variant="outline">+ Add List</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-gap-lg overflow-x-auto pb-gap-md">
        {lists.map((list) => (
          <div
            key={list.id}
            className="flex-shrink-0 w-80 bg-surface-1 rounded-sm p-gap-md"
          >
            <h2 className="text-title-md font-heading text-ink mb-gap-md">
              {list.title}
            </h2>
            <div className="space-y-gap-sm">
              {list.cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-surface-2 p-gap-md rounded-sm cursor-move hover:shadow-sm transition-shadow"
                >
                  <p className="text-body text-ink">{card.title}</p>
                </div>
              ))}
              <button className="w-full text-ink-muted hover:text-ink text-body py-gap-md">
                + Add Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
