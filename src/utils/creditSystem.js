// Credit System for ISL - EMERGENCY HOTFIX
// Temporarily removes usage limits for debugging

export const TIER_LIMITS = {
  free: {
    name: 'Free',
    price: 0,
    ai_interviewer: 999999, // TEMPORARILY UNLIMITED
    practice_mode: 999999, // TEMPORARILY UNLIMITED
    answer_assistant: 999999, // TEMPORARILY UNLIMITED
    question_gen: 999999, // TEMPORARILY UNLIMITED
    live_prompter_questions: 999999, // TEMPORARILY UNLIMITED
    live_prompter_unlimited: true
  },
  starter: {
    name: 'Starter',
    price: 14.99,
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
    live_prompter_unlimited: true
  },
  premium: {
    name: 'Premium',
    price: 49.99,
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
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

// Check if user can use a feature - ALWAYS RETURNS TRUE FOR DEBUGGING
export function canUseFeature(usage, tier, feature) {
  console.log('🔍 canUseFeature called:', { usage, tier, feature });
  
  // TEMPORARILY ALWAYS ALLOW FOR DEBUGGING
  return {
    allowed: true,
    remaining: 999999,
    limit: 999999,
    unlimited: true
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
  console.log('📊 incrementUsage called:', { userId, feature });
  
  try {
    // Convert camelCase feature name to snake_case
    const dbFeatureName = featureNameToDb(feature);
    console.log('📊 Converted feature name:', dbFeatureName);
    
    // Get current usage
    const { data: usageData, error: fetchError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period', getCurrentPeriod())
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching usage:', fetchError);
      // Don't block - just log and continue
      return { success: true };
    }
    
    let newCount = 1;
    
    if (usageData) {
      console.log('📊 Existing usage data:', usageData);
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
        console.error('❌ Error updating usage:', error);
        // Don't block - just log and continue
        return { success: true };
      }
      
      console.log('✅ Updated usage:', data);
      return data;
    } else {
      console.log('📊 Creating new usage record');
      // Create new record for this period
      const newUsage = initializeUsageTracking(userId);
      newUsage[dbFeatureName] = 1;
      
      const { data, error } = await supabase
        .from('usage_tracking')
        .insert([newUsage])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating usage record:', error);
        // Don't block - just log and continue
        return { success: true };
      }
      
      console.log('✅ Created usage:', data);
      return data;
    }
  } catch (err) {
    console.error('❌ Error in incrementUsage:', err);
    // Don't block - just log and continue
    return { success: true };
  }
}

// Get usage stats for display
export async function getUsageStats(supabase, userId, tier) {
  console.log('📊 getUsageStats called:', { userId, tier });
  
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period', getCurrentPeriod())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching usage stats:', error);
    }
    
    console.log('📊 Usage data from DB:', data);
    
    const usage = data || initializeUsageTracking(userId, tier);
    const limits = TIER_LIMITS[tier];
    
    // Return stats with UNLIMITED for everything (debugging)
    return {
      aiInterviewer: {
        used: usage.ai_interviewer || 0,
        limit: 999999,
        remaining: 999999,
        unlimited: true
      },
      practiceMode: {
        used: usage.practice_mode || 0,
        limit: 999999,
        remaining: 999999,
        unlimited: true
      },
      answerAssistant: {
        used: usage.answer_assistant || 0,
        limit: 999999,
        remaining: 999999,
        unlimited: true
      },
      questionGen: {
        used: usage.question_gen || 0,
        limit: 999999,
        remaining: 999999,
        unlimited: true
      },
      livePrompterQuestions: {
        used: usage.live_prompter_questions || 0,
        limit: 999999,
        remaining: 999999,
        unlimited: true
      }
    };
  } catch (err) {
    console.error('❌ Error in getUsageStats:', err);
    
    // Return default unlimited stats
    return {
      aiInterviewer: { used: 0, limit: 999999, remaining: 999999, unlimited: true },
      practiceMode: { used: 0, limit: 999999, remaining: 999999, unlimited: true },
      answerAssistant: { used: 0, limit: 999999, remaining: 999999, unlimited: true },
      questionGen: { used: 0, limit: 999999, remaining: 999999, unlimited: true },
      livePrompterQuestions: { used: 0, limit: 999999, remaining: 999999, unlimited: true }
    };
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
