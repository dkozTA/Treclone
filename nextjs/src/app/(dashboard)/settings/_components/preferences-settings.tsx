'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  usePreferencesSettings,
  useUpdatePreferences,
} from '@/hooks/preferences';

interface Preferences {
  emailNotifications: boolean;
  darkMode: boolean;
}

export function PreferencesSettings() {
  const { setTheme } = useTheme();
  const { data: preferences, isLoading } = usePreferencesSettings();
  const updatePreference = useUpdatePreferences();

  const [localPreferences, setLocalPreferences] = useState<Preferences>({
    emailNotifications: true,
    darkMode: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
      setTheme(preferences.darkMode ? 'dark' : 'light');
    }
  }, [preferences, setTheme]);

  const handleToggle = async (key: keyof Preferences) => {
    const newValue = !localPreferences[key];
    setLocalPreferences({ ...localPreferences, [key]: newValue });
    if (key === 'darkMode') {
      setTheme(newValue ? 'dark' : 'light');
    }
    updatePreference.mutate({ [key]: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-gap-md">
        <div className="flex items-center justify-between py-gap-sm">
          <div>
            <p className="text-body text-ink font-medium">
              Email Notifications
            </p>
            <p className="text-label-sm text-ink-muted">
              Receive updates about your boards
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={localPreferences.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
            disabled={isLoading || updatePreference.isPending}
          />
        </div>
        <div className="flex items-center justify-between py-gap-sm border-t border-hairline-ghost pt-gap-md">
          <div>
            <p className="text-body text-ink font-medium">Dark Mode</p>
            <p className="text-label-sm text-ink-muted">
              Use dark theme by default
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={localPreferences.darkMode}
            onChange={() => handleToggle('darkMode')}
            disabled={isLoading || updatePreference.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
