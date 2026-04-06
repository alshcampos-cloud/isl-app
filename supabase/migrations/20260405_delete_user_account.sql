-- ============================================================
-- MIGRATION: Account Deletion Function
-- Apple Guideline 5.1.1(v): Users must be able to delete their account
-- ============================================================
--
-- PURPOSE: Allow authenticated users to fully delete their account
-- and all associated data via: supabase.rpc('delete_user')
--
-- HOW IT WORKS:
--   1. Verifies the caller is authenticated via auth.uid()
--   2. Deletes from ALL user data tables (explicit, not relying on CASCADE)
--   3. Deletes the auth.users row itself (requires SECURITY DEFINER)
--
-- SECURITY: Runs as SECURITY DEFINER (postgres role) so it can
-- delete from auth.users. The function is safe because it ONLY
-- deletes the row matching auth.uid() — users cannot delete others.
--
-- TABLES COVERED (from codebase audit):
--   - practice_sessions        (general practice history)
--   - practice_history          (general practice log)
--   - questions                 (user's custom questions)
--   - usage_tracking            (credit/usage counters)
--   - user_streaks              (streak data)
--   - portfolio_projects        (portfolio matching)
--   - onboarding_events         (onboarding tracker)
--   - beta_testers              (beta tester flags)
--   - nursing_practice_sessions (nursing session history)
--   - nursing_saved_answers     (saved nursing answers)
--   - nursing_flashcard_progress(flashcard progress)
--   - nursing_user_profiles     (nursing-specific profile)
--   - user_profiles             (main profile — delete last, FK target)
--   - auth.users                (the auth account itself)
--
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the authenticated user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ============================================================
  -- Delete from all user data tables
  -- Using individual exception blocks so missing tables don't
  -- block deletion. Tables may not exist in all environments.
  -- ============================================================

  -- General track tables
  BEGIN
    DELETE FROM public.practice_sessions WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.practice_history WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.questions WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.usage_tracking WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.user_streaks WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.portfolio_projects WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.onboarding_events WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.beta_testers WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- Nursing track tables
  BEGIN
    DELETE FROM public.nursing_practice_sessions WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.nursing_saved_answers WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.nursing_flashcard_progress WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.nursing_user_profiles WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- Main profile table (delete after dependent tables)
  BEGIN
    DELETE FROM public.user_profiles WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- Legacy profiles table (referenced in SupabaseTest.jsx, may not exist)
  BEGIN
    DELETE FROM public.profiles WHERE id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- ============================================================
  -- Delete the auth account itself
  -- This is the actual account deletion Apple requires.
  -- SECURITY DEFINER allows this function (owned by postgres)
  -- to delete from auth.users.
  -- ============================================================
  DELETE FROM auth.users WHERE id = current_user_id;

END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- ============================================================
-- VERIFICATION: After running this migration, test with:
--
--   SELECT proname, prosecdef
--   FROM pg_proc
--   WHERE proname = 'delete_user';
--
-- Expected: 1 row, prosecdef = true (SECURITY DEFINER)
-- ============================================================

-- ============================================================
-- ROLLBACK (if needed):
--   DROP FUNCTION IF EXISTS public.delete_user();
-- ============================================================
