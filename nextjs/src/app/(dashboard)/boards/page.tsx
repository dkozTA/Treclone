import React from 'react';

export default function BoardsPage() {
  return (
    <div className="space-y-gap-lg">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-heading text-ink mb-gap-sm">
          My Boards
        </h1>
        <p className="text-body text-ink-muted">
          Manage and organize your tasks across different boards
        </p>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-lg">
        {/* Placeholder: Empty state or board cards will go here */}
        <div className="bg-surface-2 rounded-sm p-gap-md min-h-32 flex items-center justify-center">
          <p className="text-body text-ink-muted text-center">
            Create a new board to get started
          </p>
        </div>
      </div>
    </div>
  );
}
