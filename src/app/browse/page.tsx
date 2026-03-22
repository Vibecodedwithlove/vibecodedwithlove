import { Metadata } from 'next';
import { Suspense } from 'react';
import FilterBar from '@/components/projects/FilterBar';
import ProjectGrid from '@/components/projects/ProjectGrid';
import { createClient } from '@/lib/supabase/server';
import { ProjectWithCreator, ProjectCategory } from '@/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Browse Projects - Vibe Coded with Love',
  description: 'Discover AI-assisted projects from our community of transparent developers.',
};

interface BrowsePageProps {
  searchParams: Promise<{
    category?: string;
    tools?: string;
    openToSuggestions?: string;
    sort?: string;
  }>;
}

async function getProjects(params: {
  category?: string;
  tools?: string;
  openToSuggestions?: string;
  sort?: string;
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('projects')
      .select('*, profiles:creator_id(id, username, display_name, bio, avatar_url, github_url, website_url, role, created_at, updated_at)')
      .eq('status', 'active');

    // Apply category filter
    if (params.category) {
      query = query.eq('category', params.category as ProjectCategory);
    }

    // Apply AI tools filter
    if (params.tools) {
      const tools = params.tools.split(',');
      query = query.overlaps('ai_tools', tools);
    }

    // Apply open to suggestions filter
    if (params.openToSuggestions === 'true') {
      query = query.eq('open_to_suggestions', true);
    }

    // Apply sorting
    if (params.sort === 'suggestions') {
      // This would require a suggestion count, using created_at for now
      query = query.order('created_at', { ascending: false });
    } else if (params.sort === 'updated') {
      query = query.order('updated_at', { ascending: false });
    } else {
      // Default: newest
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return (data as ProjectWithCreator[]) || [];
  } catch (error) {
    console.error('Error in getProjects:', error);
    return [];
  }
}

async function BrowseContent({ searchParams: searchParamsPromise }: BrowsePageProps) {
  const searchParams = await searchParamsPromise;
  const projects = await getProjects(searchParams);

  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-4 gap-8',
      'lg:gap-6'
    )}>
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <FilterBar />
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Browse All Projects
          </h1>
          <p className="text-lg text-foreground/70">
            {projects.length === 0
              ? 'No projects found. Try adjusting your filters.'
              : `Found ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>

        <ProjectGrid projects={projects} />
      </main>
    </div>
  );
}

export default async function BrowsePage(props: BrowsePageProps) {
  return (
    <main className="w-full">
      {/* Header */}
      <section className={cn(
        'py-12 px-4',
        'bg-warmPrimary-50 dark:bg-warmPrimary-900/20',
        'border-b border-border'
      )}>
        <div className="max-w-7xl mx-auto">
          <h1 className={cn(
            'text-4xl sm:text-5xl font-bold',
            'text-foreground mb-3'
          )}>
            Discover Projects
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Explore projects from developers who are transparent about their AI usage. Filter by category, tools, and more.
          </p>
        </div>
      </section>

      {/* Browse Content */}
      <section className={cn(
        'py-16 px-4',
        'max-w-7xl mx-auto w-full'
      )}>
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-warmPrimary-200 border-t-warmPrimary-600 animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading projects...</p>
            </div>
          </div>
        }>
          <BrowseContent searchParams={props.searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
