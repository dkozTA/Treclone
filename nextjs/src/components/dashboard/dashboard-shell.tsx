'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  Star,
  Activity,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useWorkspaces, useWorkspace } from '@/hooks/workspace';
import { useBoard } from '@/hooks/boards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardBreadcrumbs } from './dashboard-breadcrumbs';
import { DashboardMobileNav } from './dashboard-mobile-nav';
import { cn } from '@/lib/utils/cn';

export function DashboardShell({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user, logout, isLoading } = useAuth();
  const { data: workspacesData } = useWorkspaces();
  const [searchValue, setSearchValue] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const routeWorkspaceId =
    typeof params.workspaceId === 'string' ? params.workspaceId : '';
  const routeBoardId = typeof params.boardId === 'string' ? params.boardId : '';

  const { data: routeWorkspace } = useWorkspace(routeWorkspaceId);
  const { data: routeBoard } = useBoard(routeWorkspaceId, routeBoardId);

  const workspaces = workspacesData?.workspaces ?? [];
  const selectedWorkspace =
    routeWorkspace ??
    workspaces.find((workspace) => workspace.id === routeWorkspaceId) ??
    workspaces[0];

  const workspaceId = selectedWorkspace?.id ?? '';
  const workspaceName = selectedWorkspace?.name ?? 'Select workspace';
  const boardName = routeBoard?.title ?? '';

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

  const desktopNavItems = [
    {
      href: workspaceId ? `/workspaces/${workspaceId}/boards` : '/workspaces',
      label: 'All boards',
      icon: LayoutGrid,
    },
    {
      href: workspaceId ? `/workspaces/${workspaceId}/starred` : '/workspaces',
      label: 'Starred',
      icon: Star,
    },
    {
      href: workspaceId ? `/workspaces/${workspaceId}/activity` : '/workspaces',
      label: 'Activity',
      icon: Activity,
    },
    {
      href: workspaceId ? `/workspaces/${workspaceId}/members` : '/workspaces',
      label: 'Team members',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline-ghost bg-surface-1/95 backdrop-blur">
        <div className="flex flex-col gap-gap-md px-gap-md py-gap-md md:h-16 md:flex-row md:items-center md:gap-gap-md md:px-gap-lg md:py-0">
          <div className="flex items-center justify-between gap-gap-md md:shrink-0">
            <div className="flex items-center gap-gap-sm">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open navigation"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
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
            </div>

            <div className="flex items-center gap-gap-sm md:hidden">
              <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <div className="relative w-full md:mx-auto md:max-w-xl md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search boards, tasks, members..."
              className="h-10 pl-10"
            />
          </div>

          <div className="hidden items-center gap-gap-sm md:flex">
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

          {user ? (
            <div className="flex items-center gap-gap-sm md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
                <span className="text-xs font-heading text-white">
                  {userInitial}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-sm font-semibold text-ink">
                  {user.fullName}
                </p>
                <p className="truncate text-label-xs text-ink-muted">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-full animate-pulse rounded-sm bg-surface-2 md:hidden" />
          )}
        </div>
      </header>

      <DashboardMobileNav
        open={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        workspaces={workspaces}
        onLogout={handleLogout}
        isLoggingOut={isLoading}
        pathname={pathname}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-72 flex-col border-r border-hairline-ghost bg-surface-1 md:flex">
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

              <div className="mt-gap-sm space-y-gap-xs rounded-sm bg-surface-2 p-gap-sm">
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
                    className={cn(
                      'block rounded-sm px-gap-md py-gap-sm text-body hover:bg-canvas',
                      workspace.id === workspaceId
                        ? 'bg-canvas text-primary'
                        : 'text-ink'
                    )}
                  >
                    {workspace.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <nav className="flex flex-1 flex-col gap-gap-xs p-gap-md">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-gap-sm rounded-sm px-gap-md py-gap-sm text-body hover:bg-canvas',
                    isActive ? 'bg-canvas text-primary' : 'text-ink'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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

        <main className="flex-1 overflow-auto px-gap-md py-gap-lg md:px-gap-xl md:py-gap-xl">
          <div className="space-y-gap-lg">
            <DashboardBreadcrumbs
              pathname={pathname}
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              boardId={routeBoardId}
              boardName={boardName}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
