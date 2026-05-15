import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      {/* Profile Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-gap-lg items-start">
              <Skeleton className="w-20 h-20 rounded-md" />
              <div className="space-y-gap-sm flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-sm" />
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid md:grid-cols-3 gap-gap-lg">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-gap-lg text-center space-y-gap-sm">
              <Skeleton className="h-12 w-16 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-gap-sm" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="py-gap-md border-b border-hairline-ghost last:border-b-0"
              >
                <Skeleton className="h-4 w-full mb-gap-sm" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workspaces Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-gap-sm" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-gap-md bg-surface-1 rounded-sm"
              >
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-gap-sm" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-16 rounded-sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
