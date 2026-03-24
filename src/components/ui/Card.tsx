import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
}

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({
  children,
  padding = 'md',
  hover = false,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-input border border-border rounded-lg',
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:border-warmPrimary hover:scale-105',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
