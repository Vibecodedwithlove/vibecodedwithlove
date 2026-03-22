'use client';

import ProjectCard from '@/components/projects/ProjectCard';
import { ProjectWithCreator } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectGridProps {
  projects: ProjectWithCreator[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className={cn(
        'py-16 text-center',
        'bg-input/50 rounded-lg border border-border',
        'dark:bg-input/30'
      )}>
        <svg
          className={cn(
            'w-16 h-16 mx-auto mb-4',
            'text-foreground/30'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No projects found
        </h3>
        <p className="text-foreground/60">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-6',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    )}>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
