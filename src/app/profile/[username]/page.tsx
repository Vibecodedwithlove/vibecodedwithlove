import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProjectCard from '@/components/projects/ProjectCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/utils';
import { SUGGESTION_TYPES } from '@/lib/constants';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata(
  { params }: ProfilePageProps
): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: 'Profile Not Found',
      description: 'The profile you are looking for does not exist.',
    };
  }

  return {
    title: `${profile.display_name || username}'s Profile`,
    description: profile.bio || `View ${username}'s profile and projects on Vibe Coded with Love`,
    openGraph: {
      title: `${profile.display_name || username}'s Profile`,
      description: profile.bio || `View ${username}'s profile and projects on Vibe Coded with Love`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile/${username}`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Get current user for owner check
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  const isOwner = currentUserId === profile.id;

  // Fetch user's active projects
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:creator_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('creator_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Fetch user's suggestions
  const { data: suggestions } = await supabase
    .from('suggestions')
    .select(`
      id,
      title,
      type,
      created_at,
      projects:project_id (
        slug,
        title
      )
    `)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false });

  const getSuggestionTypeColor = (type: string) => {
    const suggestionType = SUGGESTION_TYPES.find(st => st.value === type);
    return suggestionType?.color || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <ProfileHeader profile={profile} isOwner={isOwner} />

        {/* Tabs Section */}
        <div className="mt-12">
          {projects && projects.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      ...project,
                      profiles: project.profiles,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Suggestions Given</h2>
              <div className="space-y-4">
                {suggestions.map(suggestion => (
                  <Card key={suggestion.id} hover={false} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {suggestion.title}
                          </h3>
                          <Badge
                            color="primary"
                            size="sm"
                            className={getSuggestionTypeColor(suggestion.type)}
                          >
                            {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                          </Badge>
                        </div>

                        {suggestion.projects && (
                          <Link
                            href={`/project/${(suggestion.projects as unknown as { slug: string; title: string }).slug}`}
                            className="text-warmPrimary hover:text-warmPrimaryDark text-sm font-medium transition-colors"
                          >
                            → {(suggestion.projects as unknown as { slug: string; title: string }).title}
                          </Link>
                        )}
                      </div>

                      <p className="text-xs text-foreground/60 whitespace-nowrap">
                        {formatRelativeDate(suggestion.created_at)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!projects || (!projects.length && !suggestions?.length) && (
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg mb-4">
                No projects or suggestions yet
              </p>
              {!isOwner && (
                <p className="text-foreground/50 text-sm">
                  Check back later to see what {profile.display_name || profile.username} shares
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
