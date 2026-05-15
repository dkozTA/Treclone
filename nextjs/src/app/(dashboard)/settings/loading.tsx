import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <main className="max-w-4xl mx-auto space-y-gap-lg">
      {/* Header Skeleton */}
      <div className="space-y-gap-sm">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Card Skeleton x3 */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-gap-sm" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-gap-md">
            {/* Input fields */}
            {[1, 2].map((j) => (
              <div key={j} className="space-y-gap-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-sm" />
              </div>
            ))}
            {/* Button */}
            <Skeleton className="h-10 w-32 mt-gap-md rounded-sm" />
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
