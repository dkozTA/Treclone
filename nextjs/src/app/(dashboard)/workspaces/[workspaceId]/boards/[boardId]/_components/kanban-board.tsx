'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists, useCreateList, useDeleteList } from '@/hooks/lists';
import { useDeleteCard } from '@/hooks/cards';
import { useBoard } from '@/hooks/boards';
import {
  CalendarDays,
  Columns3,
  LayoutList,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import { KanbanList } from './kanban-list';
import { AddListButton } from './add-list-button';
import { AddListModal } from './add-list-modal';
import { AddCardModal } from './add-card-modal';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

interface CardItem {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  listId: string;
}

interface KanbanBoardProps {
  boardId: string;
  workspaceId: string;
}

function useMoveCardMutation(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sourceListId: string;
      cardId: string;
      destinationListId: string;
      position: number;
    }) => {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${data.sourceListId}/cards/${data.cardId}/move`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            listId: data.destinationListId,
            position: data.position,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to move card');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cards', workspaceId, boardId, variables.sourceListId],
      });
      queryClient.invalidateQueries({
        queryKey: ['cards', workspaceId, boardId, variables.destinationListId],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-board-cards', workspaceId, boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ['lists', workspaceId, boardId],
      });
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] });
    },
  });
}

export function KanbanBoard({
  boardId,
  workspaceId,
}: Readonly<KanbanBoardProps>) {
  const { data: board } = useBoard(workspaceId, boardId);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [listCards, setListCards] = useState<Record<string, CardItem[]>>({});
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  const { data: listsData, isLoading: listsLoading } = useLists(
    workspaceId,
    boardId
  );
  const createListMutation = useCreateList(workspaceId, boardId);
  const moveCardMutation = useMoveCardMutation(workspaceId, boardId);
  const deleteListMutation = useDeleteList(
    workspaceId,
    boardId,
    listToDelete?.id ?? ''
  );
  const deleteCardMutation = useDeleteCard(
    workspaceId,
    boardId,
    cardToDelete?.listId ?? '',
    cardToDelete?.id ?? ''
  );

  const lists = useMemo(
    () => listsData?.data?.lists || [],
    [listsData?.data?.lists]
  );

  const totalCards = useMemo(
    () => lists.reduce((count, list) => count + (list.cards?.length || 0), 0),
    [lists]
  );

  const boardUpdatedAt = board?.updatedAt
    ? new Date(board.updatedAt).toLocaleDateString()
    : null;

  useEffect(() => {
    const cardsMap: Record<string, CardItem[]> = {};

    for (const list of lists) {
      cardsMap[list.id] = list.cards || [];
    }

    setListCards(cardsMap);
  }, [lists]);

  const handleCreateList = (data: { title: string }) => {
    createListMutation.mutate(data, {
      onSuccess: () => {
        setShowAddListModal(false);
      },
    });
  };

  const openAddCardModal = (listId: string) => {
    setSelectedListId(listId);
    setShowAddCardModal(true);
  };

  const moveCardInState = (
    currentCards: Record<string, CardItem[]>,
    result: DropResult
  ) => {
    const { source, destination, draggableId } = result;
    if (!destination) return currentCards;

    const sourceCards = [...(currentCards[source.droppableId] || [])];
    const destinationCards =
      source.droppableId === destination.droppableId
        ? sourceCards
        : [...(currentCards[destination.droppableId] || [])];
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (!movedCard) return currentCards;

    destinationCards.splice(destination.index, 0, {
      ...movedCard,
      id: draggableId,
      listId: destination.droppableId,
    });

    if (source.droppableId === destination.droppableId) {
      return {
        ...currentCards,
        [source.droppableId]: destinationCards.map((card, index) => ({
          ...card,
          position: index,
        })),
      };
    }

    return {
      ...currentCards,
      [source.droppableId]: sourceCards.map((card, index) => ({
        ...card,
        position: index,
      })),
      [destination.droppableId]: destinationCards.map((card, index) => ({
        ...card,
        position: index,
      })),
    };
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const previousCards = listCards;
    setListCards(moveCardInState(previousCards, result));

    moveCardMutation.mutate(
      {
        sourceListId: source.droppableId,
        cardId: draggableId,
        destinationListId: destination.droppableId,
        position: destination.index,
      },
      {
        onError: () => {
          setListCards(previousCards);
        },
      }
    );
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    const { id: listId } = listToDelete;
    const previousCards = listCards;

    setIsDeletingList(true);
    setListCards((current) => {
      const next = { ...current };
      delete next[listId];
      return next;
    });

    deleteListMutation.mutate(undefined, {
      onSuccess: () => {
        setListToDelete(null);
      },
      onError: () => {
        setListCards(previousCards);
      },
      onSettled: () => {
        setIsDeletingList(false);
      },
    });
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    const previousCards = listCards;

    setListCards((current) => ({
      ...current,
      [cardToDelete.listId]: (current[cardToDelete.listId] || []).filter(
        (item) => item.id !== cardToDelete.id
      ),
    }));

    setIsDeletingCard(true);

    deleteCardMutation.mutate(undefined, {
      onSuccess: () => {
        setCardToDelete(null);
      },
      onError: () => {
        setListCards(previousCards);
      },
      onSettled: () => {
        setIsDeletingCard(false);
      },
    });
  };

  if (listsLoading) {
    return (
      <div className="space-y-gap-lg">
        <div className="flex flex-col gap-gap-md md:flex-row md:items-start md:justify-between">
          <div className="space-y-gap-sm">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-gap-md md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={`summary-skeleton-${i}`}>
              <CardContent className="space-y-gap-sm pt-gap-lg">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="space-y-gap-md">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-40 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardPageHeader
        title={board?.title ?? 'Board'}
        description={
          board?.description ||
          'Manage lists, cards, and team flow in one place.'
        }
        backHref={`/workspaces/${workspaceId}`}
        actions={
          <>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/workspaces/${workspaceId}/boards/${boardId}/edit`}>
                <Pencil className="mr-gap-sm h-4 w-4" />
                Edit Board
              </Link>
            </Button>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setShowAddListModal(true)}
              disabled={createListMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-gap-sm" />
              Add List
            </Button>
          </>
        }
      />

      <div className="grid gap-gap-md md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Lists</p>
              <p className="text-title-lg font-heading text-ink">
                {lists.length}
              </p>
            </div>
            <Columns3 className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Cards</p>
              <p className="text-title-lg font-heading text-ink">
                {totalCards}
              </p>
            </div>
            <LayoutList className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-gap-md pt-gap-lg">
            <div>
              <p className="text-label-sm text-ink-muted">Updated</p>
              <p className="text-title-lg font-heading text-ink">
                {boardUpdatedAt || 'Today'}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-ink-muted" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-gap-sm text-label-sm text-ink-muted">
        <Badge variant="secondary">Workspace {workspaceId}</Badge>
        <Badge variant="secondary">Board {boardId}</Badge>
        <span className="inline-flex items-center gap-gap-xs">
          <Users className="h-3.5 w-3.5" />
          Collaborative board view
        </span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {lists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-gap-md py-gap-xl text-center">
              <div className="space-y-gap-sm">
                <p className="text-title-md font-heading text-ink">
                  No lists yet
                </p>
                <p className="max-w-lg text-body text-ink-muted">
                  Start the board by creating your first list, then add cards to
                  map out the workflow.
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => setShowAddListModal(true)}
                disabled={createListMutation.isPending}
              >
                <Plus className="mr-gap-sm h-4 w-4" />
                Add your first list
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {lists.map((list) => (
              <KanbanList
                key={list.id}
                listId={list.id}
                title={list.title}
                cards={listCards[list.id] || []}
                onAddCard={openAddCardModal}
                onDeleteList={(listId, title) =>
                  setListToDelete({ id: listId, title })
                }
                onDeleteCard={setCardToDelete}
              />
            ))}

            <AddListButton
              onAdd={() => setShowAddListModal(true)}
              isLoading={createListMutation.isPending}
            />
          </div>
        )}
      </DragDropContext>

      {showAddListModal && (
        <AddListModal
          onClose={() => setShowAddListModal(false)}
          onCreate={handleCreateList}
          isLoading={createListMutation.isPending}
        />
      )}

      {showAddCardModal && selectedListId && (
        <AddCardModal
          listId={selectedListId}
          workspaceId={workspaceId}
          boardId={boardId}
          onClose={() => {
            setShowAddCardModal(false);
            setSelectedListId(null);
          }}
          onCardCreated={(response) => {
            setListCards((prev) => ({
              ...prev,
              [selectedListId]: [
                ...(prev[selectedListId] || []),
                response.card,
              ],
            }));
            setShowAddCardModal(false);
            setSelectedListId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!listToDelete}
        title="Delete List"
        description={`Delete "${listToDelete?.title || ''}"? This will delete all cards in the list.`}
        isLoading={isDeletingList || deleteListMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !isDeletingList) setListToDelete(null);
        }}
        onConfirm={handleDeleteList}
      />

      <ConfirmDialog
        open={!!cardToDelete}
        title="Delete Card"
        description={`Delete "${cardToDelete?.title || ''}"?`}
        isLoading={isDeletingCard || deleteCardMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !isDeletingCard) setCardToDelete(null);
        }}
        onConfirm={handleDeleteCard}
      />
    </>
  );
}
