'use client';

import { useParams } from 'next/navigation';
import { KanbanBoard } from './_components/kanban-board';

export default function BoardPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  return (
    <main className="space-y-gap-lg">
      <KanbanBoard boardId={boardId} workspaceId={workspaceId} />
    </main>
  );
}
