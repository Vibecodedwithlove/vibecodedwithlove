'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ProjectWithCreator,
  ProjectSubmitFormData,
  AiContributionLevel,
  ProjectCategory,
} from '@/types';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import {
  AI_TOOLS,
  CATEGORIES,
  AI_CONTRIBUTION_LEVELS,
  COMMUNITY_GUIDELINES,
} from '@/lib/constants';
import { generateSlug, cn } from '@/lib/utils';

type Mode = 'create' | 'edit';

interface ProjectSubmitFormProps {
  initialData?: ProjectWithCreator;
  mode: Mode;
}

export default function ProjectSubmitForm({
  initialData,
  mode,
}: ProjectSubmitFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<ProjectSubmitFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'web_app',
    ai_tools: initialData?.ai_tools || [],
    ai_contribution: initialData?.ai_contribution || 'ai_assisted',
    demo_url: initialData?.demo_url || '',
    repo_url: initialData?.repo_url || '',
    build_story: initialData?.build_story || '',
    security_reviewed: initialData?.security_reviewed || false,
    open_to_suggestions: initialData?.open_to_suggestions ?? true,
    what_it_does: initialData?.what_it_does || '',
    user_flow: initialData?.user_flow || '',
    main_components: initialData?.main_components || '',
    external_dependencies: initialData?.external_dependencies || '',
    least_confident: initialData?.least_confident || '',
    code_map: initialData?.code_map || '',
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [codeMapActiveTab, setCodeMapActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(false);

  const slug = useMemo(
    () => (mode === 'create' ? generateSlug(formData.title) : initialData?.slug),
    [formData.title, mode, initialData?.slug]
  );

  const handleChange = (
    field: keyof ProjectSubmitFormData,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const toggleAiTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      ai_tools: prev.ai_tools.includes(tool)
        ? prev.ai_tools.filter((t) => t !== tool)
        : [...prev.ai_tools, tool],
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Project title is required');
      return false;
    }
    if (formData.title.trim().length < 3) {
      setError('Project title must be at least 3 characters');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return false;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return false;
    }
    if (!formData.what_it_does.trim()) {
      setError('What it does is required');
      return false;
    }
    if (!formData.user_flow.trim()) {
      setError('User flow is required');
      return false;
    }
    if (!formData.main_components.trim()) {
      setError('Main components is required');
      return false;
    }
    if (!formData.build_story.trim()) {
      setError('Build story is required');
      return false;
    }
    if (formData.ai_tools.length === 0) {
      setError('Please select at least one AI tool');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase is not configured. Please set up your environment variables.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Reserved slugs that conflict with app routes
      const RESERVED_SLUGS = ['submit', 'new', 'edit', 'delete', 'api', 'admin', 'browse', 'auth'];
      let projectSlug = generateSlug(formData.title);

      if (RESERVED_SLUGS.includes(projectSlug)) {
        projectSlug += '-' + Math.random().toString(36).slice(2, 6);
      }

      if (mode === 'create') {
        // Retry loop to handle slug collisions (TOCTOU race condition)
        let attempts = 0;
        let lastError: unknown = null;

        while (attempts < 5) {
          const { data, error: submitError } = await supabase
            .from('projects')
            .insert([
              {
                creator_id: user.id,
                title: formData.title,
                slug: projectSlug,
                description: formData.description,
                category: formData.category,
                ai_tools: formData.ai_tools,
                ai_contribution: formData.ai_contribution,
                demo_url: formData.demo_url || null,
                repo_url: formData.repo_url || null,
                build_story: formData.build_story,
                security_reviewed: formData.security_reviewed,
                open_to_suggestions: formData.open_to_suggestions,
                what_it_does: formData.what_it_does,
                user_flow: formData.user_flow,
                main_components: formData.main_components,
                external_dependencies: formData.external_dependencies || null,
                least_confident: formData.least_confident || null,
                code_map: formData.code_map || null,
                status: 'active',
                featured: false,
              },
            ])
            .select()
            .single();

          if (!submitError && data) {
            router.push(`/project/${data.slug}`);
            return;
          }

          // Slug collision — retry with random suffix
          if (submitError?.code === '23505' && submitError?.message?.includes('slug')) {
            projectSlug = generateSlug(formData.title) + '-' + Math.random().toString(36).slice(2, 6);
            attempts++;
            lastError = submitError;
            continue;
          }

          // Field length constraint violation
          if (submitError?.code === '23514') {
            setError('One of your fields exceeds the maximum length. Please shorten your content.');
            return;
          }

          // Other error — don't retry
          lastError = submitError;
          break;
        }

        if (attempts >= 5) {
          setError('Could not generate a unique URL. Please try a different title.');
          return;
        }
        if (lastError) throw lastError;
      } else {
        if (!initialData) throw new Error('No project data to update');

        const { error: updateError } = await supabase
          .from('projects')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            ai_tools: formData.ai_tools,
            ai_contribution: formData.ai_contribution,
            demo_url: formData.demo_url || null,
            repo_url: formData.repo_url || null,
            build_story: formData.build_story,
            security_reviewed: formData.security_reviewed,
            open_to_suggestions: formData.open_to_suggestions,
            what_it_does: formData.what_it_does,
            user_flow: formData.user_flow,
            main_components: formData.main_components,
            external_dependencies: formData.external_dependencies || null,
            least_confident: formData.least_confident || null,
            code_map: formData.code_map || null,
          })
          .eq('id', initialData.id)
          .eq('creator_id', user.id);

        if (updateError) {
          if (updateError.code === '23514') {
            setError('One of your fields exceeds the maximum length. Please shorten your content.');
            return;
          }
          throw updateError;
        }

        router.push(`/project/${initialData.slug}`);
      }
    } catch (err) {
      console.error('Project submission failed:', err);
      setError('Failed to submit project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {mode === 'create' ? 'Submit Your Project' : 'Edit Project'}
        </h1>
        <p className="text-muted">
          Share your AI-powered project with the community
        </p>
      </div>

      {/* ===== SECTION 1: PROJECT BASICS ===== */}
      <div className="border-l-4 border-warmPrimary pl-6 py-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">Project Basics</h2>
        <p className="text-muted text-sm mb-6">Core project information and settings</p>

        <div className="space-y-4">
          {/* Title */}
          <Card padding="lg">
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="My Awesome AI Project"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={isLoading}
                maxLength={100}
                required
              />
              {mode === 'create' && slug && (
                <div className="p-3 rounded-lg bg-input border border-border">
                  <p className="text-xs text-muted font-medium">URL Preview:</p>
                  <code className="text-sm text-foreground font-mono">
                    /project/{slug}
                  </code>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card padding="lg">
            <Textarea
              label="Description"
              placeholder="A brief description of your project..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
              rows={4}
              maxLength={500}
              showCharCount
              required
            />
          </Card>

          {/* URLs */}
          <Card padding="lg">
            <div className="space-y-4">
              <Input
                label="Demo URL"
                type="url"
                placeholder="https://example.com"
                value={formData.demo_url}
                onChange={(e) => handleChange('demo_url', e.target.value)}
                disabled={isLoading}
                helperText="Optional — Link to your live demo"
              />
              <Input
                label="Repo URL"
                type="url"
                placeholder="https://github.com/user/repo"
                value={formData.repo_url}
                onChange={(e) => handleChange('repo_url', e.target.value)}
                disabled={isLoading}
                helperText="Recommended — Lets reviewers look at your code"
              />
            </div>
          </Card>

          {/* Category */}
          <Card padding="lg">
            <Select
              label="Category"
              options={CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as ProjectCategory)}
              disabled={isLoading}
            />
          </Card>

          {/* AI Tools */}
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  AI Tools Used
                </h3>
                <p className="text-sm text-muted">
                  Select all the AI tools you used in this project
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleAiTool(tool)}
                    disabled={isLoading}
                    className={cn(
                      'px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all',
                      formData.ai_tools.includes(tool)
                        ? 'border-warmPrimary bg-warmPrimary text-white'
                        : 'border-border bg-input text-foreground hover:border-warmPrimary'
                    )}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Contribution Level */}
          <Card padding="lg">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                AI Contribution Level
              </h3>
              <div className="space-y-3">
                {AI_CONTRIBUTION_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-warmPrimary"
                    style={{
                      borderColor:
                        formData.ai_contribution === level.value
                          ? 'var(--color-warm-primary)'
                          : 'var(--color-border)',
                      backgroundColor:
                        formData.ai_contribution === level.value
                          ? 'var(--color-input)'
                          : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="ai_contribution"
                      value={level.value}
                      checked={formData.ai_contribution === level.value}
                      onChange={(e) =>
                        handleChange(
                          'ai_contribution',
                          e.target.value as AiContributionLevel
                        )
                      }
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {level.label}
                      </p>
                      <p className="text-sm text-muted">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Security & Suggestions */}
          <Card padding="lg">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Project Settings</h3>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.security_reviewed}
                  onChange={(e) =>
                    handleChange('security_reviewed', e.target.checked)
                  }
                  disabled={isLoading}
                  className="w-4 h-4 rounded"
                />
                <span className="text-foreground font-medium">
                  I&apos;ve reviewed this project for security issues
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.open_to_suggestions}
                  onChange={(e) =>
                    handleChange('open_to_suggestions', e.target.checked)
                  }
                  disabled={isLoading}
                  className="w-4 h-4 rounded"
                />
                <span className="text-foreground font-medium">
                  Open to suggestions from the community
                </span>
              </label>
            </div>
          </Card>
        </div>
      </div>

      {/* ===== SECTION 2: PROJECT ANATOMY ===== */}
      <div className="border-l-4 border-warmPrimary pl-6 py-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">Project Anatomy</h2>
        <p className="text-muted text-sm mb-6">
          Help reviewers understand your project. Write in plain language — no code knowledge required.
        </p>

        <div className="space-y-4">
          {/* What does your app do? */}
          <Card padding="lg">
            <Textarea
              label="What does your app do?"
              placeholder="Explain it like you're telling a friend. What problem does it solve? One paragraph is fine."
              value={formData.what_it_does}
              onChange={(e) => handleChange('what_it_does', e.target.value)}
              disabled={isLoading}
              rows={4}
              helperText="Explain it like you&apos;re telling a friend. What problem does it solve? One paragraph is fine."
              required
            />
          </Card>

          {/* How does a user use it? */}
          <Card padding="lg">
            <Textarea
              label="How does a user use it?"
              placeholder="Walk through what someone does from opening the app to accomplishing their goal. Example: '1. User signs up with email 2. User creates a new list 3. User adds items and checks them off'"
              value={formData.user_flow}
              onChange={(e) => handleChange('user_flow', e.target.value)}
              disabled={isLoading}
              rows={4}
              helperText="Walk through what someone does from opening the app to accomplishing their goal. Example: &apos;1. User signs up with email 2. User creates a new list 3. User adds items and checks them off&apos;"
              required
            />
          </Card>

          {/* What are the main parts? */}
          <Card padding="lg">
            <Textarea
              label="What are the main parts?"
              placeholder="List the main pieces of your app and what each one handles. Example: 'Login page — handles sign up and sign in. Dashboard — shows the user's lists. API routes — connects to the database.'"
              value={formData.main_components}
              onChange={(e) => handleChange('main_components', e.target.value)}
              disabled={isLoading}
              rows={4}
              helperText="List the main pieces of your app and what each one handles. Example: &apos;Login page — handles sign up and sign in. Dashboard — shows the user&apos;s lists. API routes — connects to the database.&apos;"
              required
            />
          </Card>

          {/* What external services does it use? */}
          <Card padding="lg">
            <Textarea
              label="What external services does it use?"
              placeholder="Any APIs, databases, or third-party services? Example: 'Supabase for database and auth, Stripe for payments, SendGrid for emails.'"
              value={formData.external_dependencies}
              onChange={(e) => handleChange('external_dependencies', e.target.value)}
              disabled={isLoading}
              rows={3}
              helperText="Any APIs, databases, or third-party services? Example: &apos;Supabase for database and auth, Stripe for payments, SendGrid for emails.&apos;"
            />
          </Card>

          {/* Where do you need the most help? */}
          <Card padding="lg">
            <div className="space-y-3">
              <Textarea
                label="Where do you need the most help?"
                placeholder="What parts are you least confident about? This tells reviewers exactly where to focus."
                value={formData.least_confident}
                onChange={(e) => handleChange('least_confident', e.target.value)}
                disabled={isLoading}
                rows={3}
                helperText="What parts are you least confident about? This tells reviewers exactly where to focus."
              />
              <div className="flex gap-2 p-3 rounded-lg bg-warmPrimary/5 border border-warmPrimary/20">
                <span className="text-warmPrimary text-lg">💡</span>
                <p className="text-sm text-foreground italic">
                  Filling this out gets you better suggestions
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ===== SECTION 3: BUILD STORY & CODE MAP ===== */}
      <div className="border-l-4 border-warmPrimary pl-6 py-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">Build Story & Code Map</h2>
        <p className="text-muted text-sm mb-6">
          Tell your development journey and document your codebase
        </p>

        <div className="space-y-4">
          {/* Build Story */}
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Build Story
                </h3>
                <p className="text-sm text-muted mb-4">
                  Tell us about your development journey. Markdown supported.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={cn(
                    'px-4 py-2 font-medium text-sm transition-colors',
                    activeTab === 'edit'
                      ? 'text-warmPrimary border-b-2 border-warmPrimary'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    'px-4 py-2 font-medium text-sm transition-colors',
                    activeTab === 'preview'
                      ? 'text-warmPrimary border-b-2 border-warmPrimary'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  Preview
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'edit' ? (
                <Textarea
                  value={formData.build_story}
                  onChange={(e) => handleChange('build_story', e.target.value)}
                  disabled={isLoading}
                  rows={10}
                  placeholder="# My Journey

Tell your story here..."
                  className="font-mono"
                  required
                />
              ) : (
                <div className="min-h-64 p-4 rounded-lg bg-input border border-border">
                  <MarkdownRenderer content={formData.build_story} />
                </div>
              )}
            </div>
          </Card>

          {/* Code Map */}
          <Card padding="lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Code Map (optional but recommended)
                </h3>
                <p className="text-sm text-muted mb-4">
                  Generate this automatically! Run the Code Map Generator prompt from our{' '}
                  <a href="/resources" className="text-warmPrimary hover:text-warmPrimaryDark underline transition-colors">
                    Resources page
                  </a>
                  {' '}against your codebase, then paste the output here.
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-input border border-border">
                <p className="text-sm text-foreground">
                  A Code Map is a structured overview of your codebase — file structure, data flow, routes, and components — generated by running an AI prompt against your code using a tool like Repomix.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setCodeMapActiveTab('edit')}
                  className={cn(
                    'px-4 py-2 font-medium text-sm transition-colors',
                    codeMapActiveTab === 'edit'
                      ? 'text-warmPrimary border-b-2 border-warmPrimary'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setCodeMapActiveTab('preview')}
                  className={cn(
                    'px-4 py-2 font-medium text-sm transition-colors',
                    codeMapActiveTab === 'preview'
                      ? 'text-warmPrimary border-b-2 border-warmPrimary'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  Preview
                </button>
              </div>

              {/* Tab Content */}
              {codeMapActiveTab === 'edit' ? (
                <Textarea
                  value={formData.code_map}
                  onChange={(e) => handleChange('code_map', e.target.value)}
                  disabled={isLoading}
                  rows={10}
                  placeholder="Paste your code map here..."
                  className="font-mono"
                />
              ) : (
                <div className="min-h-64 p-4 rounded-lg bg-input border border-border">
                  <MarkdownRenderer content={formData.code_map || '*(No code map provided yet)*'} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Guidelines Link */}
      <Card padding="md" className="bg-warmPrimary/5 border-warmPrimary/20">
        <button
          type="button"
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="text-warmPrimary font-medium hover:text-warmPrimaryDark transition-colors text-left"
        >
          {showGuidelines ? '▼' : '▶'} Community Guidelines
        </button>
        {showGuidelines && (
          <div className="mt-4 prose prose-sm max-w-none">
            <MarkdownRenderer content={COMMUNITY_GUIDELINES} />
          </div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          className="flex-1"
        >
          {mode === 'create' ? 'Submit Project' : 'Update Project'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
