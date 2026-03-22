'use client';

import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AiToolBadge from '@/components/projects/AiToolBadge';
import ContributionLevel from '@/components/projects/ContributionLevel';
import { ProjectWithCreator } from '@/types';
import { truncateText, formatRelativeDate, cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface ProjectCardProps {
  project: ProjectWithCreator;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const category = CATEGORIES.find(c => c.value === project.category);
  const creatorName = project.profiles?.display_name || project.profiles?.username || '[deleted user]';
  const creatorAvatar = project.profiles?.avatar_url;

  return (
    <Link href={`/project/${project.slug}`}>
      <Card hover className="h-full flex flex-col">
        {/* Category Badge */}
        <div className="mb-3">
          <Badge color="secondary" size="sm">
            {category?.label || project.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-foreground/70 mb-4 line-clamp-2 flex-grow">
          {truncateText(project.description, 120)}
        </p>

        {/* AI Tools */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.ai_tools.slice(0, 3).map(tool => (
            <AiToolBadge key={tool} tool={tool} />
          ))}
          {project.ai_tools.length > 3 && (
            <Badge color="primary" size="sm">
              +{project.ai_tools.length - 3}
            </Badge>
          )}
        </div>

        {/* Contribution Level */}
        <div className="mb-4">
          <ContributionLevel level={project.ai_contribution} />
        </div>

        {/* Suggestions Count */}
        <div className="mb-4 text-sm text-foreground/60">
          <span className="font-medium">{Math.floor(Math.random() * 15)}</span> suggestions
        </div>

        {/* Creator and Date */}
        <div className={cn(
          'flex items-center justify-between',
          'pt-4 border-t border-border'
        )}>
          <div className="flex items-center gap-2">
            {creatorAvatar ? (
              <Image
                src={creatorAvatar}
                alt={creatorName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-warmPrimary-200 dark:bg-warmPrimary-700 flex items-center justify-center">
                <span className="text-xs font-semibold text-warmPrimary-900 dark:text-warmPrimary-100">
                  {creatorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-foreground/80 truncate">
              {creatorName}
            </span>
          </div>
          <span className="text-xs text-foreground/60 whitespace-nowrap ml-2">
            {formatRelativeDate(project.created_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
