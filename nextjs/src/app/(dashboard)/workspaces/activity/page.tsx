'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function ActivityPage() {
  const activities: Activity[] = [
    {
      id: '1',
      user: 'John Doe',
      action: 'Created board',
      target: 'Q2 Planning',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      user: 'Sarah Chen',
      action: 'Added card',
      target: 'Design header',
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'Completed task',
      target: 'Setup project',
      timestamp: '1 day ago',
    },
  ];

  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      <h1 className="text-headline-lg font-heading text-ink">Activity Log</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
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
                  {activity.timestamp}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
