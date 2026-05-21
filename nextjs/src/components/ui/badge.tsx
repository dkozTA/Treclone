import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-gap-sm rounded-sm px-gap-sm py-gap-xs text-label-sm font-semibold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'bg-surface-1 text-ink hover:bg-surface-container',
        primary:
          'bg-primary-container text-on-primary-container hover:bg-primary',
        secondary: 'bg-secondary-container text-on-secondary-container',
        success: 'bg-success-container text-on-success-container',
        destructive: 'bg-error-container text-error',
        warning: 'bg-semantic-blocked-bg text-semantic-blocked-text',
        progress: 'bg-semantic-progress-bg text-semantic-progress-text',
        done: 'bg-semantic-done-bg text-semantic-done-text',
        outline: 'bg-transparent border border-hairline-ghost text-ink',
        ghost: 'bg-transparent text-ink-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
