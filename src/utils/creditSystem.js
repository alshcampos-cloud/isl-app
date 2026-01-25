// Credit System for ISL - FIXED VERSION
// Updated to match Supabase snake_case column naming

export const TIER_LIMITS = {
  free: {
    name: 'Free',
    price: 0,
    ai_interviewer: 3,
    practice_mode: 5,
    answer_assistant: 2,
    question_gen: 5,
    live_prompter_questions: 10,
    live_prompter_unlimited: false
  },
  starter: {
    name: 'Starter',
    price: 14.99,
    ai_interviewer: 20,
    practice_mode: 30,
    answer_assistant: 5,
    question_gen: 999999, // unlimited
    live_prompter_questions: 999999,
    live_prompter_unlimited: true
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    ai_interviewer: 50,
    practice_mode: 999999, // unlimited
    answer_assistant: 15,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true
  },
  premium: {
    name: 'Premium',
    price: 49.99,
    ai_interviewer: 999999, // unlimited
    practice_mode: 999999,
    answer_assistant: 30,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true
  }
};

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
  const limits = TIER_LIMITS[tier];
  
  // Convert camelCase feature name to snake_case for database lookup
  const dbFeatureName = featureNameToDb(feature);
  
  const currentUsage = usage[dbFeatureName] || 0;
  const limit = limits[dbFeatureName];
  
  // Unlimited features
  if (limit >= 999999) return { allowed: true, remaining: 999999 };
  
  // Check if under limit
  if (currentUsage < limit) {
    return {
      allowed: true,
      remaining: limit - currentUsage,
      limit: limit
    };
  }
  
  return {
    allowed: false,
    remaining: 0,
    limit: limit,
    exceeded: true
  };
}

// Convert feature names between camelCase (used in App.jsx) and snake_case (used in DB)
function featureNameToDb(camelCaseName) {
  const mapping = {
    'aiInterviewer': 'ai_interviewer',
    'practiceMode': 'practice_mode',
    'answerAssistant': 'answer_assistant',
    'questionGen': 'question_gen',
    'livePrompterQuestions': 'live_prompter_questions'
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
      return null;
    }
    
    const usage = data || initializeUsageTracking(userId, tier);
    const limits = TIER_LIMITS[tier];
    
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
        unlimited: limits.live_prompter_unlimited
      }
    };
  } catch (err) {
    console.error('Error in getUsageStats:', err);
    return null;
  }
}

// Reset usage at the start of a new billing period (run this monthly)
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
