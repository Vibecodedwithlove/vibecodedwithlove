-- Security hardening migration
-- Addresses: server-side input validation (Item 3) and RPC error handling (Item 4)

-- ============================================
-- 1. Add CHECK constraints for field lengths
-- ============================================
ALTER TABLE public.projects
  ADD CONSTRAINT chk_title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT chk_description_length CHECK (length(description) <= 2000),
  ADD CONSTRAINT chk_build_story_length CHECK (length(build_story) <= 50000),
  ADD CONSTRAINT chk_what_it_does_length CHECK (length(what_it_does) <= 5000),
  ADD CONSTRAINT chk_user_flow_length CHECK (length(user_flow) <= 5000),
  ADD CONSTRAINT chk_main_components_length CHECK (length(main_components) <= 5000),
  ADD CONSTRAINT chk_external_deps_length CHECK (length(external_dependencies) <= 5000),
  ADD CONSTRAINT chk_least_confident_length CHECK (length(least_confident) <= 5000),
  ADD CONSTRAINT chk_code_map_length CHECK (length(code_map) <= 100000);

ALTER TABLE public.suggestions
  ADD CONSTRAINT chk_suggestion_title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT chk_suggestion_body_length CHECK (length(body) <= 10000),
  ADD CONSTRAINT chk_suggestion_how_to_fix_length CHECK (length(how_to_fix) <= 10000);

-- ============================================
-- 2. Fix update_suggestion_status to raise on no match
-- ============================================
CREATE OR REPLACE FUNCTION update_suggestion_status(suggestion_id UUID, new_status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.suggestions
  SET status = new_status, updated_at = now()
  WHERE id = suggestion_id
    AND project_id IN (
      SELECT id FROM public.projects WHERE creator_id = auth.uid()
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized or suggestion not found';
  END IF;
END;
$$;
