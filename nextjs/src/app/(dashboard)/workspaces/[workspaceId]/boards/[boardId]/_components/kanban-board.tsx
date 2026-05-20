'use client';

import { useState, useMemo, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLists, useCreateList } from '@/hooks/lists';
import { Plus } from 'lucide-react';
import { KanbanList } from './kanban-list';
import { AddListButton } from './add-list-button';
import { AddListModal } from './add-list-modal';
import { AddCardModal } from './add-card-modal';

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

export function KanbanBoard({
  boardId,
  workspaceId,
}: Readonly<KanbanBoardProps>) {
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [listCards, setListCards] = useState<Record<string, CardItem[]>>({});
  const [loadingCards, setLoadingCards] = useState(false);

  // Queries & Mutations
  const { data: listsData, isLoading: listsLoading } = useLists(
    workspaceId,
    boardId
  );
  const createListMutation = useCreateList(workspaceId, boardId);

  const lists = useMemo(
    () => listsData?.data?.lists || [],
    [listsData?.data?.lists]
  );

  // Fetch cards for each list using useEffect
  useEffect(() => {
    const fetchAllCards = async () => {
      if (lists.length === 0) return;

      setLoadingCards(true);
      const cardsMap: Record<string, CardItem[]> = {};

      try {
        for (const list of lists) {
          const response = await fetch(
            `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${list.id}/cards`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (response.ok) {
            const data = await response.json();
            cardsMap[list.id] = data?.data?.cards || [];
          } else {
            cardsMap[list.id] = [];
          }
        }
        setListCards(cardsMap);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchAllCards();
  }, [lists, workspaceId, boardId]);

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/lists/${source.droppableId}/cards/${draggableId}/move`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            listId: destination.droppableId,
            position: destination.index,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to move card');
      }
    } catch (error) {
      console.error('Failed to move card:', error);
    }
  };

  if (listsLoading || loadingCards) {
    return (
      <div className="space-y-gap-lg">
        <Skeleton className="h-12 w-64" />
        <div className="flex gap-gap-lg overflow-x-auto pb-gap-md">
          {[1, 2, 3].map((i) => (
            <div
              key={`skeleton-${i}`}
              className="flex-shrink-0 w-80 space-y-gap-md"
            >
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
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-heading text-ink">Board</h1>
        <Button
          variant="default"
          onClick={() => setShowAddListModal(true)}
          disabled={createListMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-gap-sm" />
          Add List
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-gap-lg overflow-x-auto pb-gap-md">
          {lists.map((list) => (
            <KanbanList
              key={list.id}
              listId={list.id}
              title={list.title}
              cards={listCards[list.id] || []}
              onAddCard={openAddCardModal}
            />
          ))}

          <AddListButton
            onAdd={() => setShowAddListModal(true)}
            isLoading={createListMutation.isPending}
          />
        </div>
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
          }}
        />
      )}
    </>
  );
}
