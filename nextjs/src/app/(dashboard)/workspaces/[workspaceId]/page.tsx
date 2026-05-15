'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Users, BookOpen } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  boardsCount: number;
  recentBoards: Array<{ id: string; title: string }>;
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWorkspace({
        id: '1',
        name: 'Design Team',
        description: 'All design projects and tasks',
        membersCount: 5,
        boardsCount: 8,
        recentBoards: [
          { id: '1', title: 'Q2 Planning' },
          { id: '2', title: 'UI Components' },
          { id: '3', title: 'Design System' },
        ],
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!workspace) return <div>Loading...</div>;

  return (
    <main className="space-y-gap-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-gap-sm">
          <h1 className="text-headline-lg font-heading text-ink">
            {workspace.name}
          </h1>
          <p className="text-body text-ink-muted">{workspace.description}</p>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-gap-sm" />
          New Board
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-gap-lg">
        <Card>
          <CardContent className="pt-gap-lg flex items-center gap-gap-lg">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-4xl font-heading text-ink">
                {workspace.membersCount}
              </p>
              <p className="text-body text-ink-muted">Team Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-gap-lg flex items-center gap-gap-lg">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <p className="text-4xl font-heading text-ink">
                {workspace.boardsCount}
              </p>
              <p className="text-body text-ink-muted">Active Boards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Boards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Boards</CardTitle>
          <CardDescription>Quick access to your recent work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {workspace.recentBoards.map((board) => (
              <a
                key={board.id}
                href={`/workspaces/${workspace.id}/boards/${board.id}`}
                className="block p-gap-md bg-surface-1 rounded-sm hover:bg-surface-2 transition-colors"
              >
                <p className="text-body text-ink font-medium">{board.title}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
