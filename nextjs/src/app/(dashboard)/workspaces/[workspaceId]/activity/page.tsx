'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceActivities } from '@/hooks/workspace-activity';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function ActivityPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data, isLoading, error } = useWorkspaceActivities(workspaceId);
  const activities: Activity[] = data?.activities || [];

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-gap-lg">
        <div className="flex flex-col gap-gap-sm md:flex-row md:items-start md:justify-between">
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-gap-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-gap-sm">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto space-y-gap-lg">
        <DashboardPageHeader title="Activity Log" />
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <div className="flex gap-gap-md items-start">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-gap-sm" />
              <div>
                <p className="text-destructive text-body font-medium">
                  Failed to load activities
                </p>
                <p className="text-destructive text-label-sm">
                  {error.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      <DashboardPageHeader
        title="Activity Log"
        description="Recent workspace activity, grouped by who did what and when."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-gap-md">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="py-gap-md border-b border-hairline-ghost last:border-b-0"
                >
                  <p className="text-body text-ink">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="text-primary">{activity.target}</span>
                  </p>
                  <p className="text-label-sm text-ink-muted">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body text-ink-muted text-center py-gap-lg">
              No activities yet
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
