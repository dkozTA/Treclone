'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export default function BoardSettingsPage() {
  return (
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      <h1 className="text-headline-lg font-heading text-ink">Board Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Control who can see this board</CardDescription>
        </CardHeader>
        <CardContent className="space-y-gap-md">
          <label className="flex items-center gap-gap-md cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              defaultChecked
            />
            <span className="text-body text-ink">Private</span>
          </label>
          <label className="flex items-center gap-gap-md cursor-pointer">
            <input type="radio" name="visibility" value="team" />
            <span className="text-body text-ink">Team Only</span>
          </label>
          <label className="flex items-center gap-gap-md cursor-pointer">
            <input type="radio" name="visibility" value="public" />
            <span className="text-body text-ink">Public</span>
          </label>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-gap-sm" />
            Delete Board
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
