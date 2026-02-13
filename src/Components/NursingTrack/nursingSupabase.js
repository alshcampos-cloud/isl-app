// NursingTrack — Supabase Data Access Layer
// ============================================================
// Phase 6: All Supabase reads/writes for the nursing track.
//
// DESIGN: Try Supabase → catch → fall back to local data.
// This means the app works BOTH with and without the migration applied.
//
// Battle Scars enforced:
//   #8  — Session INSERT must succeed before counting as "charged"
//   #14 — All operations are additive; no DELETEs
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { supabase } from '../../lib/supabase';

// ============================================================
// SESSION PERSISTENCE
// ============================================================

/**
 * Insert a practice session record into Supabase.
 * Returns { success: true } or { success: false, error }.
 * Caller should NOT block on failure — session was already completed.
 */
export async function insertPracticeSession(userId, specialtyId, sessionRecord) {
  try {
    const row = {
      user_id: userId,
      specialty_id: specialtyId,
      mode: sessionRecord.mode,
      question_code: sessionRecord.questionId || null,
      question_text: sessionRecord.question || null,
      category: sessionRecord.category || null,
      response_framework: sessionRecord.responseFramework || null,
      score: sessionRecord.score ?? null,
      sbar_scores: sessionRecord.sbarScores || null,
      message_count: sessionRecord.messageCount || null,
      topics_discussed: sessionRecord.topicsDiscussed || null,
      // Phase 9: Offer Coach negotiation scores + scenario metadata
      extra_scores: sessionRecord.extraScores || null,
    };

    const { error } = await supabase
      .from('nursing_practice_sessions')
      .insert(row);

    if (error) {
      console.warn('⚠️ nursing_practice_sessions INSERT failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('⚠️ insertPracticeSession exception:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all session records for a user, ordered by most recent first.
 * Returns { data: [...], fromSupabase: true } on success,
 * or { data: null, fromSupabase: false } on failure.
 */
export async function fetchSessionHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('nursing_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('⚠️ fetchSessionHistory query failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    // Map Supabase rows back to the in-memory session record shape
    // that Command Center and aggregation helpers expect
    const sessions = (data || []).map(row => ({
      id: row.id,
      mode: row.mode,
      questionId: row.question_code,
      question: row.question_text,
      category: row.category,
      responseFramework: row.response_framework,
      score: row.score,
      sbarScores: row.sbar_scores,
      messageCount: row.message_count,
      topicsDiscussed: row.topics_discussed,
      extraScores: row.extra_scores,
      timestamp: row.created_at,
    }));

    return { data: sessions, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchSessionHistory exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}


// ============================================================
// FLASHCARD PROGRESS
// ============================================================

/**
 * Fetch all flashcard progress for a user.
 * Returns { data: { [questionCode]: 'got-it' | 'need-practice' }, fromSupabase: true }
 * or { data: null, fromSupabase: false } on failure.
 */
export async function fetchFlashcardProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('nursing_flashcard_progress')
      .select('question_code, status')
      .eq('user_id', userId);

    if (error) {
      console.warn('⚠️ fetchFlashcardProgress query failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    // Convert to { [questionCode]: status } map
    const progressMap = {};
    (data || []).forEach(row => {
      progressMap[row.question_code] = row.status;
    });

    return { data: progressMap, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchFlashcardProgress exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}

/**
 * Upsert a single flashcard progress entry.
 * Uses Supabase's upsert with the UNIQUE(user_id, question_code) constraint.
 */
export async function upsertFlashcardProgress(userId, questionCode, status) {
  try {
    const { error } = await supabase
      .from('nursing_flashcard_progress')
      .upsert(
        {
          user_id: userId,
          question_code: questionCode,
          status: status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,question_code' }
      );

    if (error) {
      console.warn('⚠️ upsertFlashcardProgress failed:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.warn('⚠️ upsertFlashcardProgress exception:', err.message);
    return { success: false };
  }
}


// ============================================================
// USER PROFILE (specialty preference)
// ============================================================

/**
 * Fetch the user's nursing profile (selected specialty, etc).
 * Returns { data: row, fromSupabase: true } or fallback.
 */
export async function fetchNursingProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('nursing_user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('⚠️ fetchNursingProfile failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    return { data, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchNursingProfile exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}

/**
 * Upsert the user's nursing profile.
 */
export async function upsertNursingProfile(userId, profileData) {
  try {
    const { error } = await supabase
      .from('nursing_user_profiles')
      .upsert(
        {
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('⚠️ upsertNursingProfile failed:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.warn('⚠️ upsertNursingProfile exception:', err.message);
    return { success: false };
  }
}


// ============================================================
// QUESTIONS (try Supabase, fallback to local nursingQuestions.js)
// ============================================================

/**
 * Fetch questions from Supabase for a given specialty.
 * Returns { data: [...], fromSupabase: true } or { data: null, fromSupabase: false }.
 *
 * The caller should fall back to getQuestionsForSpecialty() from nursingQuestions.js
 * when fromSupabase is false.
 */
// ============================================================
// SAVED ANSWERS (user's best response per question)
// ============================================================

/**
 * Fetch all saved answers for a user.
 * Returns { data: { [questionCode]: answerText }, fromSupabase: true }
 * or { data: null, fromSupabase: false } on failure.
 */
export async function fetchSavedAnswers(userId) {
  try {
    const { data, error } = await supabase
      .from('nursing_saved_answers')
      .select('question_code, answer_text')
      .eq('user_id', userId);

    if (error) {
      console.warn('⚠️ fetchSavedAnswers query failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    const answersMap = {};
    (data || []).forEach(row => {
      answersMap[row.question_code] = row.answer_text;
    });

    return { data: answersMap, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchSavedAnswers exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}

/**
 * Upsert a saved answer for a question.
 * Uses UNIQUE(user_id, question_code) constraint.
 */
export async function upsertSavedAnswer(userId, questionCode, answerText) {
  try {
    const { error } = await supabase
      .from('nursing_saved_answers')
      .upsert(
        {
          user_id: userId,
          question_code: questionCode,
          answer_text: answerText,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,question_code' }
      );

    if (error) {
      console.warn('⚠️ upsertSavedAnswer failed:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.warn('⚠️ upsertSavedAnswer exception:', err.message);
    return { success: false };
  }
}


// ============================================================
// QUESTIONS (try Supabase, fallback to local nursingQuestions.js)
// ============================================================

export async function fetchQuestionsFromSupabase(specialtyId) {
  try {
    const { data, error } = await supabase
      .from('nursing_questions')
      .select('*')
      .or(`specialty_id.eq.general,specialty_id.is.null${specialtyId !== 'general' ? `,specialty_id.eq.${specialtyId}` : ''}`)
      .eq('is_active', true)
      .order('question_code', { ascending: true });

    if (error) {
      console.warn('⚠️ fetchQuestionsFromSupabase failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    if (!data || data.length === 0) {
      // Table exists but no data — use local fallback
      return { data: null, fromSupabase: false };
    }

    // Map Supabase rows to the same shape as nursingQuestions.js objects
    const questions = data.map(row => ({
      id: row.question_code,
      question: row.question_text,
      category: row.category,
      priority: row.priority,
      specialty: row.specialty_id || 'general',
      difficulty: row.difficulty,
      responseFramework: row.response_framework,
      clinicalFramework: row.clinical_framework_id,
      keywords: row.keywords || [],
      bullets: row.bullets || [],
      followUps: row.follow_ups || [],
      // Metadata
      author: row.author,
      reviewer: row.reviewer,
      clinicalFrameworkSource: row.clinical_framework_source,
      reviewDate: row.review_date,
      contentStatus: row.content_status,
    }));

    return { data: questions, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchQuestionsFromSupabase exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}
