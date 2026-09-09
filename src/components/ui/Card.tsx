import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-xl shadow-sm',
        hover && 'hover:shadow-md hover:border-neutral-300 transition-all duration-200 cursor-pointer',
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconColor?: string;
}

export function StatsCard({ label, value, change, changeType = 'neutral', icon, iconColor = 'bg-brand-50' }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-neutral-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-lg', iconColor)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
