'use client';

import { useEffect, useState, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
  useDeleteWorkspace,
} from '@/hooks/workspace';
import {
  updateWorkspaceSettingsSchema,
  type UpdateWorkspaceSettingsInput,
} from '@/lib/validation/workspace';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Queries
  const { data: settingsData, isLoading } = useWorkspaceSettings(workspaceId);

  // Mutations
  const updateSettingsMutation = useUpdateWorkspaceSettings(workspaceId);
  const deleteMutation = useDeleteWorkspace(workspaceId);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateWorkspaceSettingsInput>({
    resolver: zodResolver(updateWorkspaceSettingsSchema),
  });

  const visibility = watch('visibility');

  // Load initial data
  useEffect(() => {
    if (settingsData?.settings) {
      setValue('visibility', settingsData.settings.visibility);
      setValue('notifications', settingsData.settings.notifications);
    }
  }, [settingsData, setValue]);

  const onSubmit = async (formData: UpdateWorkspaceSettingsInput) => {
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;

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
            Workspace Settings
          </h1>
        </div>
      </div>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>
            Control who can see and access this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-gap-md">
            <div className="space-y-gap-md">
              {['private', 'team', 'public'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-gap-md cursor-pointer p-gap-md hover:bg-surface-1 rounded-sm"
                >
                  <input
                    type="radio"
                    value={option}
                    {...register('visibility')}
                  />
                  <div>
                    <p className="text-body text-ink font-medium capitalize">
                      {option}
                    </p>
                    <p className="text-label-sm text-ink-muted">
                      {option === 'private' &&
                        'Only members you invite can access'}
                      {option === 'team' &&
                        'Anyone in your organization can join'}
                      {option === 'public' && 'Anyone with the link can access'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <Button
              type="submit"
              variant="default"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending
                ? 'Saving...'
                : 'Save Visibility'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-gap-md bg-destructive/5 rounded-sm space-y-gap-sm">
            <p className="text-body text-ink font-medium">Delete Workspace</p>
            <p className="text-label-sm text-ink-muted">
              Once deleted, this cannot be undone. All boards and cards will be
              permanently deleted.
            </p>
            <Button
              variant="destructive"
              className="mt-gap-md"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-gap-sm" />
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">
                Delete Workspace?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-gap-lg">
              <p className="text-body text-ink">
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className="flex gap-gap-md">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
