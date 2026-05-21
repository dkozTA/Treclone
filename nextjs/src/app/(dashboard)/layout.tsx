'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LayoutGrid,
  Search,
  Settings,
  Star,
  Activity,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useWorkspaces } from '@/hooks/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { data: workspacesData } = useWorkspaces();
  const [searchValue, setSearchValue] = useState('');

  const workspaces = workspacesData?.workspaces ?? [];
  const selectedWorkspace = workspaces[0];

  const workspaceId = selectedWorkspace?.id ?? '';
  const workspaceName = selectedWorkspace?.name ?? 'Select workspace';

  const userInitial = useMemo(() => {
    return user?.fullName?.trim()?.charAt(0)?.toUpperCase() ?? '?';
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline-ghost bg-surface-1/95 backdrop-blur">
        <div className="flex h-16 items-center gap-gap-md px-gap-lg">
          <Link href="/workspaces" className="flex items-center gap-gap-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
              <span className="text-sm font-heading text-white">T</span>
            </div>
            <div className="leading-tight">
              <div className="text-headline-sm font-heading text-ink">
                Treclone
              </div>
              <div className="text-label-xs text-ink-muted">
                Project workspace
              </div>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-center px-gap-lg">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search boards, tasks, members..."
                className="h-10 pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-gap-sm">
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-gap-sm rounded-sm px-gap-sm py-gap-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
                  <span className="text-xs font-heading text-white">
                    {userInitial}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-label-sm font-semibold text-ink">
                    {user.fullName}
                  </p>
                  <p className="truncate text-label-xs text-ink-muted">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-9 w-36 animate-pulse rounded-sm bg-surface-2" />
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="flex w-72 flex-col border-r border-hairline-ghost bg-surface-1">
          <div className="border-b border-hairline-ghost p-gap-md">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-gap-md py-gap-sm hover:bg-canvas">
                <div className="min-w-0">
                  <p className="text-label-xs uppercase tracking-wide text-ink-muted">
                    Workspace
                  </p>
                  <p className="truncate text-body font-semibold text-ink">
                    {workspaceName}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-ink-muted transition-transform group-open:rotate-180" />
              </summary>

              <div className="mt-gap-sm space-y-gap-xs rounded-sm border border-hairline-ghost bg-surface-2 p-gap-sm">
                <Link
                  href="/workspaces"
                  className="block rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
                >
                  All workspaces
                </Link>

                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/workspaces/${workspace.id}`}
                    className="block rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
                  >
                    {workspace.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <nav className="flex flex-1 flex-col gap-gap-xs p-gap-md">
            <Link
              href={
                workspaceId
                  ? `/workspaces/${workspaceId}/boards`
                  : '/workspaces'
              }
              className="flex items-center gap-gap-sm rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>All boards</span>
            </Link>

            <Link
              href={
                workspaceId
                  ? `/workspaces/${workspaceId}/starred`
                  : '/workspaces'
              }
              className="flex items-center gap-gap-sm rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </Link>

            <Link
              href={
                workspaceId
                  ? `/workspaces/${workspaceId}/activity`
                  : '/workspaces'
              }
              className="flex items-center gap-gap-sm rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
            >
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </Link>

            <Link
              href={
                workspaceId
                  ? `/workspaces/${workspaceId}/members`
                  : '/workspaces'
              }
              className="flex items-center gap-gap-sm rounded-sm px-gap-md py-gap-sm text-body text-ink hover:bg-canvas"
            >
              <Users className="h-4 w-4" />
              <span>Team members</span>
            </Link>
          </nav>

          <div className="mt-auto border-t border-hairline-ghost p-gap-md">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/settings">
                <Settings className="mr-gap-sm h-4 w-4" />
                Settings
              </Link>
            </Button>

            <Button
              variant="outline"
              className="mt-gap-sm w-full justify-start"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-gap-sm h-4 w-4" />
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-gap-xl">{children}</main>
      </div>
    </div>
  );
}
