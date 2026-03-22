-- ============================================================
-- vibecodedwithlove.com — Add Project Anatomy & Code Map fields
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

-- Project Anatomy fields (structured creator explanations)
alter table public.projects add column what_it_does text not null default '';
alter table public.projects add column user_flow text not null default '';
alter table public.projects add column main_components text not null default '';
alter table public.projects add column external_dependencies text;
alter table public.projects add column least_confident text;

-- Code Map (AI-generated codebase summary, optional)
alter table public.projects add column code_map text;
