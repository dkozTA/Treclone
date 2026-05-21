'use client';
import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const labelVariants = cva('text-label-lg font-semibold text-ink', {
  variants: {
    size: {
      sm: 'text-label-sm',
      md: 'text-label-md',
      lg: 'text-label-lg',
    },
  },
});

function Label({
  className,
  size = 'lg',
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  );
}

export { Label, labelVariants };
