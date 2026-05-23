import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardMembersLoading() {
  return (
    <main className="mx-auto max-w-4xl space-y-gap-lg px-gap-md py-gap-lg">
      <div className="space-y-gap-sm">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-gap-sm">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-gap-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-gap-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-gap-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
