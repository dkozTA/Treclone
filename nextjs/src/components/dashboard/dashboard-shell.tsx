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
import { DashboardMobileNav } from './dashboard-mobile-nav';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

export function DashboardShell({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const params = useParams() ?? {};
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

  // selected workspace id/name from list or fetched resource
  const workspaceIdFromList = selectedWorkspace?.id ?? '';
  const workspaceNameFromList = selectedWorkspace?.name ?? 'Select workspace';

  // Use route param first (when present) so UI stays stable during async loads
  const navWorkspaceId = routeWorkspaceId || workspaceIdFromList;
  const navWorkspaceName = routeWorkspace?.name ?? workspaceNameFromList;

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
      id: 'boards',
      href: navWorkspaceId
        ? `/workspaces/${navWorkspaceId}/boards`
        : '/workspaces',
      label: 'All boards',
      icon: LayoutGrid,
    },
    {
      id: 'starred',
      href: navWorkspaceId
        ? `/workspaces/${navWorkspaceId}/starred`
        : '/workspaces',
      label: 'Starred',
      icon: Star,
    },
    {
      id: 'activity',
      href: navWorkspaceId
        ? `/workspaces/${navWorkspaceId}/activity`
        : '/workspaces',
      label: 'Activity',
      icon: Activity,
    },
    {
      id: 'members',
      href: navWorkspaceId
        ? `/workspaces/${navWorkspaceId}/members`
        : '/workspaces',
      label: 'Team members',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
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
              <Link href="/" className="flex items-center">
                <span className="inline-flex items-center justify-center rounded-full bg-surface-2">
                  <Image
                    src="/logo.png"
                    alt="Treclone"
                    width={190}
                    height={44}
                    className="h-9 w-auto object-contain"
                    priority
                  />
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-gap-sm md:hidden">
              <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />

              {user ? (
                <Link
                  href="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary transition-colors hover:opacity-90"
                  aria-label="Open profile"
                >
                  <span className="text-xs font-heading text-white">
                    {userInitial}
                  </span>
                </Link>
              ) : (
                <div className="h-9 w-9 animate-pulse rounded-sm bg-surface-2" />
              )}
            </div>
          </div>

          <div className="relative w-full md:mx-auto md:max-w-xl md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search boards, lists, cards, ..."
              className="h-10 pl-10"
            />
          </div>

          <div className="hidden items-center gap-gap-sm md:flex">
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-gap-sm rounded-sm px-gap-sm py-gap-xs transition-colors hover:bg-canvas"
              >
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
              </Link>
            ) : (
              <div className="h-9 w-36 animate-pulse rounded-sm bg-surface-2" />
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumbs disabled */}

      {/* Mobile Navigation */}
      <DashboardMobileNav
        open={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
        workspaceId={navWorkspaceId}
        workspaceName={navWorkspaceName}
        workspaces={workspaces}
        onLogout={handleLogout}
        isLoggingOut={isLoading}
        pathname={pathname}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex min-h-[calc(100vh-4rem)] gap-gap-lg bg-canvas p-gap-md md:p-gap-lg">
        {/* Sidebar - Desktop */}
        <aside className="sticky top-[5.5rem] hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-hairline-ghost bg-surface-1 md:flex">
          <div className="shrink-0 border-b border-hairline-ghost p-gap-md">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-gap-md py-gap-sm hover:bg-canvas">
                <div className="min-w-0">
                  <p className="text-label-xs uppercase tracking-wide text-ink-muted">
                    Workspace
                  </p>
                  <p className="truncate text-body font-semibold text-ink">
                    {navWorkspaceName}
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
                      workspace.id === navWorkspaceId
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

          <nav className="flex flex-1 flex-col gap-gap-xs overflow-y-auto p-gap-md">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
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

          <div className="shrink-0 border-t border-hairline-ghost p-gap-md">
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
            >
              <LogOut className="mr-gap-sm h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        {/* Main Content */}
        <main className="min-w-0 flex-1 rounded-xl bg-surface-2 p-gap-lg md:p-gap-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
