-- ============================================================
-- vibecodedwithlove.com — Initial Schema (v2)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ----------------------------------------
-- Shared utility: auto-update updated_at
-- ----------------------------------------
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------
-- PROFILES
-- ----------------------------------------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null
    check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  display_name text,
  bio text,
  avatar_url text,
  github_url text,
  website_url text,
  role text default 'member' check (role in ('member', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

-- ----------------------------------------
-- PROJECTS
-- ----------------------------------------
create table public.projects (
  id uuid default gen_random_uuid() primary key,
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

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert with check (auth.uid() = creator_id);

create policy "Creators can update their own projects"
  on public.projects for update using (auth.uid() = creator_id);

create policy "Creators can delete their own projects"
  on public.projects for delete using (auth.uid() = creator_id);

create trigger set_updated_at before update on public.projects
  for each row execute function public.update_updated_at();

-- ----------------------------------------
-- SUGGESTIONS
-- ----------------------------------------
create table public.suggestions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('security', 'performance', 'ux', 'bug', 'general')),
  title text not null,
  body text not null,
  how_to_fix text not null,
  status text default 'open' check (status in ('open', 'acknowledged', 'resolved', 'removed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.suggestions enable row level security;

create policy "Suggestions are viewable by everyone"
  on public.suggestions for select using (true);

create policy "Authenticated users can create suggestions"
  on public.suggestions for insert with check (auth.uid() = author_id);

create policy "Authors can update their own suggestions"
  on public.suggestions for update using (auth.uid() = author_id);

-- NOTE: No broad update policy for project owners.
-- They use the RPC function below to update status only.

create trigger set_updated_at before update on public.suggestions
  for each row execute function public.update_updated_at();

-- ----------------------------------------
-- RPC: Project owners update suggestion status
-- ----------------------------------------
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

-- ----------------------------------------
-- TRIGGER: Auto-create profile on signup
-- ----------------------------------------
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

-- ----------------------------------------
-- INDEXES
-- ----------------------------------------
create index idx_projects_creator on public.projects(creator_id);
create index idx_projects_category on public.projects(category);
create index idx_projects_featured on public.projects(featured) where featured = true;
create index idx_projects_slug on public.projects(slug);
create index idx_projects_active on public.projects(status) where status = 'active';
create index idx_suggestions_project on public.suggestions(project_id);
create index idx_suggestions_author on public.suggestions(author_id);
create index idx_suggestions_type on public.suggestions(type);
