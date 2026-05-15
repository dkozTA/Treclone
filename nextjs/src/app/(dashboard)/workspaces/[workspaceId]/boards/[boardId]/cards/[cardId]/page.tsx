'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function CardDetailPage() {
  return (
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-heading text-ink">Card Details</h1>
        <button className="text-ink-muted hover:text-ink">
          <X className="w-6 h-6" />
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Design Header Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-gap-lg">
          <div>
            <p className="text-label-sm text-ink-muted mb-gap-sm">
              Description
            </p>
            <p className="text-body text-ink">
              Create a reusable header component with logo, navigation, and user
              menu
            </p>
          </div>

          <div>
            <p className="text-label-sm text-ink-muted mb-gap-sm">Status</p>
            <select className="px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-body">
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>

          <div>
            <p className="text-label-sm text-ink-muted mb-gap-sm">Assignee</p>
            <select className="w-full px-gap-md py-gap-sm border border-hairline-ghost rounded-sm text-body">
              <option>Unassigned</option>
              <option>John Doe</option>
              <option>Sarah Chen</option>
            </select>
          </div>

          <div className="flex gap-gap-md">
            <Button variant="default">Save</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
