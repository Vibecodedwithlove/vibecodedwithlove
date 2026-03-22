'use client';

import { useState } from 'react';
import { COMMUNITY_GUIDELINES } from '@/lib/constants';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface CommunityGuidelinesProps {
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function CommunityGuidelines({
  collapsible = true,
  defaultExpanded = false,
}: CommunityGuidelinesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 md:p-6 mb-6">
        <MarkdownRenderer content={COMMUNITY_GUIDELINES} />
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
      >
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Community Guidelines
        </h3>
        <svg
          className={cn(
            'w-5 h-5 text-amber-700 dark:text-amber-200 transition-transform duration-200',
            isExpanded && 'rotate-180'
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
      </button>

      {isExpanded && (
        <div className="border-t border-amber-200 dark:border-amber-800 px-4 md:px-6 py-4">
          <MarkdownRenderer
            content={COMMUNITY_GUIDELINES}
            className="text-amber-900 dark:text-amber-100"
          />
        </div>
      )}
    </div>
  );
}
