// Credit System for ISL - PRODUCTION VERSION
// Supports: Free tier, 30-day passes (nursing/general), annual, legacy pro, beta
//
// PRICING MODEL (P2):
//   Nursing Interview Pro:   $19.99 / 30-day pass
//   General Interview Prep:  $14.99 / 30-day pass
//   All-Access Annual:       $149.99 / year
//
// Pass expiry stored in user_profiles.nursing_pass_expires / general_pass_expires
// Use resolveEffectiveTier() to determine active tier from profile data.

export const TIER_LIMITS = {
  free: {
    name: 'Free',
    price: 0,
    // General features (unchanged)
    ai_interviewer: 3,           // 3 full AI practice sessions (high value)
    practice_mode: 10,            // 10 quick practices (daily use for 2 weeks)
    answer_assistant: 5,          // 5 STAR coaching sessions
    question_gen: 5,              // 5 AI question generations
    live_prompter_questions: 10,  // 10 real-time prompt questions
    live_prompter_unlimited: false,
    // Nursing Track — reduced free tier (6 AI sessions total: 3+1+2)
    nursing_practice: 3,          // 3 nursing quick practice sessions/month
    nursing_mock: 2,              // 2 free full mock interview sessions/month
    nursing_sbar: 2,              // 2 nursing SBAR drill sessions/month
    nursing_coach: 0,             // AI Coach is pass-only
  },

  // ── 30-Day Pass: Nursing ($19.99) ──────────────────────────
  nursing_pass: {
    name: 'Nursing Pass',
    price: 19.99,
    // General features stay at FREE-tier level (they didn't buy general)
    ai_interviewer: 3,
    practice_mode: 10,
    answer_assistant: 5,
    question_gen: 5,
    live_prompter_questions: 10,
    live_prompter_unlimited: false,
    // Nursing Track — ALL UNLIMITED
    nursing_practice: 999999,
    nursing_mock: 999999,
    nursing_sbar: 999999,
    nursing_coach: 999999,        // Unlimited AI Coach (~$0.011/msg, cost negligible)
  },

  // ── 30-Day Pass: General ($14.99) ──────────────────────────
  general_pass: {
    name: 'General Pass',
    price: 14.99,
    // General features — UNLIMITED
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true,
    // Nursing Track stays at FREE-tier level (they didn't buy nursing)
    nursing_practice: 3,
    nursing_mock: 2,
    nursing_sbar: 2,
    nursing_coach: 0,
  },

  // ── Annual All-Access ($149.99/year) ───────────────────────
  annual: {
    name: 'Annual All-Access',
    price: 149.99,
    // General — UNLIMITED
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true,
    // Nursing — ALL UNLIMITED
    nursing_practice: 999999,
    nursing_mock: 999999,
    nursing_sbar: 999999,
    nursing_coach: 999999,
  },

  // ── Legacy Pro ($29.99/month subscription) — backward compat ─
  pro: {
    name: 'Pro',
    price: 29.99,
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true,
    // Nursing Track
    nursing_practice: 999999,
    nursing_mock: 999999,
    nursing_sbar: 999999,
    nursing_coach: 999999,        // Legacy pro gets unlimited coach
  },

  // ── Beta Testers — unlimited everything ────────────────────
  beta: {
    name: 'Beta Tester',
    price: 0,
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true,
    // Nursing Track
    nursing_practice: 999999,
    nursing_mock: 999999,
    nursing_sbar: 999999,
    nursing_coach: 999999,        // Beta gets unlimited coach
  }
};

// ============================================================================
// TIER RESOLUTION — Determine effective tier from user profile data
// ============================================================================
// Call this with the user's profile row (including pass expiry columns).
// Returns the tier key to use for TIER_LIMITS lookup.
//
// Priority: beta > annual (both active) > nursing_pass > general_pass > pro (legacy) > free

export function resolveEffectiveTier(profile, isBeta = false) {
  // Beta always wins
  if (isBeta || profile?.tier === 'beta') return 'beta';

  const now = new Date();
  const nursingActive = profile?.nursing_pass_expires &&
    new Date(profile.nursing_pass_expires) > now;
  const generalActive = profile?.general_pass_expires &&
    new Date(profile.general_pass_expires) > now;

  // Both active = annual (or two separate passes — treat same)
  if (nursingActive && generalActive) return 'annual';

  // Single product passes
  if (nursingActive) return 'nursing_pass';
  if (generalActive) return 'general_pass';

  // Legacy pro subscription (backward compat)
  if (profile?.tier === 'pro' && profile?.subscription_status === 'active') return 'pro';

  return 'free';
}

// Helper: Does this user have an active nursing pass (or better)?
export function hasActiveNursingPass(profile, isBeta = false) {
  const tier = resolveEffectiveTier(profile, isBeta);
  return tier === 'nursing_pass' || tier === 'annual' || tier === 'pro' || tier === 'beta';
}

// Helper: Does this user have an active general pass (or better)?
export function hasActiveGeneralPass(profile, isBeta = false) {
  const tier = resolveEffectiveTier(profile, isBeta);
  return tier === 'general_pass' || tier === 'annual' || tier === 'pro' || tier === 'beta';
}

// Helper: Get pass expiry info for display
export function getPassExpiryInfo(profile) {
  const now = new Date();
  const result = { nursing: null, general: null };

  if (profile?.nursing_pass_expires) {
    const expires = new Date(profile.nursing_pass_expires);
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    result.nursing = {
      expires,
      daysLeft: Math.max(0, daysLeft),
      isActive: daysLeft > 0,
      isExpired: daysLeft <= 0,
      isExpiringSoon: daysLeft > 0 && daysLeft <= 5,
    };
  }

  if (profile?.general_pass_expires) {
    const expires = new Date(profile.general_pass_expires);
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    result.general = {
      expires,
      daysLeft: Math.max(0, daysLeft),
      isActive: daysLeft > 0,
      isExpired: daysLeft <= 0,
      isExpiringSoon: daysLeft > 0 && daysLeft <= 5,
    };
  }

  return result;
}

// Initialize usage tracking for a new user
export function initializeUsageTracking(userId, tier = 'free') {
  const usage = {
    user_id: userId,
    tier: tier,
    period: getCurrentPeriod(),
    ai_interviewer: 0,
    practice_mode: 0,
    answer_assistant: 0,
    question_gen: 0,
    live_prompter_questions: 0,
    nursing_coach: 0,
    last_reset: new Date().toISOString()
  };
  
  return usage;
}

// Get current billing period (YYYY-MM format)
function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Check if user can use a feature
export function canUseFeature(usage, tier, feature) {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  
  // Convert camelCase feature name to snake_case for database lookup
  const dbFeatureName = featureNameToDb(feature);
  
  const currentUsage = usage[dbFeatureName] || 0;
  const limit = limits[dbFeatureName];
  
  if (!limit) {
    console.warn(`Unknown feature: ${feature}`);
    return { allowed: false, remaining: 0, limit: 0, exceeded: true };
  }
  
  // Unlimited features
  if (limit >= 999999) {
    return { 
      allowed: true, 
      remaining: 999999, 
      limit: limit,
      unlimited: true
    };
  }
  
  // Check if under limit
  if (currentUsage < limit) {
    return {
      allowed: true,
      remaining: limit - currentUsage,
      limit: limit,
      unlimited: false
    };
  }
  
  // Over limit
  return {
    allowed: false,
    remaining: 0,
    limit: limit,
    exceeded: true,
    unlimited: false
  };
}

// Convert feature names between camelCase (used in App.jsx) and snake_case (used in DB)
function featureNameToDb(camelCaseName) {
  const mapping = {
    'aiInterviewer': 'ai_interviewer',
    'practiceMode': 'practice_mode',
    'answerAssistant': 'answer_assistant',
    'questionGen': 'question_gen',
    'livePrompterQuestions': 'live_prompter_questions',
    // Nursing Track — separate credit pools
    'nursingPractice': 'nursing_practice',
    'nursingMock': 'nursing_mock',
    'nursingSbar': 'nursing_sbar',
    'nursingCoach': 'nursing_coach',
  };
  return mapping[camelCaseName] || camelCaseName;
}

// Increment usage for a feature
export async function incrementUsage(supabase, userId, feature) {
  try {
    // Convert camelCase feature name to snake_case
    const dbFeatureName = featureNameToDb(feature);
    
    // Get current usage
    const { data: usageData, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period', getCurrentPeriod())
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage:', fetchError);
      return null;
    }
    
    let newCount = 1;
    
    if (usageData) {
      newCount = (usageData[dbFeatureName] || 0) + 1;
      
      // Update existing record
      const { data, error } = await supabase
        .from('usage_tracking')
        .update({ [dbFeatureName]: newCount })
        .eq('user_id', userId)
        .eq('period', getCurrentPeriod())
        .select()
        .single();
      
      if (error) {
        console.error('Error updating usage:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new record for this period
      const newUsage = initializeUsageTracking(userId);
      newUsage[dbFeatureName] = 1;
      
      const { data, error } = await supabase
        .from('usage_tracking')
        .insert([newUsage])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating usage record:', error);
        return null;
      }
      
      return data;
    }
  } catch (err) {
    console.error('Error in incrementUsage:', err);
    return null;
  }
}

// Get usage stats for display
export async function getUsageStats(supabase, userId, tier) {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period', getCurrentPeriod())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', error);
    }
    
    const usage = data || initializeUsageTracking(userId, tier);
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    
    return {
      aiInterviewer: {
        used: usage.ai_interviewer || 0,
        limit: limits.ai_interviewer,
        remaining: Math.max(0, limits.ai_interviewer - (usage.ai_interviewer || 0)),
        unlimited: limits.ai_interviewer >= 999999
      },
      practiceMode: {
        used: usage.practice_mode || 0,
        limit: limits.practice_mode,
        remaining: Math.max(0, limits.practice_mode - (usage.practice_mode || 0)),
        unlimited: limits.practice_mode >= 999999
      },
      answerAssistant: {
        used: usage.answer_assistant || 0,
        limit: limits.answer_assistant,
        remaining: Math.max(0, limits.answer_assistant - (usage.answer_assistant || 0)),
        unlimited: limits.answer_assistant >= 999999
      },
      questionGen: {
        used: usage.question_gen || 0,
        limit: limits.question_gen,
        remaining: Math.max(0, limits.question_gen - (usage.question_gen || 0)),
        unlimited: limits.question_gen >= 999999
      },
      livePrompterQuestions: {
        used: usage.live_prompter_questions || 0,
        limit: limits.live_prompter_questions,
        remaining: Math.max(0, limits.live_prompter_questions - (usage.live_prompter_questions || 0)),
        unlimited: limits.live_prompter_questions >= 999999 // FIXED: Consistent unlimited check with other features
      },
      // Nursing Track — separate pools
      nursingPractice: {
        used: usage.nursing_practice || 0,
        limit: limits.nursing_practice || 0,
        remaining: Math.max(0, (limits.nursing_practice || 0) - (usage.nursing_practice || 0)),
        unlimited: (limits.nursing_practice || 0) >= 999999
      },
      nursingMock: {
        used: usage.nursing_mock || 0,
        limit: limits.nursing_mock || 0,
        remaining: Math.max(0, (limits.nursing_mock || 0) - (usage.nursing_mock || 0)),
        unlimited: (limits.nursing_mock || 0) >= 999999
      },
      nursingSbar: {
        used: usage.nursing_sbar || 0,
        limit: limits.nursing_sbar || 0,
        remaining: Math.max(0, (limits.nursing_sbar || 0) - (usage.nursing_sbar || 0)),
        unlimited: (limits.nursing_sbar || 0) >= 999999
      },
      nursingCoach: {
        used: usage.nursing_coach || 0,
        limit: limits.nursing_coach || 0,
        remaining: Math.max(0, (limits.nursing_coach || 0) - (usage.nursing_coach || 0)),
        unlimited: (limits.nursing_coach || 0) >= 999999
      },
    };
  } catch (err) {
    console.error('Error in getUsageStats:', err);
    return null;
  }
}

// Reset usage at the start of a new billing period
export async function resetMonthlyUsage(supabase, userId) {
  const newUsage = initializeUsageTracking(userId);
  
  const { data, error } = await supabase
    .from('usage_tracking')
    .insert([newUsage])
    .select()
    .single();
  
  if (error) {
    console.error('Error resetting monthly usage:', error);
    return null;
  }
  
  return data;
}

// Get user-friendly feature names for display
export function getFeatureDisplayInfo(feature) {
  const info = {
    aiInterviewer: {
      name: 'AI Interviewer',
      description: 'Realistic practice with AI feedback',
      icon: '🤖',
      value: 'Full AI practice sessions with personalized feedback'
    },
    practiceMode: {
      name: 'Practice Mode',
      description: 'Quick scoring and analysis',
      icon: '🎯',
      value: 'Fast practice with instant AI scoring'
    },
    answerAssistant: {
      name: 'Answer Assistant',
      description: 'STAR method coaching',
      icon: '✨',
      value: 'Expert coaching on structuring your answers'
    },
    questionGen: {
      name: 'Question Generator',
      description: 'AI-powered personalized questions',
      icon: '💡',
      value: 'Custom questions tailored to your experience'
    },
    livePrompterQuestions: {
      name: 'Live Prompter',
      description: 'Real-time interview support',
      icon: '🎤',
      value: 'Live bullet points during actual interviews'
    },
    // Nursing Track
    nursingPractice: {
      name: 'Quick Practice',
      description: 'Nursing interview practice with AI feedback',
      icon: '🎯',
      value: 'Practice nursing questions with instant scoring'
    },
    nursingMock: {
      name: 'Mock Interview',
      description: 'Full nursing mock interview sessions',
      icon: '🤖',
      value: 'Realistic nursing interview simulation'
    },
    nursingSbar: {
      name: 'SBAR Drill',
      description: 'Clinical communication practice',
      icon: '📋',
      value: 'SBAR communication drill with per-component scoring'
    },
    nursingCoach: {
      name: 'AI Coach',
      description: 'Free-form interview coaching',
      icon: '🤖',
      value: 'Personalized AI coaching for interview preparation'
    },
  };

  return info[feature] || { name: feature, description: '', icon: '📊', value: '' };
}

// ============================================================================
// PHASE 2: Beta User Detection + Server-Side Verification
// ============================================================================

// Check if user is a beta tester (server-side verified)
export async function isBetaUser(supabase, userId) {
  try {
    // Check beta_testers table first
    const { data: betaUser } = await supabase
      .from('beta_testers')
      .select('unlimited_access')
      .eq('user_id', userId)
      .maybeSingle();

    if (betaUser?.unlimited_access) {
      console.log('🎖️ Beta user detected (beta_testers table) - unlimited access');
      return true;
    }

    // Check user_profiles.tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile?.tier === 'beta') {
      console.log('🎖️ Beta user detected (user_profiles.tier) - unlimited access');
      return true;
    }

    return false;
  } catch (err) {
    // Error checking beta status - fail open (allow access)
    // This prevents blocking users if beta_testers table doesn't exist
    console.warn('Beta check failed (allowing access):', err.message);
    return false;
  }
}

// Server-side verified feature check (prevents bypass via stale state or cache clearing)
export async function canUseFeatureServerSide(supabase, userId, tier, feature) {
  try {
    // Beta users have unlimited access
    const isBeta = await isBetaUser(supabase, userId);
    if (isBeta) {
      return {
        allowed: true,
        remaining: 999999,
        limit: 999999,
        unlimited: true,
        isBeta: true
      };
    }

    // Get FRESH usage from server (not cached state)
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: usage, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error);
      // On error, allow access but log for monitoring
      return { allowed: true, remaining: 1, limit: 1, error: true };
    }

    // Check against limits using existing function
    return canUseFeature(usage || {}, tier, feature);
  } catch (err) {
    console.error('Error in canUseFeatureServerSide:', err);
    // On error, allow access but log for monitoring
    return { allowed: true, remaining: 1, limit: 1, error: true };
  }
}
