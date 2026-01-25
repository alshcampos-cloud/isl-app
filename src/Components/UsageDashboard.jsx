import { useState, useEffect } from 'react';
import { Brain, Target, Sparkles, HelpCircle, Mic, TrendingUp, Crown, ArrowRight } from 'lucide-react';

export default function UsageDashboard({ user, userTier = 'free', onUpgrade }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tier limits
  const TIER_LIMITS = {
    free: {
      name: 'Free',
      aiInterviewer: 3,
      practiceMode: 10,
      answerAssistant: 5,
      questionGen: 5,
      livePrompterQuestions: 0
    },
    pro: {
      name: 'Pro',
      aiInterviewer: 50,
      practiceMode: -1, // unlimited
      answerAssistant: 15,
      questionGen: 20,
      livePrompterQuestions: -1 // unlimited
    }
  };

  useEffect(() => {
    loadUsageStats();
  }, [user, userTier]);

  function loadUsageStats() {
    setLoading(true);
    
    try {
      // Get usage from localStorage
      const usageData = localStorage.getItem('isl_monthly_usage');
      const usage = usageData ? JSON.parse(usageData) : {};
      
      // Get current month key
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Get this month's usage or default to 0
      const monthUsage = usage[monthKey] || {
        aiInterviewer: 0,
        practiceMode: 0,
        answerAssistant: 0,
        questionGen: 0,
        livePrompterQuestions: 0
      };
      
      // Calculate stats for each feature
      const limits = TIER_LIMITS[userTier] || TIER_LIMITS.free;
      
      const calculatedStats = {
        aiInterviewer: {
          used: monthUsage.aiInterviewer || 0,
          limit: limits.aiInterviewer,
          unlimited: limits.aiInterviewer === -1,
          remaining: limits.aiInterviewer === -1 ? 999 : Math.max(0, limits.aiInterviewer - (monthUsage.aiInterviewer || 0))
        },
        practiceMode: {
          used: monthUsage.practiceMode || 0,
          limit: limits.practiceMode,
          unlimited: limits.practiceMode === -1,
          remaining: limits.practiceMode === -1 ? 999 : Math.max(0, limits.practiceMode - (monthUsage.practiceMode || 0))
        },
        answerAssistant: {
          used: monthUsage.answerAssistant || 0,
          limit: limits.answerAssistant,
          unlimited: limits.answerAssistant === -1,
          remaining: limits.answerAssistant === -1 ? 999 : Math.max(0, limits.answerAssistant - (monthUsage.answerAssistant || 0))
        },
        questionGen: {
          used: monthUsage.questionGen || 0,
          limit: limits.questionGen,
          unlimited: limits.questionGen === -1,
          remaining: limits.questionGen === -1 ? 999 : Math.max(0, limits.questionGen - (monthUsage.questionGen || 0))
        },
        livePrompterQuestions: {
          used: monthUsage.livePrompterQuestions || 0,
          limit: limits.livePrompterQuestions,
          unlimited: limits.livePrompterQuestions === -1,
          remaining: limits.livePrompterQuestions === -1 ? 999 : Math.max(0, limits.livePrompterQuestions - (monthUsage.livePrompterQuestions || 0))
        }
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
      // Set default empty stats on error
      setStats({
        aiInterviewer: { used: 0, limit: 3, unlimited: false, remaining: 3 },
        practiceMode: { used: 0, limit: 10, unlimited: false, remaining: 10 },
        answerAssistant: { used: 0, limit: 5, unlimited: false, remaining: 5 },
        questionGen: { used: 0, limit: 5, unlimited: false, remaining: 5 },
        livePrompterQuestions: { used: 0, limit: 0, unlimited: false, remaining: 0 }
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const features = [
    {
      name: 'AI Interviewer',
      icon: <Brain className="w-5 h-5" />,
      key: 'aiInterviewer',
      description: 'Realistic practice with AI feedback',
      color: 'indigo'
    },
    {
      name: 'Practice Mode',
      icon: <Target className="w-5 h-5" />,
      key: 'practiceMode',
      description: 'Quick scoring and analysis',
      color: 'green'
    },
    {
      name: 'Answer Assistant',
      icon: <Sparkles className="w-5 h-5" />,
      key: 'answerAssistant',
      description: 'STAR method coaching',
      color: 'purple'
    },
    {
      name: 'Question Generator',
      icon: <HelpCircle className="w-5 h-5" />,
      key: 'questionGen',
      description: 'AI-powered personalized questions',
      color: 'blue'
    },
    {
      name: 'Live Prompter',
      icon: <Mic className="w-5 h-5" />,
      key: 'livePrompterQuestions',
      description: 'Real-time interview support',
      color: 'orange'
    }
  ];

  const getColorClasses = (color, usage, limit) => {
    const percentUsed = (usage / limit) * 100;
    
    if (percentUsed >= 90) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        bar: 'bg-red-500',
        light: 'bg-red-100'
      };
    }
    
    if (percentUsed >= 70) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        bar: 'bg-yellow-500',
        light: 'bg-yellow-100'
      };
    }
    
    return {
      bg: `bg-${color}-50`,
      border: `border-${color}-200`,
      text: `text-${color}-900`,
      bar: `bg-${color}-500`,
      light: `bg-${color}-100`
    };
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Usage This Month
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your {TIER_LIMITS[userTier].name} tier usage for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {userTier === 'free' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Usage Cards */}
      <div className="space-y-4">
        {features.map((feature) => {
          const featureStats = stats[feature.key];
          const colors = featureStats.unlimited 
            ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', bar: 'bg-green-500', light: 'bg-green-100' }
            : getColorClasses(feature.color, featureStats.used, featureStats.limit);
          
          const percentUsed = featureStats.unlimited 
            ? 0 
            : Math.min(100, (featureStats.used / featureStats.limit) * 100);

          return (
            <div
              key={feature.key}
              className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${colors.light} p-2 rounded-lg ${colors.text}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${colors.text}`}>{feature.name}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {featureStats.unlimited ? (
                    <div className={`font-bold ${colors.text} flex items-center gap-1`}>
                      <Crown className="w-4 h-4" />
                      Unlimited
                    </div>
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${colors.text}`}>
                        {featureStats.remaining}
                      </div>
                      <div className="text-xs text-gray-600">
                        of {featureStats.limit} left
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!featureStats.unlimited && (
                <div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${colors.bar} transition-all duration-300`}
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used: {featureStats.used}</span>
                    <span>{percentUsed.toFixed(0)}%</span>
                  </div>

                  {/* Low balance warning */}
                  {featureStats.remaining <= 1 && featureStats.remaining > 0 && (
                    <div className="mt-2 text-xs bg-red-100 border border-red-300 text-red-800 rounded p-2">
                      ⚠️ Only {featureStats.remaining} session{featureStats.remaining !== 1 ? 's' : ''} remaining this month!
                    </div>
                  )}
                  
                  {featureStats.remaining === 0 && (
                    <div className="mt-2 text-xs bg-red-100 border border-red-300 text-red-800 rounded p-2">
                      🚫 You've reached your limit. {userTier === 'free' ? 'Upgrade to continue!' : 'Resets next month.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for free users */}
      {userTier === 'free' && onUpgrade && (
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need More Sessions?</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Upgrade to Pro and get 50 AI Interviewer sessions, unlimited Practice Mode, and 15 Answer Assistant sessions every month.
              </p>
              <button
                onClick={onUpgrade}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition"
              >
                Upgrade to Pro - $29.99/month
              </button>
            </div>
            <Crown className="w-12 h-12 text-yellow-300" />
          </div>
        </div>
      )}

      {/* Reset info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Usage resets on the 1st of each month
      </div>
    </div>
  );
}
