import { AiContributionLevel } from '@/types';
import { AI_CONTRIBUTION_LEVELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ContributionLevelProps {
  level: AiContributionLevel;
}

export default function ContributionLevel({ level }: ContributionLevelProps) {
  const levelConfig = AI_CONTRIBUTION_LEVELS.find(l => l.value === level);

  if (!levelConfig) return null;

  // Determine visual representation
  const getSegments = () => {
    switch (level) {
      case 'mostly_ai':
        return [true, true, true, true];
      case 'about_half':
        return [true, true, false, false];
      case 'ai_assisted':
        return [true, false, false, false];
    }
  };

  const segments = getSegments();

  return (
    <div className="flex items-center gap-3">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {segments.map((filled, idx) => (
          <div
            key={idx}
            className={cn(
              'h-2 w-3 rounded-full transition-colors',
              filled
                ? 'bg-warmPrimary-500 dark:bg-warmPrimary-400'
                : 'bg-warmPrimary-200 dark:bg-warmPrimary-700'
            )}
          />
        ))}
      </div>
      {/* Label */}
      <span className="text-sm font-medium text-foreground/70">
        {levelConfig.label}
      </span>
    </div>
  );
}
