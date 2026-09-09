import React from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-800"
        >
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-10 px-3 text-sm text-neutral-900 bg-white border rounded-lg',
            'placeholder:text-neutral-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-neutral-200 hover:border-neutral-300',
            icon && iconPosition === 'left' && 'pl-9',
            icon && iconPosition === 'right' && 'pr-9',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  fullWidth = true,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-800">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2.5 text-sm text-neutral-900 bg-white border rounded-lg resize-y min-h-[100px]',
          'placeholder:text-neutral-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-neutral-200 hover:border-neutral-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  fullWidth = true,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-800">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full h-10 px-3 text-sm text-neutral-900 bg-white border rounded-lg appearance-none',
          'transition-colors duration-150 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-neutral-200 hover:border-neutral-300',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
