'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function DashboardPageHeader({
  title,
  description,
  actions,
  backHref,
  className,
}: Readonly<{
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  className?: string;
}>) {
  return (
    <header
      className={cn(
        'flex flex-col gap-gap-md md:flex-row md:items-start md:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-gap-md">
        {backHref ? (
          <Button variant="ghost" size="icon-sm" asChild className="mt-0.5">
            <Link href={backHref} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}

        <div className="min-w-0 space-y-gap-sm">
          <div className="min-w-0 text-headline-lg font-heading text-ink">
            {title}
          </div>
          {description ? (
            <div className="max-w-2xl text-body text-ink-muted">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex w-full flex-col gap-gap-sm sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
