'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAllBoardCards } from '@/hooks/cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, CalendarDays, Tag } from 'lucide-react';
import Link from 'next/link';
import { CardEditModal } from './_components/card-edit-modal';

interface CardItem {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position?: number;
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
}

export default function CardsPage() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);

  const { data, isLoading, error } = useAllBoardCards(workspaceId, boardId);

  const cards = useMemo<CardItem[]>(() => {
    const allCards = (data?.data ?? []) as CardItem[];

    if (!search.trim()) return allCards;

    const query = search.toLowerCase();
    return allCards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        (card.description || '').toLowerCase().includes(query)
    );
  }, [data, search]);

  const closeModal = () => {
    setSelectedCard(null);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl space-y-gap-lg px-gap-md py-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <Skeleton className="h-11 w-full max-w-md" />

        <div className="grid gap-gap-md md:grid-cols-2 xl:grid-cols-3">
          {[
            'card-skeleton-1',
            'card-skeleton-2',
            'card-skeleton-3',
            'card-skeleton-4',
            'card-skeleton-5',
            'card-skeleton-6',
          ].map((id) => (
            <Card key={id}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-gap-sm">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-gap-lg px-gap-md py-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/workspaces/${workspaceId}/boards/${boardId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-headline-lg font-heading text-ink">Cards</h1>
            <p className="text-body text-destructive">
              Failed to load cards: {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-6xl space-y-gap-lg px-gap-md py-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/workspaces/${workspaceId}/boards/${boardId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <h1 className="text-headline-lg font-heading text-ink">Cards</h1>
            <p className="text-body text-ink-muted">
              Browse all cards in this board
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-gap-sm text-label-sm text-ink-muted">
          <Badge variant="secondary">{cards.length} cards</Badge>
          <span>Workspace {workspaceId}</span>
          <span>Board {boardId}</span>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-gap-xl text-center">
              <Tag className="mx-auto mb-gap-sm h-10 w-10 text-ink-muted" />
              <p className="text-body font-medium text-ink">No cards found</p>
              <p className="text-label-sm text-ink-muted">
                {search
                  ? 'Try a different search term.'
                  : 'Create a list first, then add your cards.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-gap-md md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCard(card)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedCard(card);
                  }
                }}
              >
                <CardHeader className="space-y-gap-sm">
                  <CardTitle className="text-title-md font-heading text-ink">
                    {card.title}
                  </CardTitle>
                  <div className="flex items-center gap-gap-sm text-label-sm text-ink-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      Updated {new Date(card.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-gap-md">
                  <p className="line-clamp-3 text-body text-ink-muted">
                    {card.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between gap-gap-sm">
                    <Badge variant="outline">List {card.listId}</Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCard(card);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedCard && (
        <CardEditModal
          isOpen={!!selectedCard}
          workspaceId={workspaceId}
          boardId={boardId}
          card={selectedCard}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}
    </>
  );
}
