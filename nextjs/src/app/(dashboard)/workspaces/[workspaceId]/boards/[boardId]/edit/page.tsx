'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BoardEditPage() {
  return (
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      <h1 className="text-headline-lg font-heading text-ink">Edit Board</h1>

      <Card>
        <CardHeader>
          <CardTitle>Board Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <div className="space-y-gap-sm">
            <Label htmlFor="title">Board Title</Label>
            <Input
              id="title"
              placeholder="Q2 Planning"
              defaultValue="Q2 Planning"
            />
          </div>

          <div className="space-y-gap-sm">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Board description..."
              className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm"
            />
          </div>

          <div className="flex gap-gap-md">
            <Button variant="default">Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
