'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAllBoardCards } from '@/hooks/cards';
import { CardDetailForm } from './_components/card-detail-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;
  const cardId = params.cardId as string;

  // Queries
  const {
    data: cardsData,
    isLoading,
    error,
  } = useAllBoardCards(workspaceId, boardId);

  // Find the specific card
  const card = cardsData?.data?.find((c: any) => c.id === cardId);

  const handleSuccess = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        {/* Header Skeleton */}
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" disabled>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardContent className="pt-gap-lg space-y-gap-lg">
            {[new Array(4)].map((_, i) => (
              <div key={i} className="space-y-gap-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/workspaces/${workspaceId}/boards/${boardId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-headline-lg font-heading text-ink">
            Card Details
          </h1>
        </div>

        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg flex gap-gap-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-destructive text-body font-medium">Error</p>
              <p className="text-destructive text-label-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/workspaces/${workspaceId}/boards/${boardId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-headline-lg font-heading text-ink">
            Card Details
          </h1>
        </div>

        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-gap-lg">
            <p className="text-destructive text-body">Card not found</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center gap-gap-md">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/workspaces/${workspaceId}/boards/${boardId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-headline-lg font-heading text-ink">Card Details</h1>
      </div>

      {/* Card Detail Form */}
      <CardDetailForm
        workspaceId={workspaceId}
        boardId={boardId}
        card={card}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </main>
  );
}
