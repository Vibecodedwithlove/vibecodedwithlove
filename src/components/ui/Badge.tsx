import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'security'
  | 'performance'
  | 'ux'
  | 'bug'
  | 'general';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  children: ReactNode;
  onRemove?: () => void;
  removable?: boolean;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  primary: 'bg-warmPrimary text-white',
  secondary: 'bg-warmSecondary text-white',
  danger: 'bg-red-100 text-red-800 border border-red-300',
  success: 'bg-green-100 text-green-800 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
  security: 'bg-red-100 text-red-800 border border-red-300',
  performance: 'bg-blue-100 text-blue-800 border border-blue-300',
  ux: 'bg-purple-100 text-purple-800 border border-purple-300',
  bug: 'bg-orange-100 text-orange-800 border border-orange-300',
  general: 'bg-gray-100 text-gray-800 border border-gray-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs font-medium rounded',
  md: 'px-3 py-1 text-sm font-medium rounded-md',
};

export default function Badge({
  color = 'primary',
  size = 'md',
  children,
  onRemove,
  removable = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        colorStyles[color],
        sizeStyles[size],
        className
      )}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-75 transition-opacity"
          aria-label="Remove badge"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
