# Bug Report & Fix Plan — vibecodedwithlove.com

**Date:** March 23, 2026
**Audited by:** Claude (visual browser audit + full code review)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 4 |
| Medium | 5 |
| Low | 3 |
| **Total** | **15** |

---

## Critical Bugs

### BUG-01: Sign-out is completely broken
- **File:** `src/app/auth/signout/route.ts` + `src/components/layout/Navbar.tsx`
- **Issue:** The sign-out route only handles `POST` requests (`export async function POST()`), but the Navbar links to `/auth/signout` with a plain `<a href>` tag, which sends a `GET` request. Result: clicking "Sign out" returns a 405 Method Not Allowed error.
- **Fix:** Either change the route to handle GET requests, or change the Navbar to use a form with `method="POST"` / a client-side fetch call.

### BUG-02: Homepage shows "No projects found" instead of mock data
- **File:** `src/app/page.tsx` (line 258)
- **Issue:** The fallback logic is `return (data as ProjectWithCreator[]) || MOCK_PROJECTS`. When Supabase returns an empty array `[]` (no projects in DB yet), `[] || MOCK_PROJECTS` evaluates to `[]` because an empty array is truthy in JavaScript. Mock data never displays.
- **Fix:** Change to `return (data && data.length > 0) ? (data as ProjectWithCreator[]) : MOCK_PROJECTS;`

### BUG-03: Middleware crashes on missing environment variables
- **File:** `src/lib/supabase/middleware.ts` (lines 17-18)
- **Issue:** Uses TypeScript non-null assertions (`process.env.NEXT_PUBLIC_SUPABASE_URL!`) without any validation. If env vars are missing, the entire middleware crashes, breaking session refresh across every page.
- **Fix:** Add fallback/guard logic like the server and client Supabase wrappers already have.

---

## High Severity Bugs

### BUG-04: ProjectCard displays random fake suggestion counts
- **File:** `src/components/projects/ProjectCard.tsx` (line 61)
- **Issue:** `Math.floor(Math.random() * 15)` generates a random number on every render. This shows misleading engagement metrics and the number changes on every re-render/navigation.
- **Fix:** Either query actual suggestion count from Supabase (add a count to the project query), or remove the suggestion count display until real data is available.

### BUG-05: No UI refresh after suggestion status change
- **File:** `src/components/suggestions/SuggestionCard.tsx` (lines 47-60)
- **Issue:** `handleStatusChange` calls the RPC to update the status in the database but never updates local React state. The dropdown visually reverts to the old value after selection because the component doesn't re-render with the new status.
- **Fix:** Add local state for status and update it on successful RPC call, or use `router.refresh()` to trigger a server-side re-fetch.

### BUG-06: No UI refresh after suggestion edit save
- **File:** `src/components/suggestions/SuggestionCard.tsx` (lines 62-86)
- **Issue:** `handleSaveEdit` updates the database and closes the edit form, but the displayed suggestion content still shows the old data from props. The component doesn't re-render with updated content.
- **Fix:** Same approach — use `router.refresh()` after successful save, or lift state up.

### BUG-07: Suggestion insert RLS policy doesn't enforce author_id
- **File:** `supabase/migrations/001_initial_schema.sql` (lines 112-113)
- **Issue:** The RLS insert policy for suggestions only checks `auth.uid() IS NOT NULL`, but doesn't enforce that `author_id = auth.uid()`. A malicious user could craft an API request to submit suggestions with any other user's ID as the author.
- **Fix:** Change policy to: `WITH CHECK (auth.uid() = author_id)`

---

## Medium Severity Bugs

### BUG-08: Login page doesn't redirect back after OAuth
- **File:** `src/app/auth/login/page.tsx`
- **Issue:** After successful GitHub OAuth, the callback redirects to `/` (homepage). If a user was trying to access `/project/submit` and got redirected to login, they lose their original destination.
- **Fix:** Store the intended redirect URL in a query param (`/auth/login?redirect=/project/submit`) and use it in the callback.

### BUG-09: Profile page suggestion query uses fragile type cast
- **File:** `src/app/profile/[username]/page.tsx`
- **Issue:** Uses `(suggestion.projects as unknown as { slug: string; title: string })` type cast for Supabase join results. This is fragile and will break silently if the query shape changes.
- **Fix:** Define a proper type for the join result and validate the data.

### BUG-10: Client-side Supabase client returns placeholder on missing env
- **File:** `src/lib/supabase/client.ts` (lines 8-22)
- **Issue:** Falls back to a placeholder Supabase client when env vars are missing. This was added for build-time safety, but at runtime it means all client-side database operations silently fail against a non-existent endpoint instead of showing a clear error.
- **Fix:** Keep the placeholder for build, but add a runtime check that shows an error message to the user.

### BUG-11: Middleware uses deprecated `getSession()` instead of `getUser()`
- **File:** `src/lib/supabase/middleware.ts` (line 42)
- **Issue:** Supabase docs recommend `getUser()` over `getSession()` for server-side auth verification. `getSession()` reads from the cookie without validating the JWT with the Supabase server, making it potentially insecure.
- **Fix:** Change `await supabase.auth.getSession()` to `await supabase.auth.getUser()`.

### BUG-12: next.config.mjs missing remote image patterns
- **File:** `next.config.mjs`
- **Issue:** GitHub avatar URLs (`avatars.githubusercontent.com`) are not configured as allowed remote image patterns. The `next/image` component in ProfileHeader and other places that use `<Image>` will fail to load GitHub avatars.
- **Fix:** Add `images: { remotePatterns: [{ hostname: 'avatars.githubusercontent.com' }] }` to next.config.mjs.

---

## Low Severity Bugs

### BUG-13: Theme toggle doesn't initialize correctly
- **File:** `src/components/layout/Navbar.tsx` (line 17)
- **Issue:** `isDark` state initializes as `false` regardless of the actual theme. The inline script in `layout.tsx` correctly adds the `dark` class on page load, but the toggle button icon shows the wrong state (sun/moon) until the user clicks it.
- **Fix:** Initialize `isDark` from `localStorage` or check `document.documentElement.classList` in a `useEffect`.

### BUG-14: Unused imports in multiple files
- **Files:** `src/app/page.tsx` (cn import used inconsistently), various components
- **Issue:** Minor code cleanliness. Some imports are used, some are redundant after refactors.
- **Fix:** Run ESLint with `--fix` to clean up.

### BUG-15: Footer links incomplete
- **File:** `src/components/layout/Footer.tsx`
- **Issue:** Footer Quick Links section only has "Browse" and "About" — missing Submit, Resources, and Login links.
- **Fix:** Add the missing navigation links to match the Navbar.

---

## Fix Plan

### Phase 1: Critical Fixes (Do First)
1. **BUG-01** — Fix sign-out route (change to GET handler or use form POST)
2. **BUG-02** — Fix homepage mock data fallback (check `data.length`)
3. **BUG-03** — Add env var guards to middleware

### Phase 2: High Priority
4. **BUG-04** — Remove fake suggestion counts (show real count or remove)
5. **BUG-05 + BUG-06** — Add `router.refresh()` after suggestion mutations
6. **BUG-07** — Fix RLS policy to enforce `author_id = auth.uid()`

### Phase 3: Medium Priority
7. **BUG-11** — Switch middleware to `getUser()`
8. **BUG-12** — Add remote image patterns to next.config
9. **BUG-08** — Add redirect-after-login support
10. **BUG-10** — Better runtime error for missing Supabase config

### Phase 4: Low Priority / Polish
11. **BUG-13** — Fix theme toggle initial state
12. **BUG-15** — Complete footer links
13. **BUG-14** — ESLint cleanup

---

## Estimated Effort

| Phase | Bugs | Est. Time |
|-------|------|-----------|
| Phase 1 (Critical) | 3 | ~30 min |
| Phase 2 (High) | 3 | ~45 min |
| Phase 3 (Medium) | 4 | ~1 hour |
| Phase 4 (Low) | 3 | ~20 min |
| **Total** | **13** | **~2.5 hours** |
