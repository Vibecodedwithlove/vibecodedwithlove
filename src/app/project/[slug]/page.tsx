import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProjectDetail from '@/components/projects/ProjectDetail';
import SuggestionList from '@/components/suggestions/SuggestionList';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import { ProjectWithCreator, SuggestionWithAuthor } from '@/types';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: ProjectPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, demo_url')
    .eq('slug', slug)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The project you are looking for does not exist.',
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/project/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch project with creator profile
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:creator_id (
        id,
        username,
        display_name,
        avatar_url,
        github_url,
        website_url,
        bio,
        role
      )
    `)
    .eq('slug', slug)
    .single();

  if (!project) {
    notFound();
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === project.creator_id;

  // Fetch suggestions for this project
  const { data: suggestions } = await supabase
    .from('suggestions')
    .select(`
      *,
      profiles:author_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('project_id', project.id)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <ProjectDetail project={project as ProjectWithCreator} isOwner={isOwner} />

        {/* Suggestions Section */}
        <section className="mt-12 pt-8 border-t border-amber-200 dark:border-amber-900/30">
          <SuggestionList
            suggestions={(suggestions || []) as SuggestionWithAuthor[]}
            projectId={project.id}
            isProjectOwner={isOwner}
            currentUserId={user?.id}
          />

          {project.open_to_suggestions && user && !isOwner && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Leave a Suggestion
              </h3>
              <SuggestionForm projectId={project.id} />
            </div>
          )}

          {project.open_to_suggestions && !user && (
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30 text-center">
              <p className="text-stone-700 dark:text-stone-300">
                Want to help improve this project?{' '}
                <a href="/auth/login" className="text-amber-700 dark:text-amber-400 font-medium hover:underline">
                  Sign in
                </a>{' '}
                to leave a suggestion.
              </p>
            </div>
          )}

          {!project.open_to_suggestions && (
            <div className="mt-8 p-6 bg-stone-50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-stone-500 dark:text-stone-400">
                This project is not currently accepting suggestions.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
