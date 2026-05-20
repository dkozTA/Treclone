import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-24 w-full resize-none rounded-sm border border-hairline-ghost bg-surface-2 px-gap-md py-gap-sm text-body placeholder:text-ink-muted focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
