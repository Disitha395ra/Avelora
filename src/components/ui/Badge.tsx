import React from 'react';
import { cn } from '@/utils';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  outline: 'bg-white text-neutral-700 border border-neutral-200',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-neutral-400',
  primary: 'bg-brand-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  outline: 'bg-neutral-400',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  className,
  children,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

// Status badge helper
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    draft: { label: 'Draft', variant: 'outline' },
    published: { label: 'Published', variant: 'success' },
    paused: { label: 'Paused', variant: 'warning' },
    sold_out: { label: 'Sold Out', variant: 'danger' },
    closed: { label: 'Closed', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    completed: { label: 'Completed', variant: 'info' },
    // payment
    pending: { label: 'Pending', variant: 'warning' },
    paid: { label: 'Paid', variant: 'success' },
    failed: { label: 'Failed', variant: 'danger' },
    refunded: { label: 'Refunded', variant: 'info' },
    // ticket
    valid: { label: 'Valid', variant: 'success' },
    used: { label: 'Used', variant: 'default' },
    invalid: { label: 'Invalid', variant: 'danger' },
    // booking
    confirmed: { label: 'Confirmed', variant: 'success' },
    expired: { label: 'Expired', variant: 'danger' },
  };

  const config = map[status] || { label: status, variant: 'default' as BadgeVariant };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
