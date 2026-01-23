import { useEffect, useState } from 'react';
import { Brain, Target, Sparkles, HelpCircle, Mic, TrendingUp, Crown, ArrowRight, Infinity } from 'lucide-react';
import { getUsageStats, TIER_LIMITS } from '../utils/creditSystem';

export default function UsageDashboard({ user, supabase, userTier = 'free', onUpgrade }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user, userTier]);

  async function loadUsageStats() {
    setLoading(true);
    const usageStats = await getUsageStats(supabase, user.id, userTier);
    setStats(usageStats);
    setLoading(false);
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
      description: 'Quick practice with instant scoring',
      color: 'blue'
    },
    {
      name: 'Answer Assistant',
      icon: <Sparkles className="w-5 h-5" />,
      key: 'answerAssistant',
      description: 'AI coach helps build answers',
      color: 'purple'
    },
    {
      name: 'Question Generator',
      icon: <HelpCircle className="w-5 h-5" />,
      key: 'questionGen',
      description: 'Generate personalized questions',
      color: 'green'
    },
    {
      name: 'Live Prompter',
      icon: <Mic className="w-5 h-5" />,
      key: 'livePrompterQuestions',
      description: 'Real-time interview assistance',
      color: 'orange'
    }
  ];

  const getColorClass = (color, type = 'bg') => {
    const colors = {
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: 'bg-indigo-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-600' }
    };
    return colors[color][type];
  };

  const getProgressColor = (used, limit) => {
    if (limit >= 999999) return 'bg-green-500'; // Unlimited = green
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isPro = userTier === 'pro';

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            My Usage
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isPro ? (
              <span className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-600" />
                Pro Plan - Unlimited Everything!
              </span>
            ) : (
              'Track your monthly usage'
            )}
          </p>
        </div>
        {!isPro && (
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </button>
        )}
      </div>

      {/* Usage Cards */}
      <div className="space-y-4">
        {features.map(feature => {
          const featureStats = stats[feature.key];
          const isUnlimited = featureStats.unlimited;
          const used = featureStats.used;
          const limit = featureStats.limit;
          const remaining = featureStats.remaining;
          const percentage = isUnlimited ? 0 : (used / limit) * 100;

          return (
            <div
              key={feature.key}
              className={`${getColorClass(feature.color, 'bg')} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${getColorClass(feature.color, 'text')}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${getColorClass(feature.color, 'text')}`}>
                      {feature.name}
                    </h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isUnlimited ? (
                    <div className="flex items-center gap-1">
                      <Infinity className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Unlimited</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-900">
                        {used}/{limit}
                      </div>
                      <div className="text-xs text-gray-600">
                        {remaining} left
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar - only show for non-unlimited */}
              {!isUnlimited && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(used, limit)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              )}

              {/* Unlimited Badge */}
              {isUnlimited && (
                <div className="bg-white/50 rounded-md px-3 py-2 text-center">
                  <span className="text-sm font-medium text-gray-700">
                    ✨ You've used {used} times this month - keep going!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for Free Users */}
      {!isPro && (
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready for Unlimited?</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Upgrade to Pro and never worry about running out of practice sessions again.
              </p>
              <ul className="space-y-1 text-sm text-indigo-100 mb-4">
                <li>✨ Unlimited AI Interviewer</li>
                <li>✨ Unlimited Practice Mode</li>
                <li>✨ Unlimited Answer Assistant</li>
                <li>✨ Unlimited Question Generator</li>
                <li>✨ Unlimited Live Prompter</li>
              </ul>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="w-full bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
          >
            Upgrade to Pro for $29.99/month
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Pro User Benefits Reminder */}
      {isPro && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Crown className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                You're all set! 🎉
              </h3>
              <p className="text-sm text-gray-700">
                As a Pro member, you have unlimited access to everything. Practice as much as you need to crush your interviews!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
