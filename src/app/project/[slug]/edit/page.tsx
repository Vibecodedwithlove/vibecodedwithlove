import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProjectSubmitForm from '@/components/projects/ProjectSubmitForm';

interface EditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: EditPageProps
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Edit ${slug}`,
    description: 'Edit your project',
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

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

  // Check if user is the owner
  if (project.creator_id !== user.id) {
    redirect(`/project/${slug}`);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <ProjectSubmitForm
          initialData={project}
          mode="edit"
        />
      </div>
    </main>
  );
}
