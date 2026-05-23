'use client';

import { use, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspace, useUpdateWorkspace } from '@/hooks/workspace';
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceInput,
} from '@/lib/validation/workspace';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditWorkspacePage({
  params,
}: Readonly<{
  params: Promise<{ workspaceId: string }>;
}>) {
  const { workspaceId } = use(params);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const updateMutation = useUpdateWorkspace(workspaceId);

  // Prefill form when workspace loads
  useEffect(() => {
    if (workspace) {
      setValue('name', workspace.name);
      setValue('description', workspace.description ?? '');
    }
  }, [workspace, setValue]);

  const onSubmit = async (formData: UpdateWorkspaceInput) => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/workspaces">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-headline-lg font-heading text-ink">
              Edit Workspace
            </h1>
          </div>
        </div>
        <div>Loading workspace…</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="max-w-2xl mx-auto space-y-gap-lg">
        <div className="flex items-center gap-gap-md">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/workspaces">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-headline-lg font-heading text-ink">
              Edit Workspace
            </h1>
          </div>
        </div>
        <div className="text-destructive">Failed to load workspace.</div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center gap-gap-md">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/workspaces">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-headline-lg font-heading text-ink">
            Edit Workspace
          </h1>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
            <div>
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="Workspace name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-label-sm mt-gap-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-destructive text-label-sm mt-gap-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-gap-md pt-gap-md">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/workspaces">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
