import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('animate-spin text-brand-500', className)} />
  );
}

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
}: {
  message?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-neutral-500',
        fullScreen ? 'min-h-screen' : 'py-16'
      )}
    >
      <Spinner className="w-8 h-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 p-4 bg-neutral-50 rounded-full text-neutral-300">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-neutral-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 p-4 bg-red-50 rounded-full text-red-300">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
