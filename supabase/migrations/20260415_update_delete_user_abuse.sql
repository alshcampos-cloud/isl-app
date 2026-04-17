-- ============================================================
-- MIGRATION: Update delete_user() to preserve abuse signals
-- Adds abuse_signals soft-delete before existing DELETE cascade
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
  -- Soft-delete abuse signals (preserve fingerprint/email hash
  -- for abuse detection, but remove user_id link)
  -- ============================================================
  BEGIN
    UPDATE public.abuse_signals SET deleted_at = now(), user_id = NULL WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

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
