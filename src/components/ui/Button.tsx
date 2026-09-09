import React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow border border-brand-500 hover:border-brand-600',
  secondary:
    'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-700 shadow-sm border border-neutral-900',
  outline:
    'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 shadow-sm',
  ghost:
    'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-red-600',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        iconPosition === 'left' && icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconPosition === 'right' && icon && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
