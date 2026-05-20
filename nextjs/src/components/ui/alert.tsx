import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'group/alert relative grid w-full gap-gap-sm border border-hairline-ghost rounded-sm px-gap-md py-gap-md text-left text-body after:absolute after:-inset-y-px after:-left-px after:w-1 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-gap-md',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-ink after:bg-ink border-border',
        destructive:
          'bg-error-container text-error after:bg-error border-error/20',
        success:
          'bg-success-container text-on-success-container after:bg-success border-success/20',
        warning:
          'bg-semantic-progress-bg text-semantic-progress-text after:bg-semantic-progress-text',
        info: 'bg-primary-container text-on-primary-container after:bg-primary border-primary/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('text-title-md font-heading', className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-body', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
