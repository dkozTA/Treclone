import React from 'react';

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex bg-canvas min-h-screen">
      {/* Sidebar - Level 1 Surface */}
      <aside className="w-64 bg-surface-1 p-gap-md border-r border-hairline-ghost flex flex-col gap-gap-lg sticky top-0 h-screen overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-gap-sm">
          <div className="w-8 h-8 bg-primary rounded-sm" />
          <h2 className="text-headline-sm font-heading text-ink">Trello</h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-gap-sm flex-1">
          {/* Navigation items placeholder */}
          <a href="/boards" className="text-body text-ink px-gap-md py-gap-sm rounded-sm hover:bg-canvas">
            My Boards
          </a>
          <a href="/settings" className="text-body text-ink px-gap-md py-gap-sm rounded-sm hover:bg-canvas">
            Settings
          </a>
        </nav>

        {/* User Menu */}
        <div className="pt-gap-md border-t border-hairline-ghost">
          {/* User profile placeholder */}
        </div>
      </aside>

      {/* Main Content Area - Canvas Level */}
      <main className="flex-1 p-gap-xl overflow-auto">
        {children}
      </main>
    </div>
  );
}
