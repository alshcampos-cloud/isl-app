// NursingTrack — useNursingQuestions Hook
// ============================================================
// Try Supabase → fall back to static nursingQuestions.js.
// This means the app works BOTH with and without the migration applied.
//
// Returns { questions, categories, fromSupabase, loading }
//
// Battle Scars enforced:
//   #3  — Supabase fetch with error handling + defensive fallback
//   #11 — Read actual data, don't guess
//
// Console output:
//   ✅ success → console.log('[NursingTrack] Loaded N questions from Supabase')
//   ⚠️ fallback → console.warn('[NursingTrack] Supabase fetch failed, using static questions:', error)
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { useState, useEffect } from 'react';
import { fetchQuestionsFromSupabase } from './nursingSupabase';
import { getQuestionsForSpecialty, getCategories } from './nursingQuestions';

/**
 * Hook: Load nursing questions for a specialty.
 * Tries Supabase first, falls back to static file.
 *
 * @param {string} specialtyId - e.g. 'ed', 'icu', 'general'
 * @returns {{ questions: Array, categories: string[], fromSupabase: boolean, loading: boolean }}
 */
export default function useNursingQuestions(specialtyId) {
  const [questions, setQuestions] = useState([]);
  const [fromSupabase, setFromSupabase] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      setLoading(true);

      try {
        // Try Supabase first
        const result = await fetchQuestionsFromSupabase(specialtyId);

        if (cancelled) return;

        if (result.fromSupabase && result.data && result.data.length > 0) {
          setQuestions(result.data);
          setFromSupabase(true);
          console.log(`[NursingTrack] Loaded ${result.data.length} questions from Supabase for specialty: ${specialtyId}`);
        } else {
          // Fall back to static file
          const staticQuestions = getQuestionsForSpecialty(specialtyId);
          setQuestions(staticQuestions);
          setFromSupabase(false);
          console.warn(
            '[NursingTrack] Supabase fetch failed, using static questions:',
            result.data === null ? 'query failed or table missing' : 'no questions returned'
          );
        }
      } catch (err) {
        if (cancelled) return;

        // Any unexpected error — fall back to static
        const staticQuestions = getQuestionsForSpecialty(specialtyId);
        setQuestions(staticQuestions);
        setFromSupabase(false);
        console.warn('[NursingTrack] Supabase fetch failed, using static questions:', err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => { cancelled = true; };
  }, [specialtyId]);

  // Compute categories from whatever question source we got
  const categories = getCategories(questions);

  return { questions, categories, fromSupabase, loading };
}
