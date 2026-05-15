'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/workspace';
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from '@/lib/validation/workspace';
import { Plus } from 'lucide-react';

export default function WorkspacesPage() {
  const [showModal, setShowModal] = useState(false);

  // Queries
  const { data, isLoading, error } = useWorkspaces();

  // Mutations
  const createMutation = useCreateWorkspace();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = async (formData: CreateWorkspaceInput) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  if (error)
    return <div className="text-destructive">Error: {error.message}</div>;

  return (
    <main className="space-y-gap-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-heading text-ink">Workspaces</h1>
          <p className="text-body text-ink-muted">
            Manage your workspaces and teams
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-gap-sm" />
          New Workspace
        </Button>
      </div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
          {data?.workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer hover:bg-surface-1"
            >
              <CardContent className="p-gap-md">
                <h3 className="text-title-md font-semibold text-ink">
                  {workspace.name}
                </h3>
                <p className="text-label-sm text-ink-muted mt-gap-sm">
                  {workspace._count?.boards || 0} boards
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-gap-md"
              >
                <div>
                  <Label htmlFor="name">Workspace Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Workspace"
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
                    onClick={() => {
                      setShowModal(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
