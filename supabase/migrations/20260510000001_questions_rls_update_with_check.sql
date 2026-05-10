-- Jacob report item #11 — backend hardening
--
-- Problem: existing UPDATE policy on public.questions has USING but missing
-- WITH CHECK. Without WITH CHECK, an authenticated user can update one of
-- their own rows AND change the user_id column to a different user — silently
-- transferring ownership. The USING clause filters which rows can be updated;
-- WITH CHECK validates the values being written.
--
-- Diagnosis (run 2026-05-10 via supabase db query --linked):
--   SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr,
--          pg_get_expr(polwithcheck, polrelid) AS check_expr
--   FROM pg_policy WHERE polrelid = 'public.questions'::regclass;
--
--   Result for "Users can update own questions" (polcmd='w'):
--     using_expr: (auth.uid() = user_id)   ✓
--     check_expr: null                     ⚠️ missing
--
-- Fix: ALTER POLICY (atomic; no DROP/CREATE window where policy is missing).
-- Plan target was CREATE POLICY (assuming Path A — RLS missing entirely).
-- Since policy IS present, ALTER is the correct primitive to reach the same
-- gold-standard target state without the intermediate "policy missing" gap.
--
-- Per JACOB_FIXES_IMPLEMENTATION_PLAN_2026-05-08.md "Item #11 (backend angle)".
-- Wave 3 HIGH — RLS migration. Lucas-territory per framework. Deployed via
-- explicit `supabase db push` after Lucas review.

ALTER POLICY "Users can update own questions" ON public.questions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verification post-deploy (re-run diagnostic query):
--   SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr,
--          pg_get_expr(polwithcheck, polrelid) AS check_expr
--   FROM pg_policy WHERE polrelid = 'public.questions'::regclass
--     AND polname = 'Users can update own questions';
--
-- Expected:
--   using_expr: (auth.uid() = user_id)
--   check_expr: (auth.uid() = user_id)   ← previously null

NOTIFY pgrst, 'reload schema';
