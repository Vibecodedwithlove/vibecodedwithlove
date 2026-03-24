'use client';

import { useState, useMemo } from 'react';
import { SuggestionWithAuthor, SuggestionType, SuggestionStatus } from '@/types';
import { SUGGESTION_TYPES } from '@/lib/constants';
import SuggestionCard from './SuggestionCard';
import { cn } from '@/lib/utils';

interface SuggestionListProps {
  suggestions: SuggestionWithAuthor[];
  projectId?: string;
  isProjectOwner: boolean;
  currentUserId?: string;
}

export default function SuggestionList({
  suggestions,
  isProjectOwner,
  currentUserId,
}: SuggestionListProps) {
  const [selectedType, setSelectedType] = useState<SuggestionType | 'all'>(
    'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<SuggestionStatus | 'all'>(
    'all'
  );

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const typeMatch =
        selectedType === 'all' || suggestion.type === selectedType;
      const statusMatch =
        selectedStatus === 'all' || suggestion.status === selectedStatus;
      return typeMatch && statusMatch;
    });
  }, [suggestions, selectedType, selectedStatus]);

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted text-lg">
          No suggestions yet. Be the first to help improve this project!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        {/* Type Filter */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Filter by Type
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                selectedType === 'all'
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              All
            </button>
            {SUGGESTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value as SuggestionType)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  selectedType === type.value
                    ? 'bg-warmPrimary text-white'
                    : 'bg-input text-foreground hover:bg-border'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Filter by Status
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                selectedStatus === 'all'
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              All
            </button>
            {(['open', 'acknowledged', 'resolved', 'removed'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    selectedStatus === status
                      ? 'bg-warmPrimary text-white'
                      : 'bg-input text-foreground hover:bg-border'
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="text-sm text-muted">
        {filteredSuggestions.length} suggestion
        {filteredSuggestions.length !== 1 ? 's' : ''}
      </div>

      {/* Suggestions */}
      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted">
            No suggestions match your filters. Try adjusting them!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isProjectOwner={isProjectOwner}
              isAuthor={currentUserId === suggestion.author_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
