'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectWithCreator } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import AiToolBadge from './AiToolBadge';
import ContributionLevel from './ContributionLevel';
import ProjectAnatomy from './ProjectAnatomy';
import CodeMap from './CodeMap';
import { CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

interface ProjectDetailProps {
  project: ProjectWithCreator;
  isOwner: boolean;
}

export default function ProjectDetail({ project, isOwner }: ProjectDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const creatorName = project.profiles?.display_name || project.profiles?.username || '[deleted user]';
  const creatorAvatar = project.profiles?.avatar_url;
  const creatorUsername = project.profiles?.username;

  const categoryLabel = CATEGORIES.find(c => c.value === project.category)?.label || project.category;

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', project.id);

      if (error) throw error;

      router.push('/browse');
    } catch (err) {
      console.error('Failed to delete project:', err);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Project Header */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge color="primary">{categoryLabel}</Badge>
            {project.ai_tools.map((tool) => (
              <AiToolBadge key={tool} tool={tool} />
            ))}
            <ContributionLevel level={project.ai_contribution} />
            {project.status === 'archived' && (
              <Badge color="secondary">Archived</Badge>
            )}
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-amber-200 dark:border-amber-900/30">
          {creatorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-amber-700 dark:text-amber-400 font-medium text-sm">
                {creatorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            {creatorUsername ? (
              <Link
                href={`/profile/${creatorUsername}`}
                className="font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
              >
                {creatorName}
              </Link>
            ) : (
              <span className="font-medium text-stone-400 dark:text-stone-500">{creatorName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <Card padding="lg">
        <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-lg">{project.description}</p>
      </Card>

      {/* 2. Links */}
      <div className="flex flex-wrap gap-3">
        {project.demo_url && (
          <Button
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
          >
            View Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        )}
        {project.repo_url && (
          <Button
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
          >
            View Source
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.184.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.113-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.192 20 14.435 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          </Button>
        )}
      </div>

      {/* 3. Project Anatomy */}
      <ProjectAnatomy
        whatItDoes={project.what_it_does}
        userFlow={project.user_flow}
        mainComponents={project.main_components}
        externalDependencies={project.external_dependencies}
        leastConfident={project.least_confident}
      />

      {/* 4. Code Map (collapsible, only if provided) */}
      <CodeMap codeMap={project.code_map} />

      {/* 5. AI Transparency */}
      <Card padding="lg" className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">AI Transparency</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">AI Tools Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.ai_tools.length > 0 ? (
                project.ai_tools.map((tool) => (
                  <AiToolBadge key={tool} tool={tool} />
                ))
              ) : (
                <span className="text-stone-400 dark:text-stone-500">No AI tools specified</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">AI Contribution Level</h3>
            <ContributionLevel level={project.ai_contribution} />
          </div>

          {project.security_reviewed && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/30">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Security reviewed by the creator</span>
            </div>
          )}
        </div>
      </Card>

      {/* 6. Build Story */}
      <Card padding="lg">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Build Story</h2>
        <MarkdownRenderer content={project.build_story} />
      </Card>

      {/* Open to Suggestions indicator */}
      {project.open_to_suggestions && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-stone-700 dark:text-stone-300">
          <p className="font-medium">
            This project is open to suggestions and feedback from the community.
          </p>
        </div>
      )}

      {/* Owner Actions */}
      {isOwner && (
        <div className="flex flex-wrap gap-3 border-t border-amber-200 dark:border-amber-900/30 pt-6">
          <Link href={`/project/${project.slug}/edit`}>
            <Button variant="secondary" size="lg">
              Edit Project
            </Button>
          </Link>
          <Button
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
            size="lg"
          >
            {showDeleteConfirm ? 'Confirm Archive' : 'Archive Project'}
          </Button>
          {showDeleteConfirm && (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
