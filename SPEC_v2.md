# vibecodedwithlove.com — MVP Project Specification (v2)

> **Changelog from v1:** This revision incorporates fixes from the spec review. Changes are marked with `[CHANGED]`, `[NEW]`, or `[NOTE]` annotations. See `SPEC_REVIEW.md` for the full rationale behind each change.

## Mission

A platform where AI-assisted creators can transparently showcase their projects and get constructive help from the developer community. Built to combat the stigma around "vibe coded" projects by providing a framework for transparency, discovery, and collaborative improvement.

**The origin story:** This project was inspired by the Huntarr incident — a functional, AI-assisted tool that solved a real problem in the self-hosted community. When it was discovered to be AI-generated (with undisclosed security flaws compounded by user misconfiguration), the community pile-on led the developer to delete the entire project. Nobody won. vibecodedwithlove.com exists so that never has to happen again.

**This platform is itself the first project listed on it.** It was built with AI tools (Claude Code) and its own build story is documented transparently.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14.2.x (App Router) | SSR for SEO, API routes, Vercel-native. `[CHANGED]` Pinned to 14.2.x — Next.js 15 has breaking changes (async params, different caching defaults) |
| Hosting | Vercel (free tier) | Zero-config deploys, edge caching, generous free tier |
| Database | Supabase (free tier) | Postgres, built-in auth, row-level security, realtime |
| Auth | Supabase Auth | GitHub OAuth (primary), email/password (secondary) |
| Styling | Tailwind CSS | Utility-first, fast iteration with Claude Code |
| Markdown | react-markdown + remark-gfm | For build stories and suggestion bodies |
| OG Images | next/og (Satori) | `[NEW]` Dynamic Open Graph image generation per project |
| Testing | Vitest + @testing-library/react | `[NEW]` Minimal test suite for critical paths |
| DNS | Cloudflare | Domain already owned: vibecodedwithlove.com |
| Package Mgr | pnpm | Fast, disk-efficient |

`[NOTE]` **Markdown security rule:** Do NOT add `rehype-raw` or any plugin that allows raw HTML in user-submitted markdown. If HTML rendering is ever needed, use `rehype-sanitize` with a strict schema. `react-markdown` is safe by default — keep it that way.

---

## Database Schema (Supabase / Postgres)

### Shared utility: `updated_at` trigger

`[NEW]` All tables use this trigger to keep `updated_at` current automatically.

```sql
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### `profiles`

Extends Supabase's built-in `auth.users`. Created automatically via database trigger on signup.

```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null
    check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),  -- [CHANGED] Added validation
  display_name text,
  bio text,
  avatar_url text,
  github_url text,
  website_url text,
  role text default 'member' check (role in ('member', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- [NEW] Auto-update updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
```

### `projects`

```sql
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  -- [CHANGED] on delete set null instead of cascade, so projects survive account deletion
  creator_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text unique not null,
  description text not null,
  demo_url text,
  repo_url text,
  ai_tools text[] not null default '{}',
  ai_contribution text not null check (ai_contribution in ('mostly_ai', 'about_half', 'ai_assisted')),
  security_reviewed boolean default false,
  open_to_suggestions boolean default true,
  build_story text not null,
  category text not null check (category in (
    'web_app', 'mobile_app', 'cli_tool', 'api_service',
    'browser_extension', 'automation', 'game', 'devtool', 'other'
  )),
  featured boolean default false,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert with check (auth.uid() = creator_id);

create policy "Creators can update their own projects"
  on public.projects for update using (auth.uid() = creator_id);

create policy "Creators can delete their own projects"
  on public.projects for delete using (auth.uid() = creator_id);

-- [NEW] Auto-update updated_at
create trigger set_updated_at before update on public.projects
  for each row execute function public.update_updated_at();
```

### `suggestions`

```sql
create table public.suggestions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  -- [CHANGED] on delete set null so suggestions survive account deletion
  author_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('security', 'performance', 'ux', 'bug', 'general')),
  title text not null,
  body text not null,
  how_to_fix text not null,
  -- [CHANGED] Added 'removed' status for soft-delete moderation
  status text default 'open' check (status in ('open', 'acknowledged', 'resolved', 'removed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.suggestions enable row level security;

-- Policies
create policy "Suggestions are viewable by everyone"
  on public.suggestions for select using (true);

create policy "Authenticated users can create suggestions"
  on public.suggestions for insert with check (auth.uid() = author_id);

create policy "Authors can update their own suggestions"
  on public.suggestions for update using (auth.uid() = author_id);

-- [CHANGED] REMOVED the broad "Project owners can update suggestion status" policy.
-- Project owners update suggestion status via an RPC function instead (see below).
-- This prevents project owners from silently rewriting other users' suggestion content.

-- [NEW] Auto-update updated_at
create trigger set_updated_at before update on public.suggestions
  for each row execute function public.update_updated_at();
```

### `[NEW]` Server function: Update suggestion status

Replaces the overly-broad RLS policy. Project owners can only change the `status` column on suggestions for their projects — nothing else.

```sql
create or replace function public.update_suggestion_status(
  suggestion_id uuid,
  new_status text
) returns void as $$
begin
  if new_status not in ('open', 'acknowledged', 'resolved', 'removed') then
    raise exception 'Invalid status: %', new_status;
  end if;

  update public.suggestions
  set status = new_status, updated_at = now()
  where id = suggestion_id
  and project_id in (
    select id from public.projects where creator_id = auth.uid()
  );
end;
$$ language plpgsql security definer;
```

Frontend usage: `supabase.rpc('update_suggestion_status', { suggestion_id: '...', new_status: 'acknowledged' })`

### Helper: Auto-create profile on signup

`[CHANGED]` Now handles username collisions by appending a random suffix, and validates the generated username.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_base_username text;
begin
  -- Compute base username from available metadata
  v_base_username := lower(coalesce(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  ));

  -- Sanitize: keep only allowed characters, ensure minimum length
  v_base_username := regexp_replace(v_base_username, '[^a-z0-9_-]', '', 'g');
  if length(v_base_username) < 3 then
    v_base_username := v_base_username || 'user';
  end if;
  if length(v_base_username) > 26 then
    v_base_username := left(v_base_username, 26);
  end if;

  v_username := v_base_username;

  -- Handle collisions by appending random suffix
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_base_username || '_' || substr(gen_random_uuid()::text, 1, 4);
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url, github_url)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce('https://github.com/' || (new.raw_user_meta_data->>'user_name'), '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Indexes

```sql
create index idx_projects_creator on public.projects(creator_id);
create index idx_projects_category on public.projects(category);
create index idx_projects_featured on public.projects(featured) where featured = true;
create index idx_projects_slug on public.projects(slug);
-- [NEW] Browse page filters by active status on every query
create index idx_projects_active on public.projects(status) where status = 'active';
create index idx_suggestions_project on public.suggestions(project_id);
create index idx_suggestions_author on public.suggestions(author_id);
create index idx_suggestions_type on public.suggestions(type);
```

### `[NEW]` Reserved usernames

Enforce at the application layer (checked during profile creation/update). These conflict with URL routes.

```typescript
// src/lib/constants.ts
export const RESERVED_USERNAMES = [
  'admin', 'api', 'browse', 'project', 'profile', 'about',
  'resources', 'auth', 'login', 'signup', 'signout', 'callback',
  'settings', 'support', 'help', 'terms', 'privacy', 'null',
  'undefined', 'new', 'edit', 'delete', 'search', 'feed',
] as const;
```

---

## Project File Structure

`[CHANGED]` Added missing files marked with ← NEW comments.

```
vibecodedwithlove/
├── .env.local.example
├── .gitignore                          ← NEW
├── next.config.js
├── tailwind.config.js
├── package.json
├── README.md
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── middleware.ts                    ← NEW (Next.js middleware entry point)
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── not-found.tsx               ← NEW (custom 404 page)
│   │   ├── error.tsx                   ← NEW (custom error boundary)
│   │   ├── loading.tsx                 ← NEW (global loading state)
│   │   │
│   │   ├── browse/
│   │   │   └── page.tsx
│   │   │
│   │   ├── project/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx        ← NEW (edit project, authenticated)
│   │   │   └── submit/
│   │   │       └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── [username]/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx            ← NEW (edit own profile, authenticated)
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   │
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   │
│   │   └── api/
│   │       └── og/
│   │           └── route.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectSubmitForm.tsx   # Reused for create + edit (accepts initialData prop)
│   │   │   ├── AiToolBadge.tsx
│   │   │   ├── ContributionLevel.tsx
│   │   │   └── FilterBar.tsx
│   │   │
│   │   ├── suggestions/
│   │   │   ├── SuggestionList.tsx
│   │   │   ├── SuggestionCard.tsx      # Includes inline edit mode for suggestion authors
│   │   │   ├── SuggestionForm.tsx
│   │   │   └── SuggestionTypeBadge.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   └── ProfileSettingsForm.tsx ← NEW
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ConfirmDialog.tsx       ← NEW (for destructive actions)
│   │   │
│   │   └── shared/
│   │       ├── CommunityGuidelines.tsx
│   │       └── HeroSection.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts           # Helper imported by src/middleware.ts
│   │   │
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   └── types/
│       └── index.ts
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── tests/                              ← NEW
│   ├── setup.ts
│   ├── auth-callback.test.ts
│   ├── project-submit.test.ts
│   └── suggestion-submit.test.ts
│
└── docs/
    └── BUILD_STORY.md
```

---

## Environment Variables

`[CHANGED]` Removed service role key from local env. Added security note.

```env
# .env.local.example

# Supabase (client-safe keys only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site
NEXT_PUBLIC_SITE_URL=https://vibecodedwithlove.com

# ⚠️ SUPABASE_SERVICE_ROLE_KEY — set in Vercel dashboard ONLY.
# This key bypasses RLS and has admin-level database access.
# Never put it in .env.local or commit it to source control.
```

### `[NEW]` .gitignore

```gitignore
# dependencies
node_modules/
.pnp/
.pnp.js

# next.js
.next/
out/

# env files
.env*.local

# vercel
.vercel

# misc
*.tsbuildinfo
next-env.d.ts
.DS_Store
```

---

## Constants Reference

```typescript
// src/lib/constants.ts

export const AI_TOOLS = [
  'Claude',
  'Claude Code',
  'ChatGPT',
  'GitHub Copilot',
  'Cursor',
  'Windsurf',
  'Gemini',
  'Bolt',
  'Lovable',
  'v0',
  'Replit AI',
  'Other',
] as const;

export const CATEGORIES = [
  { value: 'web_app', label: 'Web Application' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'cli_tool', label: 'CLI Tool' },
  { value: 'api_service', label: 'API / Service' },
  { value: 'browser_extension', label: 'Browser Extension' },
  { value: 'automation', label: 'Automation' },
  { value: 'game', label: 'Game' },
  { value: 'devtool', label: 'Developer Tool' },
  { value: 'other', label: 'Other' },
] as const;

export const AI_CONTRIBUTION_LEVELS = [
  { value: 'mostly_ai', label: 'Mostly AI-Generated', description: '~75%+ of the code was AI-generated' },
  { value: 'about_half', label: 'Collaborative', description: 'Roughly equal human and AI contribution' },
  { value: 'ai_assisted', label: 'AI-Assisted', description: 'Human-led with AI help on specific parts' },
] as const;

export const SUGGESTION_TYPES = [
  { value: 'security', label: 'Security', color: 'red' },
  { value: 'performance', label: 'Performance', color: 'yellow' },
  { value: 'ux', label: 'UX / Design', color: 'blue' },
  { value: 'bug', label: 'Bug', color: 'orange' },
  { value: 'general', label: 'General', color: 'gray' },
] as const;

// [NEW] Prevent username conflicts with URL routes
export const RESERVED_USERNAMES = [
  'admin', 'api', 'browse', 'project', 'profile', 'about',
  'resources', 'auth', 'login', 'signup', 'signout', 'callback',
  'settings', 'support', 'help', 'terms', 'privacy', 'null',
  'undefined', 'new', 'edit', 'delete', 'search', 'feed',
] as const;

export const COMMUNITY_GUIDELINES = `
## How We Give Suggestions

This is a space for constructive collaboration, not criticism. When leaving a suggestion:

1. **Be specific.** Point to the exact file, function, or behavior you're referencing.
2. **Explain the "why."** Don't just say something is wrong — explain why it matters and what could go wrong.
3. **Include a path forward.** Every suggestion must include a "How to Fix" section. You can't just flag a problem — you have to point toward a solution, resource, or approach.
4. **Assume good intent.** The creator built something real and put it out there for feedback. Respect that.
5. **Stay constructive.** If you wouldn't say it to a coworker you respect, don't say it here.

Suggestions that are dismissive, mocking, or unconstructive will be removed.
`;
```

---

## Page Specifications

### Landing Page (`/`)

- **Hero section:** Headline ("Built with AI. Improved with community."), subheading explaining the mission, two CTAs ("Browse Projects" and "Submit Yours")
- **Featured showcase:** 3-6 cards of featured projects in a responsive grid
- **How it works:** Three-step visual (Submit → Get Suggestions → Improve)
- **The "why":** Brief narrative about why transparency matters (generalized Huntarr story without naming names)
- **Resources callout:** Link to the /resources page — "New to this? Check out our free tools and prompts to review your code before you ship."

### Browse Page (`/browse`)

- Filterable grid of all active projects
- Filter bar: category dropdown, AI tool multi-select, toggle for "seeking suggestions"
- Project cards show: title, description truncated, AI tools used (badges), category, suggestion count, date posted
- Sort by: newest, most suggestions, recently updated

### Project Detail Page (`/project/[slug]`)

- Full project info: title, description, creator profile link (or "[deleted user]" if creator account was removed `[CHANGED]`), demo + repo links
- `[NEW]` **Edit button** visible only to the project creator, links to `/project/[slug]/edit`
- AI transparency section: tools used, contribution level, security reviewed indicator
- Build story rendered as markdown (this is the centerpiece of the page)
- Suggestions section below: filterable by type, each suggestion shows title, type badge, body, how-to-fix, status, author
- "Leave a Suggestion" button (authenticated only) opens the suggestion form with community guidelines displayed

### `[NEW]` Project Edit Page (`/project/[slug]/edit`) — Authenticated

- Same form as the submit page, pre-filled with existing project data
- Reuses `ProjectSubmitForm.tsx` with an `initialData` prop and `mode: 'edit'`
- Only accessible by the project creator (redirect to project page if not authorized)
- Slug is not editable after creation (prevents broken links)
- Shows a `ConfirmDialog` before discarding unsaved changes

### Submit Page (`/project/submit`) — Authenticated

- Form fields: title, description, demo URL (optional), repo URL (optional but encouraged), select AI tools used (multi-select), AI contribution level (radio), security reviewed (checkbox), category (dropdown), open to suggestions (toggle, default on), build story (markdown textarea with preview)
- Auto-generates slug from title
- Shows community context: "By submitting, you're inviting constructive feedback from the community"
- Links to /resources with prompt: "Before you submit, consider running a quick self-review using our free tools and prompts"

### About Page (`/about`)

- Mission statement
- The origin story (why this exists)
- Community guidelines (full version)
- How to contribute
- Who built this (your profile as the founder)

### Profile Page (`/profile/[username]`)

- User info: display name, bio, GitHub link, avatar, join date
- Two tabs: "Projects" (their submitted projects) and "Suggestions" (suggestions they've made on other projects)
- `[NEW]` **Edit Profile button** visible only to the profile owner, links to `/profile/settings`

### `[NEW]` Profile Settings Page (`/profile/settings`) — Authenticated

- Edit display name, bio, website URL, GitHub URL
- Username is displayed but not editable (to prevent broken profile links)
- Avatar is pulled from GitHub OAuth — show a note explaining this
- Save button with optimistic UI update

### Resources Page (`/resources`)

A curated guide to free tools, documentation, and AI prompts that creators can use to review and improve their own code before (or after) submitting to the platform. Organized by skill level so non-programmers and experienced devs alike can find something useful. This page is a core part of the platform's mission — it empowers creators to self-improve, not just wait for community feedback.

`[NOTE]` This content is hardcoded for MVP. Flag as a candidate for MDX files or CMS-backed content in a future iteration so it can be updated without a code deploy.

**Section 1: Automated Scanning Tools (Run Them, Get Results)**

These are free tools that scan your codebase and report issues automatically. No AI prompting required — just point them at your repo.

| Tool | What It Does | Best For | Install |
|------|-------------|----------|---------|
| **GitHub CodeQL** | Free semantic code analysis for public repos via GitHub Actions. Detects security vulnerabilities on every push/PR. | Anyone with a public GitHub repo (zero friction) | Enable in repo Settings → Code security |
| **Semgrep** | Open-source static analysis using lightweight pattern matching. Huge community ruleset for security, bugs, and code standards. | Devs who want fast, customizable scanning in CI/CD | `brew install semgrep` or `pip install semgrep` |
| **Bearer CLI** | SAST scanner aligned with OWASP Top 10 and CWE Top 25. Catches injection flaws, auth issues, crypto weaknesses. Also tracks sensitive data flows. | Projects that handle user data or authentication | `curl -sfL https://raw.githubusercontent.com/Bearer/bearer/main/contrib/install.sh \| sh` |
| **SonarQube Community Edition** | Deep static analysis across 25+ languages with rich dashboards. Catches security vulns, code smells, and maintainability issues. | Self-hostable, thorough analysis with visual reporting | Docker or direct install from sonarqube.org |
| **Trivy** | Scans containers, dependencies, IaC, and code for vulnerabilities, secrets, license issues, and misconfigurations. | Anyone deploying with Docker or using third-party packages | `brew install trivy` or `apt-get install trivy` |
| **Graudit** | Lightweight grep-based scanner using signature databases. Catches common issues like SQL injection and XSS with zero setup. | Quick command-line audits, minimal overhead | `git clone https://github.com/wireghoul/graudit` |

**Section 2: AI-Powered Code Review (Pack Your Code → Feed It to an LLM)**

These tools help you prepare your codebase for AI review — bridging the gap between your project and the LLM.

| Tool | What It Does | How To Use It |
|------|-------------|---------------|
| **Repomix** | Packages your entire codebase into a single AI-friendly file (XML, Markdown, or plain text). Includes token counting, Secretlint integration for catching secrets, and respects .gitignore. | Run `npx repomix` in your project directory, then paste the output into Claude/ChatGPT with a review prompt. Also available as a GitHub Action for automation. |

**Section 3: AI Review Prompts (Copy, Paste, Get Feedback)**

These are ready-to-use prompts that creators can paste into Claude, ChatGPT, or any LLM along with their code (or Repomix output). Organized from simple to thorough.

**Quick Security Scan** (for non-programmers — just paste your code after this prompt):

```
You are a senior security engineer. Review the following code and check for:
1. Injection vulnerabilities (SQL, NoSQL, command injection)
2. Authentication and authorization issues
3. Sensitive data exposure (secrets in code, overly verbose error messages)
4. Missing input validation or sanitization
5. Insecure cryptography or hardcoded secrets

For each issue found, provide:
- Severity: Critical / High / Medium / Low
- What the problem is (in plain language)
- How to fix it (with a code example if possible)

If no issues are found in a category, say so. Be thorough but explain things in a way a non-security-expert can understand.

Here is the code:
[PASTE CODE OR REPOMIX OUTPUT HERE]
```

**Full Project Architecture Review** (for a more comprehensive analysis):

```
You are a senior software architect performing a pre-release review. This codebase was built with AI assistance. Review it with that context in mind — AI-generated code often has inconsistent patterns across files, generic error handling, and may not maintain security context between modules.

Analyze the following areas:
1. **Security**: OWASP Top 10 vulnerabilities, auth/session handling, input validation consistency across all endpoints, secrets management
2. **Architecture**: Code organization, separation of concerns, dependency management, error handling patterns
3. **Performance**: N+1 queries, unnecessary re-renders, missing indexes, unoptimized data fetching
4. **AI-Specific Issues**: Inconsistent patterns between files, hallucinated dependencies (packages that don't exist), copy-paste patterns where a flawed approach was reused, context boundary failures

For each finding:
- Severity: Critical / High / Medium / Low
- File and location (if identifiable)
- The problem explained clearly
- Specific fix with code example
- Why this matters (what could go wrong)

Prioritize findings by severity. Group related issues together.

Here is the codebase:
[PASTE REPOMIX OUTPUT HERE]
```

**Dependency & Supply Chain Check**:

```
Review the dependencies in this project. For each dependency:
1. Is this a real, actively maintained package? (AI tools sometimes hallucinate package names)
2. Are there known vulnerabilities in the version being used?
3. Is the package widely adopted or is it obscure/risky?
4. Are there better-maintained alternatives?
5. Are any dependencies unnecessary or redundant?

Also check for:
- Pinned vs unpinned versions
- Dev dependencies that ended up in production
- Packages that haven't been updated in over a year

Here are the project dependencies:
[PASTE package.json, requirements.txt, go.mod, OR EQUIVALENT]
```

**Pre-Submission Checklist Prompt** (specifically designed for vibecodedwithlove.com submissions):

```
I'm about to submit this project to a platform for AI-assisted projects where the community will review it. Help me prepare by checking:
1. Are there any hardcoded secrets, API keys, or credentials in the code?
2. Are there any obvious security vulnerabilities that would be embarrassing if found?
3. Is the code reasonably organized and readable?
4. Are there any dependencies that don't actually exist (hallucinated by the AI)?
5. Does the error handling reveal sensitive information?
6. If this were exposed to the internet, what would be the biggest risk?

Be direct and honest. I'd rather fix issues now than have them found publicly.

Here is the code:
[PASTE CODE OR REPOMIX OUTPUT HERE]
```

**Section 4: Reference Documentation**

Essential reading for understanding what these tools are actually checking for:

- **OWASP Top 10** (owasp.org/www-project-top-ten) — The industry-standard list of the most critical web application security risks. If you only read one thing, read this.
- **OWASP Free Tools for Open Source** (owasp.org/www-community/Free_for_Open_Source_Application_Security_Tools) — Comprehensive, regularly updated list of free security tools available to open-source projects.
- **OpenSSF Security Guide for AI Code Assistants** (best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions) — Specifically covers how to prompt AI tools to produce more secure code, and what to watch for in AI-generated output.
- **CWE Top 25** (cwe.mitre.org/top25) — The 25 most dangerous software weaknesses. More technical than OWASP Top 10 but useful for understanding specific vulnerability classes.

---

## Design Direction

The visual identity should feel **warm, approachable, and intentionally crafted** — the opposite of sterile corporate SaaS. It should communicate that this is a community space, not a product. Think along the lines of:

- Warm color palette: avoid cold blues and grays. Lean toward amber, warm whites, soft greens, or earth tones. The name has "love" in it — the design should feel inviting.
- Typography that has personality but remains readable. A distinctive display font for headings paired with a clean body font.
- Generous whitespace. Let the projects breathe.
- Subtle texture or grain — not flat, not skeuomorphic, just enough to feel human.
- The AI tool badges should be colorful and recognizable — each tool gets its own color.
- Dark mode support from day one (this audience lives in dark mode).
- `[NEW]` **Deleted user treatment:** When a project creator or suggestion author has deleted their account, display "[deleted user]" in a muted style with a generic avatar. Never show a broken profile link.

**Avoid:** generic SaaS dashboard aesthetics, purple gradients, anything that looks auto-generated. This is a platform celebrating AI-assisted creation — the design itself needs to demonstrate that AI + human taste produces good results.

---

## MVP Scope Boundaries

### In scope for v1

- GitHub OAuth login
- Project submission with build story
- **Project editing** `[NEW]`
- Browse/filter/discover projects
- Suggestion submission with "how to fix" requirement
- **Suggestion editing by authors** `[NEW]`
- Suggestion status management (creator can acknowledge/resolve)
- Manual curation via `featured` flag
- Community guidelines
- Resources page with free tools, AI review prompts, and reference docs
- Responsive design + dark mode
- SEO: dynamic meta tags, OG images per project
- **Profile settings/editing** `[NEW]`
- **Custom 404 and error pages** `[NEW]`
- **Confirmation dialogs for destructive actions** `[NEW]`

### Explicitly out of scope for v1

- Voting, likes, or ranking systems
- Badges or transparency scores
- Threaded comments or discussion on suggestions
- Direct messaging between users
- Email notifications
- Admin dashboard (manual DB edits are fine for now)
- API access for third parties
- Monetization of any kind
- Search (filter-based browsing is sufficient at MVP scale)
- Image uploads (project screenshots etc. — link to external images for now)
- Rate limiting beyond basic Supabase/Vercel defaults `[NOTE: revisit before public launch]`

---

## Deployment Checklist

1. Create Supabase project, run migration, enable GitHub OAuth provider
2. **Verify email confirmation settings** for email/password auth `[NEW]`
3. Create Vercel project, connect to GitHub repo
4. Set environment variables in Vercel dashboard **(including SUPABASE_SERVICE_ROLE_KEY — Vercel only, not .env.local)** `[CHANGED]`
5. Point vibecodedwithlove.com DNS to Vercel via Cloudflare
6. **Run the test suite** `[NEW]`
7. Submit the platform itself as the first project with full build story
8. Seed 3-5 additional projects (FreshFind, personal projects, invited submissions)

---

## Notes for Claude Code

- This project is being built entirely with AI assistance (Claude Code). Document every significant decision in `docs/BUILD_STORY.md` as the project progresses.
- Prioritize working functionality over polish. Get the data flowing end-to-end first, then refine the UI.
- Use Supabase's generated TypeScript types (`supabase gen types typescript`) to keep the type system in sync with the database.
- The suggestion form MUST display community guidelines before the user can submit. This is a core product decision, not a nice-to-have.
- Slug generation should handle collisions (append a short random suffix if the slug already exists).
- `[NEW]` **Pin Next.js to 14.2.x** in package.json. Do not use Next.js 15 — the spec assumes 14.x conventions.
- `[NEW]` The `src/middleware.ts` file must import the helper from `src/lib/supabase/middleware.ts` and handle session refresh + auth redirects for protected routes (`/project/submit`, `/project/[slug]/edit`, `/profile/settings`).
- `[NEW]` **Never add `rehype-raw`** or any plugin that allows raw HTML in user-submitted markdown.
- `[NEW]` When displaying projects or suggestions where the creator/author is null (deleted account), render "[deleted user]" — never a broken link or empty state.
- `[NEW]` Suggestion status updates by project owners must go through `supabase.rpc('update_suggestion_status')`, not a direct table update.
