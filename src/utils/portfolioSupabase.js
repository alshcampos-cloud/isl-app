// Portfolio — Supabase Data Access Layer
// ============================================================
// Cloud sync for portfolio projects.
// Pattern: nursingSupabase.js (try Supabase → catch → fall back to local).
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { supabase } from '../lib/supabase';

// ============================================================
// FETCH ALL PROJECTS
// ============================================================

/**
 * Fetch all portfolio projects for a user from Supabase.
 * Returns { data: [...], fromSupabase: true } or { data: null, fromSupabase: false }.
 */
export async function fetchPortfolioFromCloud(userId) {
  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('⚠️ fetchPortfolioFromCloud query failed:', error.message);
      return { data: null, fromSupabase: false };
    }

    // Map Supabase rows back to the localStorage shape
    const projects = (data || []).map(row => ({
      id: row.project_id,
      title: row.title || '',
      role: row.role || '',
      timeframe: row.timeframe || '',
      rawContent: row.raw_content || '',
      aiSummary: row.ai_summary || '',
      keySkills: row.key_skills || [],
      interviewAngles: row.interview_angles || [],
      starStory: row.star_story || '',
      questionsThisAnswers: row.questions_this_answers || [],
      rewrittenBullets: row.rewritten_bullets || [],
      walkThroughNotes: row.walk_through_notes || '',
      isAnalyzed: row.is_analyzed || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { data: projects, fromSupabase: true };
  } catch (err) {
    console.warn('⚠️ fetchPortfolioFromCloud exception:', err.message);
    return { data: null, fromSupabase: false };
  }
}

// ============================================================
// SYNC (UPSERT) ALL PROJECTS
// ============================================================

/**
 * Upsert all portfolio projects to Supabase.
 * Uses UNIQUE(user_id, project_id) constraint for upsert.
 * Returns { success: true, synced: count } or { success: false, error }.
 */
export async function syncPortfolioToCloud(userId, projects) {
  try {
    if (!projects || projects.length === 0) {
      return { success: true, synced: 0 };
    }

    const rows = projects.map(p => ({
      user_id: userId,
      project_id: p.id,
      title: p.title || '',
      role: p.role || '',
      timeframe: p.timeframe || '',
      raw_content: p.rawContent || '',
      ai_summary: p.aiSummary || '',
      key_skills: p.keySkills || [],
      interview_angles: p.interviewAngles || [],
      star_story: p.starStory || '',
      questions_this_answers: p.questionsThisAnswers || [],
      rewritten_bullets: p.rewrittenBullets || [],
      walk_through_notes: p.walkThroughNotes || '',
      is_analyzed: p.isAnalyzed || false,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('portfolio_projects')
      .upsert(rows, { onConflict: 'user_id,project_id' });

    if (error) {
      console.warn('⚠️ syncPortfolioToCloud upsert failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, synced: rows.length };
  } catch (err) {
    console.warn('⚠️ syncPortfolioToCloud exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// UPSERT SINGLE PROJECT
// ============================================================

/**
 * Upsert a single portfolio project to Supabase.
 * Used after save/analyze to sync one project without re-uploading all.
 */
export async function upsertPortfolioProject(userId, project) {
  try {
    const row = {
      user_id: userId,
      project_id: project.id,
      title: project.title || '',
      role: project.role || '',
      timeframe: project.timeframe || '',
      raw_content: project.rawContent || '',
      ai_summary: project.aiSummary || '',
      key_skills: project.keySkills || [],
      interview_angles: project.interviewAngles || [],
      star_story: project.starStory || '',
      questions_this_answers: project.questionsThisAnswers || [],
      rewritten_bullets: project.rewrittenBullets || [],
      walk_through_notes: project.walkThroughNotes || '',
      is_analyzed: project.isAnalyzed || false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('portfolio_projects')
      .upsert(row, { onConflict: 'user_id,project_id' });

    if (error) {
      console.warn('⚠️ upsertPortfolioProject failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('⚠️ upsertPortfolioProject exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// DELETE SINGLE PROJECT
// ============================================================

/**
 * Delete a single portfolio project from Supabase.
 */
export async function deletePortfolioProject(userId, projectId) {
  try {
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) {
      console.warn('⚠️ deletePortfolioProject failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('⚠️ deletePortfolioProject exception:', err.message);
    return { success: false, error: err.message };
  }
}
