'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CATEGORIES, AI_TOOLS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  onFilter?: () => void;
}

export default function FilterBar({ onFilter }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || '';
  const tools = searchParams.get('tools')?.split(',') || [];
  const openToSuggestions = searchParams.get('openToSuggestions') === 'true';
  const sort = searchParams.get('sort') || 'newest';

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/browse?${params.toString()}`);
    onFilter?.();
  }, [searchParams, router, onFilter]);

  const handleCategoryChange = (value: string) => {
    updateParams({ category: value || null });
  };

  const handleToolToggle = (tool: string) => {
    const newTools = tools.includes(tool)
      ? tools.filter(t => t !== tool)
      : [...tools, tool];

    updateParams({
      tools: newTools.length > 0 ? newTools.join(',') : null,
    });
  };

  const handleSuggestionsToggle = () => {
    updateParams({
      openToSuggestions: openToSuggestions ? null : 'true',
    });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value || null });
  };

  const handleClearFilters = () => {
    router.push('/browse');
    onFilter?.();
  };

  const hasActiveFilters = category || tools.length > 0 || openToSuggestions || sort !== 'newest';

  return (
    <div className={cn(
      'bg-input border border-border rounded-lg',
      'p-6 space-y-6',
      'dark:bg-input/50'
    )}>
      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={cn(
            'w-full px-4 py-2 rounded-lg',
            'border border-border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-warmPrimary-500',
            'transition-colors'
          )}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* AI Tools */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          AI Tools
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AI_TOOLS.map(tool => (
            <label
              key={tool}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg',
                'cursor-pointer transition-colors',
                'hover:bg-warmPrimary-100 dark:hover:bg-warmPrimary-900'
              )}
            >
              <input
                type="checkbox"
                checked={tools.includes(tool)}
                onChange={() => handleToolToggle(tool)}
                className={cn(
                  'w-4 h-4 rounded',
                  'cursor-pointer',
                  'accent-warmPrimary-500'
                )}
              />
              <span className="text-sm text-foreground">{tool}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Open to Suggestions */}
      <div>
        <label className={cn(
          'flex items-center gap-3',
          'cursor-pointer p-3 rounded-lg',
          'hover:bg-warmPrimary-100 dark:hover:bg-warmPrimary-900',
          'transition-colors'
        )}>
          <input
            type="checkbox"
            checked={openToSuggestions}
            onChange={handleSuggestionsToggle}
            className={cn(
              'w-5 h-5 rounded',
              'cursor-pointer',
              'accent-warmPrimary-500'
            )}
          />
          <span className="text-sm font-medium text-foreground">
            Open to suggestions
          </span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Sort by
        </label>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className={cn(
            'w-full px-4 py-2 rounded-lg',
            'border border-border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-warmPrimary-500',
            'transition-colors'
          )}
        >
          <option value="newest">Newest</option>
          <option value="suggestions">Most Suggestions</option>
          <option value="updated">Recently Updated</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          className="w-full text-sm"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
