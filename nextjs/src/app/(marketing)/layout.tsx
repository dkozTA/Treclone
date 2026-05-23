import { ThemeToggle } from '@/components/theme-toggle';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MarketingLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas min-h-screen flex flex-col">
      {/* Header - Navigation */}
      <header className="bg-canvas border-b border-surface-1 p-gap-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-surface-2">
                <Image
                  src="/logo.png"
                  alt="Treclone"
                  width={190}
                  height={44}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </span>
            </Link>
            <div className="flex gap-gap-md items-center">
              {/* Navigation links can go here */}
            </div>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-surface-1 p-gap-xl mt-gap-xl border-t border-surface-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-gap-lg mb-gap-xl">
            {/* Footer sections placeholder */}
          </div>
          <div className="pt-gap-md border-t border-hairline-ghost">
            <p className="text-body text-ink-muted">
              &copy; 2026 Treclone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
