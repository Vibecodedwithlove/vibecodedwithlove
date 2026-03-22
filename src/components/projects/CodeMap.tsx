'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface CodeMapProps {
  codeMap: string | null;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={cn(
        'w-5 h-5 transition-transform duration-300',
        isOpen && 'rotate-180'
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

export default function CodeMap({ codeMap }: CodeMapProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!codeMap || codeMap.trim() === '') {
    return null;
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full text-left p-4 rounded-lg',
          'bg-input border border-border',
          'hover:border-warmPrimary dark:hover:border-warmPrimaryLight',
          'transition-all duration-300',
          'flex items-center justify-between'
        )}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Code Map
          </h3>
          <p className="text-sm text-muted">
            AI-generated overview of the codebase
          </p>
        </div>
        <div
          className={cn(
            'text-warmPrimary dark:text-warmPrimaryLight flex-shrink-0 ml-4'
          )}
        >
          <ChevronIcon isOpen={isOpen} />
        </div>
      </button>

      {isOpen && (
        <div
          className={cn(
            'mt-4 p-4 rounded-lg',
            'bg-input border border-border',
            'animate-in fade-in slide-in-from-top-2 duration-300'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={codeMap} />
          </div>
        </div>
      )}
    </div>
  );
}
