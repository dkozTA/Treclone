'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type DashboardBreadcrumbItem = {
  label: string;
  href?: string;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildWorkspaceBreadcrumbs(args: {
  segments: string[];
  workspaceId?: string;
  workspaceName?: string;
  boardId?: string;
  boardName?: string;
}): DashboardBreadcrumbItem[] {
  const { segments, workspaceId, workspaceName, boardId, boardName } = args;
  const items: DashboardBreadcrumbItem[] = [];
  const push = (label: string, href?: string) => items.push({ label, href });

  push('Workspaces', '/workspaces');

  if (workspaceId) {
    push(
      workspaceName || `Workspace ${workspaceId}`,
      `/workspaces/${workspaceId}`
    );
  }

  const boardsIndex = segments.indexOf('boards');
  if (boardsIndex === -1) {
    const section = segments[2];
    if (section) {
      push(
        capitalize(section),
        workspaceId ? `/workspaces/${workspaceId}/${section}` : undefined
      );
    }
    return items;
  }

  push(
    'Boards',
    workspaceId ? `/workspaces/${workspaceId}/boards` : '/workspaces'
  );

  if (boardId) {
    push(
      boardName || `Board ${boardId}`,
      `/workspaces/${workspaceId}/boards/${boardId}`
    );
  }

  const nextSegment = segments[boardsIndex + 2];
  if (nextSegment) {
    push(
      capitalize(nextSegment),
      boardId
        ? `/workspaces/${workspaceId}/boards/${boardId}/${nextSegment}`
        : undefined
    );
  }

  return items;
}

export function buildDashboardBreadcrumbs(options: {
  pathname: string;
  workspaceId?: string;
  workspaceName?: string;
  boardId?: string;
  boardName?: string;
}): DashboardBreadcrumbItem[] {
  const { pathname, workspaceId, workspaceName, boardId, boardName } = options;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0)
    return [{ label: 'Dashboard', href: '/workspaces' }];

  if (segments[0] !== 'workspaces') {
    return [{ label: capitalize(segments[0]), href: `/${segments[0]}` }];
  }

  return buildWorkspaceBreadcrumbs({
    segments,
    workspaceId,
    workspaceName,
    boardId,
    boardName,
  });
}

export function DashboardBreadcrumbs(
  options: Readonly<{
    pathname: string;
    workspaceId?: string;
    workspaceName?: string;
    boardId?: string;
    boardName?: string;
  }>
) {
  const items = buildDashboardBreadcrumbs(options);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center text-label-sm text-ink-muted"
    >
      <ol className="flex min-w-0 items-center gap-gap-sm overflow-x-auto whitespace-nowrap pb-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-gap-sm"
            >
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
