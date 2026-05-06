import React from 'react';

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas min-h-screen flex flex-col items-center justify-center p-gap-md">
      {/* Auth Card Container - Level 2 Surface */}
      <div className="bg-surface-2 rounded-sm p-gap-md max-w-md w-full">
        {children}
      </div>
    </div>
  );
}
