/**
 * Database schema types
 */

export type UserRole = 'member' | 'admin';
export type AiContributionLevel = 'mostly_ai' | 'about_half' | 'ai_assisted';
export type ProjectCategory = 'web_app' | 'mobile_app' | 'cli_tool' | 'api_service' | 'browser_extension' | 'automation' | 'game' | 'devtool' | 'other';
export type ProjectStatus = 'active' | 'archived';
export type SuggestionType = 'security' | 'performance' | 'ux' | 'bug' | 'general';
export type SuggestionStatus = 'open' | 'acknowledged' | 'resolved' | 'removed';

/**
 * Profile
 */
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  website_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Project
 */
export interface Project {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  description: string;
  demo_url: string | null;
  repo_url: string | null;
  ai_tools: string[];
  ai_contribution: AiContributionLevel;
  security_reviewed: boolean;
  open_to_suggestions: boolean;
  build_story: string;
  category: ProjectCategory;
  featured: boolean;
  status: ProjectStatus;
  // Project Anatomy
  what_it_does: string;
  user_flow: string;
  main_components: string;
  external_dependencies: string | null;
  least_confident: string | null;
  // Code Map
  code_map: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Suggestion
 */
export interface Suggestion {
  id: string;
  project_id: string;
  author_id: string | null;
  type: SuggestionType;
  title: string;
  body: string;
  how_to_fix: string;
  status: SuggestionStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Joined types
 */
export interface ProjectWithCreator extends Project {
  profiles: Profile | null;
}

export interface SuggestionWithAuthor extends Suggestion {
  profiles: Profile | null;
}

/**
 * Form data types
 */
export interface ProjectSubmitFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  ai_tools: string[];
  ai_contribution: AiContributionLevel;
  demo_url?: string;
  repo_url?: string;
  build_story: string;
  security_reviewed: boolean;
  open_to_suggestions: boolean;
  // Project Anatomy
  what_it_does: string;
  user_flow: string;
  main_components: string;
  external_dependencies?: string;
  least_confident?: string;
  // Code Map
  code_map?: string;
}

export interface SuggestionFormData {
  type: SuggestionType;
  title: string;
  body: string;
  how_to_fix: string;
}

/**
 * Auth types
 */
export interface AuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null;
}
