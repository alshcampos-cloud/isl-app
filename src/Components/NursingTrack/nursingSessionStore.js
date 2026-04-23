// NursingTrack — In-Memory Session Store
// Lightweight helpers for tracking and aggregating session data.
// Data lives in NursingTrackApp state, passed as props to Command Center.
// Phase 6 will persist this to Supabase — this architecture is ready for that.
//
// Session record shape:
// {
//   id: string,
//   mode: 'mock-interview' | 'practice' | 'sbar-drill' | 'ai-coach' | 'offer-coach' | 'confidence-builder',
//   questionId: string,
//   question: string,
//   category: string,
//   responseFramework: 'sbar' | 'star' | null,
//   score: number | null,          // 1-5 for mock/practice
//   sbarScores: { situation, background, assessment, recommendation } | null,  // 1-10 each, sbar-drill only
//   extraScores: object | null,    // negotiation 5-dimension scores + scenario metadata (offer-coach)
//   userAnswer: string | null,     // user's submitted answer text (persisted for review)
//   aiFeedback: string | null,     // AI coaching feedback text (persisted for review)
//   timestamp: string (ISO),
// }
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

// ============================================================
// SESSION CREATION
// ============================================================

/** Create a session record from Mock Interview results */
export function createMockInterviewSession(result) {
  return {
    id: `mi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mode: 'mock-interview',
    questionId: result.questionId,
    question: result.question,
    category: result.category || '',
    responseFramework: result.responseFramework || 'star',
    score: result.score ?? null,
    sbarScores: null,
    userAnswer: result.userAnswer || null,
    aiFeedback: result.aiFeedback || null,
    timestamp: new Date().toISOString(),
  };
}

/** Create a session record from Practice Mode results */
export function createPracticeSession(questionId, question, category, responseFramework, score, userAnswer, aiFeedback) {
  return {
    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mode: 'practice',
    questionId,
    question,
    category,
    responseFramework,
    score: score ?? null,
    sbarScores: null,
    userAnswer: userAnswer || null,
    aiFeedback: aiFeedback || null,
    timestamp: new Date().toISOString(),
  };
}

/** Create a session record from SBAR Drill results */
export function createSBARDrillSession(questionId, question, category, sbarScores, userAnswer, aiFeedback) {
  return {
    id: `sd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mode: 'sbar-drill',
    questionId,
    question,
    category,
    responseFramework: 'sbar',
    score: null, // SBAR drill uses per-component scores instead
    sbarScores: sbarScores ?? null,
    userAnswer: userAnswer || null,
    aiFeedback: aiFeedback || null,
    timestamp: new Date().toISOString(),
  };
}

/** Create a session record from Offer Coach results */
export function createOfferCoachSession(scenarioId, scenarioTitle, scenarioCategory, negotiationScores) {
  return {
    id: `oc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mode: 'offer-coach',
    questionId: scenarioId,
    question: scenarioTitle,
    category: scenarioCategory,
    responseFramework: null, // Offer Coach uses its own scoring, not SBAR/STAR
    score: null, // Average computed from negotiation dimensions if needed
    sbarScores: null,
    extraScores: {
      ...(negotiationScores || {}),
      scenario_id: scenarioId,
      scenario_category: scenarioCategory,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// AGGREGATION HELPERS
// ============================================================

/** Count sessions by mode */
export function countByMode(sessions) {
  const counts = { 'mock-interview': 0, 'practice': 0, 'sbar-drill': 0, 'ai-coach': 0, 'offer-coach': 0, 'confidence-builder': 0 };
  sessions.forEach(s => { if (counts[s.mode] !== undefined) counts[s.mode]++; });
  return counts;
}

/** Average score across sessions with scores (1-5 scale) */
export function averageScore(sessions) {
  const scored = sessions.filter(s => s.score !== null);
  if (scored.length === 0) return null;
  return scored.reduce((sum, s) => sum + s.score, 0) / scored.length;
}

/** Average SBAR component scores across sbar-drill sessions */
export function averageSBARScores(sessions) {
  const sbarSessions = sessions.filter(s => s.mode === 'sbar-drill' && s.sbarScores);
  if (sbarSessions.length === 0) return null;

  const components = ['situation', 'background', 'assessment', 'recommendation'];
  const result = {};

  components.forEach(comp => {
    const scored = sbarSessions.filter(s => s.sbarScores[comp] !== null);
    result[comp] = scored.length > 0
      ? scored.reduce((sum, s) => sum + s.sbarScores[comp], 0) / scored.length
      : null;
  });

  return result;
}

/** Get weakest SBAR component name */
export function weakestSBARComponent(avgScores) {
  if (!avgScores) return null;
  const entries = Object.entries(avgScores).filter(([, v]) => v !== null);
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0]; // key of weakest
}

/** Average score by framework (sbar vs star) */
export function averageByFramework(sessions) {
  const sbar = sessions.filter(s => s.responseFramework === 'sbar' && s.score !== null);
  const star = sessions.filter(s => s.responseFramework === 'star' && s.score !== null);
  return {
    sbar: sbar.length > 0 ? sbar.reduce((sum, s) => sum + s.score, 0) / sbar.length : null,
    star: star.length > 0 ? star.reduce((sum, s) => sum + s.score, 0) / star.length : null,
  };
}

/** Get per-question stats: { [questionId]: { attempts, totalScore, bestScore, lastAttempt } } */
export function perQuestionStats(sessions) {
  const stats = {};
  sessions.forEach(s => {
    if (!stats[s.questionId]) {
      stats[s.questionId] = { attempts: 0, totalScore: 0, scoredCount: 0, bestScore: null, lastAttempt: s.timestamp };
    }
    const qs = stats[s.questionId];
    qs.attempts++;
    if (s.score !== null) {
      qs.totalScore += s.score;
      qs.scoredCount++;
      if (qs.bestScore === null || s.score > qs.bestScore) qs.bestScore = s.score;
    }
    if (s.timestamp > qs.lastAttempt) qs.lastAttempt = s.timestamp;
  });
  // Compute averages
  Object.values(stats).forEach(qs => {
    qs.avgScore = qs.scoredCount > 0 ? qs.totalScore / qs.scoredCount : null;
  });
  return stats;
}

/** Score trend — last N scores in chronological order */
export function scoreTrend(sessions, limit = 20) {
  return sessions
    .filter(s => s.score !== null)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-limit)
    .map(s => ({ score: s.score, timestamp: s.timestamp, mode: s.mode }));
}

/** Unique questions practiced */
export function uniqueQuestionsPracticed(sessions) {
  return new Set(sessions.map(s => s.questionId)).size;
}
