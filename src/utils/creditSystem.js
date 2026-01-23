// Credit System for ISL
// This file contains all the logic for tracking usage and enforcing limits

export const TIER_LIMITS = {
  free: {
    name: 'Free',
    price: 0,
    aiInterviewer: 3,
    practiceMode: 5,
    answerAssistant: 2,
    questionGen: 5,
    livePrompterQuestions: 10,
    livePrompterUnlimited: false
  },
  starter: {
    name: 'Starter',
    price: 14.99,
    aiInterviewer: 20,
    practiceMode: 30,
    answerAssistant: 5,
    questionGen: 999999, // unlimited
    livePrompterQuestions: 999999,
    livePrompterUnlimited: true
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    aiInterviewer: 50,
    practiceMode: 999999, // unlimited
    answerAssistant: 15,
    questionGen: 999999,
    livePrompterQuestions: 999999,
    livePrompterUnlimited: true
  },
  premium: {
    name: 'Premium',
    price: 49.99,
    aiInterviewer: 999999, // unlimited
    practiceMode: 999999,
    answerAssistant: 30,
    questionGen: 999999,
    livePrompterQuestions: 999999,
    livePrompterUnlimited: true
  }
};

// Initialize usage tracking for a new user
export function initializeUsageTracking(userId, tier = 'free') {
  const usage = {
    userId,
    tier,
    period: getCurrentPeriod(),
    aiInterviewer: 0,
    practiceMode: 0,
    answerAssistant: 0,
    questionGen: 0,
    livePrompterQuestions: 0,
    lastReset: new Date().toISOString()
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
  const currentUsage = usage[feature] || 0;
  const limit = limits[feature];
  
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

// Increment usage for a feature
export async function incrementUsage(supabase, userId, feature) {
  try {
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
      newCount = (usageData[feature] || 0) + 1;
      
      // Update existing record
      const { data, error } = await supabase
        .from('usage_tracking')
        .update({ [feature]: newCount })
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
      newUsage[feature] = 1;
      
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
        used: usage.aiInterviewer || 0,
        limit: limits.aiInterviewer,
        remaining: Math.max(0, limits.aiInterviewer - (usage.aiInterviewer || 0)),
        unlimited: limits.aiInterviewer >= 999999
      },
      practiceMode: {
        used: usage.practiceMode || 0,
        limit: limits.practiceMode,
        remaining: Math.max(0, limits.practiceMode - (usage.practiceMode || 0)),
        unlimited: limits.practiceMode >= 999999
      },
      answerAssistant: {
        used: usage.answerAssistant || 0,
        limit: limits.answerAssistant,
        remaining: Math.max(0, limits.answerAssistant - (usage.answerAssistant || 0)),
        unlimited: limits.answerAssistant >= 999999
      },
      questionGen: {
        used: usage.questionGen || 0,
        limit: limits.questionGen,
        remaining: Math.max(0, limits.questionGen - (usage.questionGen || 0)),
        unlimited: limits.questionGen >= 999999
      },
      livePrompterQuestions: {
        used: usage.livePrompterQuestions || 0,
        limit: limits.livePrompterQuestions,
        remaining: Math.max(0, limits.livePrompterQuestions - (usage.livePrompterQuestions || 0)),
        unlimited: limits.livePrompterUnlimited
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
