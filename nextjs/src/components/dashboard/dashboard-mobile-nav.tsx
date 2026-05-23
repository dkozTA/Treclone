'use client';

import Link from 'next/link';
import {
  ChevronDown,
  LayoutGrid,
  Settings,
  Star,
  Activity,
  Users,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface WorkspaceItem {
  id: string;
  name: string;
}

export function DashboardMobileNav({
  open,
  onOpenChange,
  workspaces,
  workspaceId,
  workspaceName,
  pathname,
  onLogout,
  isLoggingOut,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: WorkspaceItem[];
  workspaceId: string;
  workspaceName: string;
  pathname: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}>) {
  const navItems = [
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
    <div
      className={cn(
        'fixed inset-0 z-50 md:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        aria-label="Close navigation overlay"
        onClick={() => onOpenChange(false)}
      />

      <aside
        className={cn(
          'relative flex h-full w-[88vw] max-w-xs flex-col bg-surface-1 shadow-2xl transition-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-hairline-ghost px-gap-md py-gap-md">
          <div>
            <p className="text-label-xs uppercase tracking-wide text-ink-muted">
              Workspace
            </p>
            <p className="truncate text-body font-semibold text-ink">
              {workspaceName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close navigation"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-hairline-ghost px-gap-md py-gap-md">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-gap-md py-gap-sm hover:bg-canvas">
              <div className="min-w-0">
                <p className="text-label-xs uppercase tracking-wide text-ink-muted">
                  Switch workspace
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
                onClick={() => onOpenChange(false)}
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
                  onClick={() => onOpenChange(false)}
                >
                  {workspace.name}
                </Link>
              ))}
            </div>
          </details>
        </div>

        <nav className="flex flex-1 flex-col gap-gap-xs p-gap-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
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

        <div className="border-t border-hairline-ghost p-gap-md">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/settings" onClick={() => onOpenChange(false)}>
              <Settings className="mr-gap-sm h-4 w-4" />
              Settings
            </Link>
          </Button>

          <Button
            variant="outline"
            className="mt-gap-sm w-full justify-start"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-gap-sm h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
