import { Metadata } from 'next';
import Link from 'next/link';
import HeroSection from '@/components/shared/HeroSection';
import ProjectGrid from '@/components/projects/ProjectGrid';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { ProjectWithCreator } from '@/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Vibe Coded with Love - AI-Assisted Projects',
  description: 'Share your AI-assisted projects with radical transparency. Get constructive feedback from a community that celebrates your journey.',
};

// Mock data for fallback
const MOCK_PROJECTS: ProjectWithCreator[] = [
  {
    id: '1',
    creator_id: 'creator-1',
    title: 'Modern Todo App with Real-time Sync',
    slug: 'modern-todo-app',
    description: 'A beautifully designed todo application built with Next.js and Firebase, featuring real-time synchronization across devices and offline support.',
    demo_url: 'https://example.com/todo',
    repo_url: 'https://github.com/example/todo',
    ai_tools: ['Claude', 'v0'],
    ai_contribution: 'about_half',
    security_reviewed: true,
    open_to_suggestions: true,
    build_story: 'Started with Claude to scaffold the UI, then iteratively improved with community feedback.',
    category: 'web_app',
    what_it_does: 'A todo app with real-time sync across devices.',
    user_flow: '1. Sign up 2. Create lists 3. Add items 4. Check them off',
    main_components: 'Auth page, Dashboard, Real-time sync engine',
    external_dependencies: 'Firebase for database and auth',
    least_confident: null,
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-1',
      username: 'alexchen',
      display_name: 'Alex Chen',
      bio: 'Full-stack developer exploring AI',
      avatar_url: null,
      github_url: 'https://github.com/alexchen',
      website_url: 'https://alexchen.dev',
      role: 'member',
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    creator_id: 'creator-2',
    title: 'CLI Tool for Project Scaffolding',
    slug: 'cli-scaffold-tool',
    description: 'Command-line tool that generates boilerplate code for new projects, supporting multiple frameworks and configurations.',
    demo_url: null,
    repo_url: 'https://github.com/example/scaffold-cli',
    ai_tools: ['GitHub Copilot', 'ChatGPT'],
    ai_contribution: 'mostly_ai',
    security_reviewed: false,
    open_to_suggestions: true,
    build_story: 'Leveraged AI for rapid prototyping and testing edge cases.',
    category: 'cli_tool',
    what_it_does: 'Generates boilerplate code for new projects.',
    user_flow: '1. Install CLI 2. Run scaffold command 3. Choose framework 4. Get project files',
    main_components: 'CLI parser, Template engine, File generator',
    external_dependencies: null,
    least_confident: 'Template validation logic',
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-2',
      username: 'jordansmith',
      display_name: 'Jordan Smith',
      bio: null,
      avatar_url: null,
      github_url: null,
      website_url: null,
      role: 'member',
      created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    creator_id: 'creator-3',
    title: 'Browser Extension for Developer Productivity',
    slug: 'dev-productivity-extension',
    description: 'Enhance your development workflow with this browser extension that integrates popular dev tools and shortcuts.',
    demo_url: 'https://example.com/extension-demo',
    repo_url: 'https://github.com/example/dev-extension',
    ai_tools: ['Claude', 'Cursor'],
    ai_contribution: 'ai_assisted',
    security_reviewed: true,
    open_to_suggestions: true,
    build_story: 'Used AI as a pair programmer to accelerate development while maintaining code quality.',
    category: 'browser_extension',
    what_it_does: 'Integrates popular dev tools and shortcuts into the browser.',
    user_flow: '1. Install extension 2. Configure shortcuts 3. Use toolbar in any tab',
    main_components: 'Popup UI, Background service worker, Content scripts',
    external_dependencies: 'Chrome Extensions API',
    least_confident: null,
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-3',
      username: 'sarahkim',
      display_name: 'Sarah Kim',
      bio: 'Frontend developer passionate about UX',
      avatar_url: null,
      github_url: 'https://github.com/sarahkim',
      website_url: 'https://sarahkim.design',
      role: 'member',
      created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '4',
    creator_id: 'creator-1',
    title: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Real-time analytics dashboard with interactive charts, data filtering, and export capabilities built with React and D3.',
    demo_url: 'https://example.com/analytics',
    repo_url: 'https://github.com/example/analytics',
    ai_tools: ['v0', 'ChatGPT'],
    ai_contribution: 'about_half',
    security_reviewed: true,
    open_to_suggestions: false,
    build_story: 'AI helped with chart implementations and data visualization logic.',
    category: 'web_app',
    what_it_does: 'Real-time analytics dashboard with interactive charts.',
    user_flow: '1. Connect data source 2. View dashboards 3. Filter and export',
    main_components: 'Chart components, Data pipeline, Export module',
    external_dependencies: 'D3.js for charts',
    least_confident: null,
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-1',
      username: 'alexchen',
      display_name: 'Alex Chen',
      bio: 'Full-stack developer exploring AI',
      avatar_url: null,
      github_url: 'https://github.com/alexchen',
      website_url: 'https://alexchen.dev',
      role: 'member',
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '5',
    creator_id: 'creator-4',
    title: 'Machine Learning Training API',
    slug: 'ml-training-api',
    description: 'RESTful API service for training and deploying machine learning models with support for multiple frameworks.',
    demo_url: null,
    repo_url: 'https://github.com/example/ml-api',
    ai_tools: ['Claude', 'GitHub Copilot'],
    ai_contribution: 'ai_assisted',
    security_reviewed: true,
    open_to_suggestions: true,
    build_story: 'AI assisted with documentation and implementation of complex ML concepts.',
    category: 'api_service',
    what_it_does: 'API for training and deploying ML models.',
    user_flow: '1. Upload dataset 2. Configure model 3. Train 4. Deploy endpoint',
    main_components: 'REST API, Model trainer, Deployment pipeline',
    external_dependencies: 'PyTorch, FastAPI',
    least_confident: 'Model serialization and deployment',
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-4',
      username: 'davidpatel',
      display_name: 'David Patel',
      bio: 'ML engineer and Python enthusiast',
      avatar_url: null,
      github_url: 'https://github.com/davidpatel',
      website_url: null,
      role: 'member',
      created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '6',
    creator_id: 'creator-5',
    title: 'Mobile Game: Space Puzzle',
    slug: 'space-puzzle-game',
    description: 'Engaging puzzle game for mobile devices with progressive difficulty, leaderboards, and offline play.',
    demo_url: null,
    repo_url: 'https://github.com/example/space-game',
    ai_tools: ['Bolt', 'Claude'],
    ai_contribution: 'mostly_ai',
    security_reviewed: false,
    open_to_suggestions: true,
    build_story: 'Built the entire game with Bolt, then refined with Claude for game mechanics.',
    category: 'game',
    what_it_does: 'Puzzle game with progressive difficulty and leaderboards.',
    user_flow: '1. Launch game 2. Choose level 3. Solve puzzles 4. View leaderboard',
    main_components: 'Game engine, Level generator, Leaderboard system',
    external_dependencies: null,
    least_confident: 'Difficulty scaling algorithm',
    code_map: null,
    featured: true,
    status: 'active',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'creator-5',
      username: 'emilyang',
      display_name: 'Emily Yang',
      bio: 'Game developer and indie creator',
      avatar_url: null,
      github_url: 'https://github.com/emilyang',
      website_url: 'https://emilygames.dev',
      role: 'member',
      created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

async function getFeaturedProjects() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles:creator_id(id, username, display_name, bio, avatar_url, github_url, website_url, role, created_at, updated_at)')
      .eq('featured', true)
      .eq('status', 'active')
      .limit(6)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured projects:', error);
      return MOCK_PROJECTS;
    }

    return (data as ProjectWithCreator[]) || MOCK_PROJECTS;
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    return MOCK_PROJECTS;
  }
}

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <main className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Projects */}
      <section className={cn(
        'py-16 sm:py-20 lg:py-24 px-4',
        'max-w-7xl mx-auto w-full'
      )}>
        <div className="mb-12">
          <h2 className={cn(
            'text-3xl sm:text-4xl font-bold',
            'text-foreground mb-3'
          )}>
            Featured Projects
          </h2>
          <p className="text-lg text-foreground/70">
            Discover amazing projects built with AI, by developers like you
          </p>
        </div>

        <ProjectGrid projects={featuredProjects} />
      </section>

      {/* How It Works */}
      <section className={cn(
        'py-16 sm:py-20 lg:py-24 px-4',
        'bg-warmPrimary-50 dark:bg-warmPrimary-900/20',
        'border-y border-border'
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className={cn(
              'text-3xl sm:text-4xl font-bold',
              'text-foreground mb-3'
            )}>
              How It Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Three simple steps to share your work and grow as a developer
            </p>
          </div>

          <div className={cn(
            'grid grid-cols-1 md:grid-cols-3 gap-8',
            'max-w-4xl mx-auto'
          )}>
            {/* Step 1 */}
            <div className="text-center">
              <div className={cn(
                'w-16 h-16 rounded-full',
                'bg-warmPrimary-200 dark:bg-warmPrimary-700',
                'flex items-center justify-center mx-auto mb-4',
                'text-2xl font-bold text-warmPrimary-900 dark:text-warmPrimary-100'
              )}>
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Submit Your Project
              </h3>
              <p className="text-foreground/70">
                Share your AI-assisted creation with honest details about which tools you used and how much they contributed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className={cn(
                'w-16 h-16 rounded-full',
                'bg-warmSecondary-200 dark:bg-warmSecondary-700',
                'flex items-center justify-center mx-auto mb-4',
                'text-2xl font-bold text-warmSecondary-900 dark:text-warmSecondary-100'
              )}>
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Get Constructive Feedback
              </h3>
              <p className="text-foreground/70">
                Receive thoughtful suggestions from community members who want to help you improve your work.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className={cn(
                'w-16 h-16 rounded-full',
                'bg-amber-200 dark:bg-amber-700',
                'flex items-center justify-center mx-auto mb-4',
                'text-2xl font-bold text-amber-900 dark:text-amber-100'
              )}>
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Improve & Iterate
              </h3>
              <p className="text-foreground/70">
                Use the feedback to refine your project and grow your skills alongside the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Transparency Matters */}
      <section className={cn(
        'py-16 sm:py-20 lg:py-24 px-4',
        'max-w-7xl mx-auto w-full'
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={cn(
              'text-3xl sm:text-4xl font-bold',
              'text-foreground mb-6'
            )}>
              Why Transparency Matters
            </h2>
            <div className="space-y-4 text-lg text-foreground/80">
              <p>
                AI is reshaping how we build software. Some people hide this reality, pretending their work came from pure human effort. We think that&apos;s missing the point.
              </p>
              <p>
                When you&apos;re honest about your AI usage—whether it&apos;s 5% or 95%—you&apos;re participating in something bigger than yourself. You&apos;re contributing to a real conversation about the future of development.
              </p>
              <p>
                Hiding AI usage erodes trust. Transparency builds it. And trust is what we need if developers are going to navigate these tools responsibly.
              </p>
              <p>
                That&apos;s what Vibe Coded with Love is about. Not judging, but celebrating, the journey of building with AI. No shame. No hiding. Just honest work.
              </p>
            </div>
          </div>
          <div className={cn(
            'bg-gradient-to-br from-warmPrimary-100 to-warmSecondary-100',
            'dark:from-warmPrimary-900/40 dark:to-warmSecondary-900/40',
            'rounded-lg p-8 sm:p-10',
            'border border-warmPrimary-200 dark:border-warmPrimary-700'
          )}>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              The Real Value
            </h3>
            <ul className="space-y-4">
              {[
                'Honest conversations about AI in development',
                'Learning from real-world use cases',
                'Feedback that helps you improve',
                'A community that celebrates your journey',
                'Understanding the impact of AI on your craft',
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-warmPrimary-600 dark:text-warmPrimary-300 font-bold text-lg">✓</span>
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Resources CTA */}
      <section className={cn(
        'py-16 sm:py-20 lg:py-24 px-4',
        'bg-warmPrimary-100 dark:bg-warmPrimary-900/30',
        'border-y border-border'
      )}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(
            'text-3xl sm:text-4xl font-bold',
            'text-foreground mb-4'
          )}>
            Learn and Grow
          </h2>
          <p className={cn(
            'text-lg text-foreground/70 mb-8',
            'max-w-2xl mx-auto'
          )}>
            Explore our resources to understand AI-assisted development, best practices, and how to make the most of these powerful tools.
          </p>
          <Link href="/resources">
            <Button variant="primary" size="lg">
              Explore Resources
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
