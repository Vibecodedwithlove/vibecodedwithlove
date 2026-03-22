# vibecodedwithlove.com — Spec Review

A critical review of the MVP specification, organized by severity and area. Each finding includes why it matters and a suggested fix.

---

## Critical — Fix Before Building

### 1. RLS Policy on Suggestions Allows Project Owners to Edit Everything

The `suggestions` table has two `UPDATE` policies: one for suggestion authors and one for project owners. The project-owner policy grants access to **all columns**, meaning a project owner could silently rewrite someone else's suggestion body or title — not just update the status.

**Fix:** Scope the project-owner policy to only allow updating the `status` column. Supabase RLS supports `using` + `with check` but not column-level restrictions directly, so the cleanest approach is a server-side function:

```sql
create or replace function public.update_suggestion_status(
  suggestion_id uuid,
  new_status text
) returns void as $$
begin
  update public.suggestions
  set status = new_status, updated_at = now()
  where id = suggestion_id
  and project_id in (select id from public.projects where creator_id = auth.uid());
end;
$$ language plpgsql security definer;
```

Then remove the "Project owners can update suggestion status" policy entirely and have the frontend call this function via `supabase.rpc()`.

### 2. Cascade Deletes Destroy Other Users' Data

If a user deletes their account: `auth.users` → cascades to `profiles` → cascades to `projects` → cascades to `suggestions`. This means **all suggestions that other users left on those projects are permanently destroyed**. That's a poor UX for the suggestion authors and could lose valuable community content.

**Fix:** Change the `projects.creator_id` foreign key to `on delete set null` (and make `creator_id` nullable), or change the project's status to `archived` via a trigger instead of deleting. For suggestions, `author_id` should similarly handle deletion gracefully — perhaps showing "[deleted user]" rather than removing the suggestion.

### 3. No `updated_at` Trigger

All three tables have `updated_at timestamptz default now()` but **no trigger to automatically update it**. Without a trigger, `updated_at` will always equal `created_at` unless the app explicitly sets it on every update — which is error-prone and easy to forget.

**Fix:** Add a reusable trigger:

```sql
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.projects
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.suggestions
  for each row execute function public.update_updated_at();
```

### 4. Username Collision in Profile Auto-Creation

The `handle_new_user()` trigger falls back to `split_part(new.email, '@', 1)` if no GitHub username is available. Two users with `alice@gmail.com` and `alice@yahoo.com` would collide on the unique `username` constraint, causing the trigger to fail and **blocking signup entirely**.

**Fix:** Add collision handling in the trigger — append a random suffix if the username already exists:

```sql
-- Inside handle_new_user(), after computing the base username:
while exists (select 1 from public.profiles where username = v_username) loop
  v_username := v_username || '_' || substr(gen_random_uuid()::text, 1, 4);
end loop;
```

---

## High Priority — Important for a Solid MVP

### 5. No Project Edit Page

The file structure and page specs define a submit page (`/project/submit`) but no edit page. The RLS policies correctly allow creators to update their own projects, but there's no UI for it. Users will submit a project and immediately realize they can't fix a typo.

**Fix:** Add `/project/[slug]/edit/page.tsx` to the file structure. The form can reuse `ProjectSubmitForm.tsx` with an `initialData` prop.

### 6. No Profile Edit Page

Same issue — the profile page at `/profile/[username]` is view-only. There's no way for users to update their bio, display name, or website. The RLS policy allows it, but no UI exists.

**Fix:** Add `/profile/settings/page.tsx` (or `/profile/edit/page.tsx`) to the file structure.

### 7. No Suggestion Edit Flow

Suggestion authors can update their suggestions per RLS, but there's no edit UI. If someone spots a typo in their suggestion or wants to improve their "how to fix" section, they're stuck.

**Fix:** Add an edit mode or edit button to `SuggestionCard.tsx` that opens the form pre-filled.

### 8. Missing `middleware.ts` at the Correct Location

The spec places middleware at `src/lib/supabase/middleware.ts`, but Next.js requires the middleware file at the project root (`middleware.ts`) or `src/middleware.ts`. The file in `src/lib/supabase/` is presumably a helper, but the actual middleware file that Next.js invokes is missing from the file structure.

**Fix:** Add `src/middleware.ts` to the file structure. It should import from `src/lib/supabase/middleware.ts` and handle session refresh + protected route redirects.

### 9. Missing Error/Not-Found Pages

The App Router expects `error.tsx`, `not-found.tsx`, and optionally `loading.tsx` files. None are in the spec. Without a custom not-found page, hitting `/project/nonexistent-slug` will show Next.js's default 404, which looks broken and off-brand.

**Fix:** Add to file structure:
- `src/app/not-found.tsx` — custom 404
- `src/app/error.tsx` — custom error boundary
- `src/app/loading.tsx` — global loading state (optional)

### 10. Missing Index on `projects.status`

The browse page will filter by `status = 'active'` on virtually every query, but there's no index on the status column. Meanwhile, there *is* an index on `featured` (which is used far less frequently).

**Fix:** Add a partial index: `create index idx_projects_active on public.projects(status) where status = 'active';`

### 11. Next.js Version Pinning

The spec says "Next.js 14+" but Next.js 15 introduced breaking changes (async `params` and `searchParams` in dynamic routes, different caching defaults). Building with "14+" could mean someone initializes with 15 and hits unexpected issues.

**Fix:** Pin to `next@14.2.x` in the spec and `package.json`, or explicitly note that the spec is written for the 14.x App Router conventions and list what changes if using 15.

---

## Medium Priority — Worth Addressing

### 12. Username Validation Missing

The `username` column is `text unique not null` with no constraints on length, allowed characters, or reserved words. Someone could register with username `admin`, `api`, `browse`, `project`, or `about` — all of which would conflict with URL routes since profiles are at `/profile/[username]`.

**Fix:** Add a CHECK constraint: `check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$')` and maintain a reserved words list checked at the application layer (or in the trigger).

### 13. No Rate Limiting Strategy

No rate limiting is mentioned for any form submission. A single authenticated user could spam hundreds of projects or suggestions. Even without malice, a buggy client could double-submit.

**Fix:** Add a note about rate limiting strategy. Options include Vercel's built-in rate limiting (on Pro plan), Supabase's `pg_rate_limiter` extension, or application-level checks (e.g., "max 5 projects per hour per user" enforced by a DB function).

### 14. Markdown Rendering — Sanitization Note

The spec uses `react-markdown + remark-gfm` for user-submitted content (build stories, suggestion bodies). While `react-markdown` is safe by default (it doesn't render raw HTML), if `rehype-raw` or similar plugins are ever added, this becomes an XSS vector.

**Fix:** Add a note in the spec: "Do NOT add `rehype-raw` or any plugin that allows raw HTML in user-submitted markdown. If HTML rendering is needed later, use `rehype-sanitize` with a strict schema."

### 15. No `.gitignore` in File Structure

The file structure doesn't include `.gitignore`. This is easy to forget and could lead to `.env.local` (with secrets) being committed.

**Fix:** Add `.gitignore` to the root of the file structure. Exclude at minimum: `.env*.local`, `node_modules/`, `.next/`, `out/`.

### 16. Service Role Key in `.env.local.example`

The example env file includes `SUPABASE_SERVICE_ROLE_KEY`. This key has admin-level access to your database and bypasses RLS. While `.example` files shouldn't contain real values, having it in `.env.local` (which runs client-side in dev) is risky.

**Fix:** Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local.example`. Add a comment: `# Service role key: set in Vercel dashboard only, never in local env files unless needed for specific server-side scripts.`

---

## Low Priority — Nice to Have for MVP

### 17. No Testing Strategy

No test files or testing framework mentioned. Even for an MVP, a few integration tests on the critical paths (auth callback, project submission, suggestion submission) would catch regressions fast, especially with an AI-assisted codebase.

**Suggestion:** Add `vitest` + `@testing-library/react` to the stack. Even 5-10 tests covering the happy paths would be valuable.

### 18. No OG Image Library Specified

The spec mentions dynamic OG image generation (`/api/og/route.tsx`) but doesn't name the library. Next.js has `next/og` (built on `@vercel/og` / Satori) which is the standard choice.

**Fix:** Add `next/og` to the tech stack table or note it in the file structure comment.

### 19. Suggestion Soft Delete Missing

Projects have `status: 'active' | 'archived'` but suggestions have no equivalent soft-delete mechanism. If a suggestion violates community guidelines, the only option is a hard DELETE. This makes moderation unauditable.

**Suggestion:** Add a `hidden` boolean or expand the status enum to include `'removed'` for suggestions.

### 20. Static Resources Page Maintenance

The resources page content is fantastic but it's all hardcoded. If a tool URL changes or a new tool launches, you need a code deploy to update it. For MVP this is fine, but note this as a candidate for moving to a CMS or MDX files in a future iteration.

---

## Spec Strengths

This spec does a lot of things right:

- **The "how to fix" requirement on suggestions** is a brilliant product decision. It immediately filters out drive-by negativity and ensures every suggestion is actionable.
- **Self-listing the platform as the first project** is great dogfooding and demonstrates the transparency you're advocating for.
- **The resources page** is genuinely useful standalone content that could drive organic SEO traffic before the platform has many projects.
- **RLS from the start** is the right call. Bolting on row-level security after the fact is painful.
- **Clear MVP scope boundaries** — the "explicitly out of scope" section prevents scope creep, the #1 killer of side projects.
- **The community guidelines** strike the right tone — firm but not preachy.

---

## Summary

| Severity | Count | Action |
|----------|-------|--------|
| Critical | 4 | Fix in the schema/spec before writing code |
| High | 7 | Address during initial build |
| Medium | 5 | Address before launch |
| Low | 4 | Nice to have, can come later |

The spec is solid overall — the product vision is clear, the tech choices are sensible, and the scope is well-contained. The critical issues are all in the database layer and are straightforward to fix before you start building.
