import { SuggestionType } from '@/types';
import { getSuggestionTypeColor } from '@/lib/utils';
import { SUGGESTION_TYPES } from '@/lib/constants';

interface SuggestionTypeBadgeProps {
  type: SuggestionType;
}

export default function SuggestionTypeBadge({ type }: SuggestionTypeBadgeProps) {
  const typeConfig = SUGGESTION_TYPES.find((t) => t.value === type);
  const color = getSuggestionTypeColor(type);

  if (!typeConfig) {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border ${color}`}>
      {typeConfig.label}
    </span>
  );
}
