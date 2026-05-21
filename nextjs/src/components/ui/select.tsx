'use client';
import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils/cn';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex w-full items-center justify-between gap-gap-md rounded-sm border border-hairline-ghost bg-surface-2 px-gap-md py-gap-sm text-body focus-visible:border-primary focus-visible:ring-1',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          'rounded-sm border border-hairline-ghost bg-surface-2 shadow-md z-50',
          className
        )}
        {...props}
      />
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'flex items-center gap-gap-md rounded-sm py-gap-sm pl-gap-md pr-gap-md cursor-pointer hover:bg-muted',
        className
      )}
      {...props}
    >
      <CheckIcon className="h-4 w-4" />
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectTrigger, SelectContent, SelectItem };
