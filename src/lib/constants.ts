/**
 * Application constants
 */

export const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Copilot',
  'Cursor',
  'v0',
  'Bolt',
  'Replit',
  'GitHub Copilot',
  'Perplexity',
  'Together AI',
  'DeepSeek',
  'Qwen',
  'LLaMA',
  'Mixtral',
  'Other',
] as const;

export const CATEGORIES = [
  { value: 'web_app', label: 'Web App' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'cli_tool', label: 'CLI Tool' },
  { value: 'api_service', label: 'API Service' },
  { value: 'browser_extension', label: 'Browser Extension' },
  { value: 'automation', label: 'Automation' },
  { value: 'game', label: 'Game' },
  { value: 'devtool', label: 'Dev Tool' },
  { value: 'other', label: 'Other' },
] as const;

export const AI_CONTRIBUTION_LEVELS = [
  {
    value: 'mostly_ai',
    label: 'Mostly AI',
    description: '70-100% of code written by AI',
  },
  {
    value: 'about_half',
    label: 'About Half',
    description: '40-70% of code written by AI',
  },
  {
    value: 'ai_assisted',
    label: 'AI-Assisted',
    description: '0-40% of code written by AI',
  },
] as const;

export const SUGGESTION_TYPES = [
  { value: 'security', label: 'Security', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'performance', label: 'Performance', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'ux', label: 'UX', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'bug', label: 'Bug', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800 border-gray-300' },
] as const;

export const RESERVED_USERNAMES = [
  'admin',
  'api',
  'app',
  'auth',
  'blog',
  'browse',
  'chat',
  'dashboard',
  'docs',
  'explore',
  'featured',
  'feedback',
  'help',
  'home',
  'login',
  'logout',
  'me',
  'new',
  'profile',
  'projects',
  'search',
  'settings',
  'signup',
  'suggestions',
  'trending',
  'user',
  'users',
  'api',
  'system',
  'admin',
  'root',
  'null',
  'undefined',
  'localhost',
] as const;

export const COMMUNITY_GUIDELINES = `# Community Guidelines

Welcome to Vibe Coded with Love! We're building a welcoming community for developers of all levels who are exploring AI in their development workflows.

## Our Values

- **Transparency**: Be honest about your AI tool usage and the extent of AI contribution
- **Respect**: Treat all community members with kindness and respect
- **Learning**: Help others learn and grow
- **Quality**: Strive for quality work while exploring new tools

## Do's

- ✅ Share interesting projects built with AI assistance
- ✅ Provide constructive feedback and suggestions
- ✅ Credit the AI tools you used
- ✅ Help newcomers learn about AI development tools
- ✅ Celebrate others' work and progress
- ✅ Ask questions and share your learning journey

## Don'ts

- ❌ Submit projects that aren't yours
- ❌ Mislead about the level of AI contribution
- ❌ Post spam, promotions, or unsolicited advertising
- ❌ Share harmful, illegal, or explicit content
- ❌ Harass, discriminate, or disrespect others
- ❌ Post malicious code or security threats
- ❌ Spam suggestions on projects

## Suggestion Guidelines

When leaving suggestions on projects:

- Be respectful and constructive
- Focus on the code and approach, not the person
- Provide specific, actionable feedback
- Acknowledge the effort involved in building something
- If reporting a security issue, please do so privately when possible

## Moderation

We reserve the right to remove content that violates these guidelines. Repeated violations may result in account suspension or removal.

## Questions?

If you have questions about these guidelines, please reach out to our moderation team.

Thank you for being part of our community!`;
