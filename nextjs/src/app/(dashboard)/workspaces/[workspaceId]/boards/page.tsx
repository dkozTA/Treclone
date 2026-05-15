'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface Board {
  id: string;
  title: string;
  description: string;
  lists: number;
  cards: number;
}

export default function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBoards([
        {
          id: '1',
          title: 'Q2 Planning',
          description: 'Quarterly roadmap',
          lists: 5,
          cards: 23,
        },
        {
          id: '2',
          title: 'UI Components',
          description: 'Design library',
          lists: 3,
          cards: 15,
        },
        {
          id: '3',
          title: 'Marketing Sprint',
          description: 'Campaign tasks',
          lists: 4,
          cards: 18,
        },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
            My Boards
          </h1>
          <p className="text-body text-ink-muted">
            Manage and organize your tasks across different boards
          </p>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-gap-sm" />
          Create Board
        </Button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Card
              key={board.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="pt-gap-lg">
                <a href={`/boards/${board.id}`}>
                  <h3 className="text-title-md font-heading text-ink mb-gap-sm">
                    {board.title}
                  </h3>
                  <p className="text-body text-ink-muted mb-gap-lg">
                    {board.description}
                  </p>
                  <div className="flex items-center justify-between text-label-sm text-ink-muted">
                    <span>{board.lists} Lists</span>
                    <span>{board.cards} Cards</span>
                  </div>
                </a>
                <button className="mt-gap-md text-destructive hover:bg-destructive/5 p-gap-sm rounded-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-gap-lg text-center py-gap-xl">
              <p className="text-body text-ink-muted">
                Create a new board to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
