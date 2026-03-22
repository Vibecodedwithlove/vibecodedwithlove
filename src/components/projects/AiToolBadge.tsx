import Badge from '@/components/ui/Badge';
import { getAiToolColor } from '@/lib/utils';

interface AiToolBadgeProps {
  tool: string;
}

export default function AiToolBadge({ tool }: AiToolBadgeProps) {
  const colorClasses = getAiToolColor(tool);
  const [bgClass, textClass] = colorClasses.split(' ');

  return (
    <Badge
      color="primary"
      size="sm"
      className={`${bgClass} ${textClass} border-0`}
    >
      {tool}
    </Badge>
  );
}
