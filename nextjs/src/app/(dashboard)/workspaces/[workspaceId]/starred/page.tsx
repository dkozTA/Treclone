import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

interface StarredPageProps {
  readonly params: Promise<{
    workspaceId: string;
  }>;
}

export default async function StarredPage({ params }: StarredPageProps) {
  const { workspaceId } = await params;

  return (
    <main className="space-y-gap-lg">
      <DashboardPageHeader
        title="Starred"
        description="Quick access to important boards will be available here."
        backHref={`/workspaces/${workspaceId}`}
      />

      <Card className="border-dashed">
        <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-gap-md py-gap-xl text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <Star className="h-7 w-7" />
          </div>

          <div className="space-y-gap-sm">
            <h2 className="text-headline-sm font-heading text-ink">
              Starred boards are still in development
            </h2>
            <p className="mx-auto max-w-md text-body text-ink-muted">
              This page is reserved for boards you mark as important. For now,
              use the all boards view to open and manage your workspace boards.
            </p>
          </div>

          <Button asChild variant="default">
            <Link href={`/workspaces/${workspaceId}/boards`}>Go to boards</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
