// Simple Usage Limit Modal - Matches E-010 Screenshot
// Fixes: E-001, E-004, E-011, E-012, E-013, E-014

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Crown, AlertCircle } from 'lucide-react';
import { getUsageStats, TIER_LIMITS } from '../utils/creditSystem';

const UsageLimitModal = ({ user, supabase, userTier, onUpgrade, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsageData();
  }, [user, userTier]);

  const loadUsageData = async () => {
    if (!user || !supabase) {
      setError('Please sign in to view usage');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const stats = await getUsageStats(supabase, user.id, userTier);
      
      if (!stats) {
        throw new Error('Failed to load usage data');
      }
      
      setUsageData(stats);
    } catch (err) {
      console.error('Error loading usage:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculatePercentage = (used, limit, unlimited) => {
    // E-012 FIX: Handle NaN% bug
    if (unlimited) return 0; // Don't show percentage for unlimited
    if (limit === 0) return 0; // E-012: Prevent division by zero
    if (used === 0) return 0;
    
    const percentage = (used / limit) * 100;
    return Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
  };

  const formatLimit = (limit, unlimited) => {
    // E-014 FIX: Show "Unlimited" for pro tier
    if (unlimited || limit >= 999999) return 'Unlimited';
    return limit;
  };

  const getFeatureConfig = () => {
    return [
      {
        key: 'aiInterviewer',
        name: 'AI Interviewer',
        description: 'Realistic practice with AI feedback',
        icon: '🤖',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        key: 'practiceMode',
        name: 'Practice Mode',
        description: 'Quick scoring and analysis',
        icon: '🎯',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        key: 'answerAssistant',
        name: 'Answer Assistant',
        description: 'STAR method coaching',
        icon: '✨',
        color: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        key: 'questionGen',
        name: 'Question Generator',
        description: 'AI-powered personalized questions',
        icon: '❓',
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        key: 'livePrompterQuestions',
        name: 'Live Prompter',
        description: 'Real-time interview support',
        icon: '🎤',
        color: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    ];
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading usage data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <button
          onClick={loadUsageData}
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No usage data available</p>
      </div>
    );
  }

  const features = getFeatureConfig();
  const tierName = userTier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Usage This Month</h2>
          </div>
          {userTier === 'free' && (
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          Your {tierName} tier usage for {getCurrentMonth()}
        </p>
      </div>

      {/* Usage Cards */}
      <div className="space-y-4 mb-6">
        {features.map((feature) => {
          const data = usageData[feature.key];
          
          // E-004 FIX: Provide fallbacks for undefined values
          const used = data?.used ?? 0;
          const limit = data?.limit ?? 0;
          const unlimited = data?.unlimited ?? false;
          const remaining = unlimited ? 999999 : Math.max(0, limit - used);
          
          const percentage = calculatePercentage(used, limit, unlimited);
          const limitDisplay = formatLimit(limit, unlimited);
          const isLimitReached = !unlimited && used >= limit;

          return (
            <div
              key={feature.key}
              className={`${feature.bgColor} rounded-xl p-4 border-2 ${feature.borderColor} transition-all hover:shadow-md`}
            >
              {/* Feature Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base">{feature.name}</h3>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className={`text-2xl font-black ${unlimited ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {unlimited ? '∞' : remaining}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold whitespace-nowrap">
                    {unlimited ? 'Unlimited' : `of ${limitDisplay} left`}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-full`}
                    style={{ width: unlimited ? '0%' : `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-semibold">
                  Used: {used}
                </span>
                <span className="text-gray-600 font-semibold">
                  {unlimited ? 'No limits!' : `${percentage.toFixed(0)}%`}
                </span>
              </div>

              {/* Limit Reached Warning */}
              {isLimitReached && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-semibold">
                    You've reached your limit. Upgrade to continue!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA for Free Users */}
      {userTier === 'free' && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Need More Sessions?
          </h3>
          <p className="text-indigo-100 text-sm mb-4">
            Upgrade to Pro and get unlimited access to all features. Practice as much as you need!
          </p>
          <ul className="space-y-1 text-sm mb-4">
            <li>• Unlimited AI Interviewer</li>
            <li>• Unlimited Practice Mode</li>
            <li>• Unlimited Answer Assistant</li>
            <li>• Unlimited Question Generator</li>
            <li>• Unlimited Live Prompter</li>
          </ul>
          <button
            onClick={onUpgrade}
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition"
          >
            Upgrade to Pro - $29.99/month
          </button>
        </div>
      )}

      {/* E-013 FIX: Clear monthly reset message */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Usage resets on the 1st of each month
        </p>
      </div>
    </div>
  );
};

export default UsageLimitModal;
