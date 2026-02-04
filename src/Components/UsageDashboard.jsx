// ============================================
// ULTIMATE COMPETITIVE DASHBOARD 🏆
// Features NO competitor has!
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Zap, CheckCircle, Trophy, Target, Sparkles, Crown, 
  Award, Star, Flame, Brain, TrendingDown, Calendar, AlertCircle,
  Users, Clock, Activity, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const UltimateCompetitiveDashboard = ({ user, supabase, userTier, onUpgrade }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    readinessScore: 0, // NEW! 0-100 score
    aiCoach: { used: 0, limit: 5 },
    livePrompter: { used: 0, limit: 5 },
    totalSessions: 0,
    streak: 0,
    averageScore: 0, // NEW!
    improvementRate: 0, // NEW! Percentage improved
    predictedSuccess: 0, // NEW! 0-100 chance
    weakestArea: 'behavioral', // NEW!
    strongestArea: 'technical', // NEW!
    daysUntilInterview: null, // NEW!
    achievements: [], // NEW! Badge system
    level: 1, // NEW! Gamification
    xp: 0 // NEW!
  });

  const [celebrationMode, setCelebrationMode] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    loadAdvancedStats();
  }, [user]);

  // COMPREHENSIVE FIX: Removed visibility handler that called async loadAdvancedStats()
  // That was causing "Loading..." spinner to hang after tab switch
  // Now component only loads once on mount (when user changes)

  const loadAdvancedStats = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // BUG 6 FIX: Query usage_tracking table (same table creditSystem uses)
      // This ensures displayed usage matches actual tracking
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

      // FIX: Use maybeSingle() to handle case where no row exists yet
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', currentPeriod)
        .maybeSingle();

      if (usageError) {
        console.warn('Usage tracking query error:', usageError);
      }

      // Extract usage from correct columns (defaults to 0 if no data)
      const aiCoachUsed = usageData?.answer_assistant || 0;
      const livePrompterUsed = usageData?.live_prompter_questions || 0;
      console.log('📊 Usage Dashboard loaded:', { aiCoachUsed, livePrompterUsed, usageData });

      // Get all practice history for advanced metrics
      const { data: allSessions, count: totalCount } = await supabase
        .from('practice_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Get interview date
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('interview_date')
        .eq('user_id', user.id)
        .single();

      // BETA FIX: Beta users should be treated as Pro (unlimited access)
      const isProUser = userTier === 'pro' || userTier === 'beta';

      // CALCULATE ADVANCED METRICS
      const { 
        readinessScore, 
        averageScore, 
        improvementRate,
        predictedSuccess,
        weakestArea,
        strongestArea,
        level,
        xp,
        achievements
      } = calculateAdvancedMetrics(allSessions || []);

      // Calculate days until interview
      // BUG 2 FIX: Normalize both dates to midnight to avoid timezone/partial-day off-by-one
      let daysUntil = null;
      if (userData?.interview_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interviewDate = new Date(userData.interview_date);
        interviewDate.setHours(0, 0, 0, 0);
        const diffTime = interviewDate.getTime() - today.getTime();
        daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));
      }

      setStats({
        aiCoach: { 
          used: aiCoachUsed, 
          limit: isProUser ? 999 : 5 
        },
        livePrompter: { 
          used: livePrompterUsed, 
          limit: isProUser ? 999 : 5 
        },
        totalSessions: totalCount || 0,
        streak: calculateStreak(allSessions || []),
        readinessScore,
        averageScore,
        improvementRate,
        predictedSuccess,
        weakestArea,
        strongestArea,
        daysUntilInterview: daysUntil,
        level,
        xp,
        achievements
      });

      // Celebration for milestones!
      if (readinessScore >= 90 || level >= 5) {
        setCelebrationMode(true);
        setTimeout(() => setCelebrationMode(false), 3000);
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ADVANCED CALCULATIONS - COMPETITORS DON'T HAVE THIS!
  const calculateAdvancedMetrics = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        readinessScore: 0,
        averageScore: 0,
        improvementRate: 0,
        predictedSuccess: 50,
        weakestArea: 'Not enough data',
        strongestArea: 'Keep practicing!',
        level: 1,
        xp: 0,
        achievements: []
      };
    }

    // Calculate average score
    const scoresWithData = sessions.filter(s => s.feedback?.overall || s.feedback?.match_percentage);
    const avgScore = scoresWithData.length > 0
      ? scoresWithData.reduce((sum, s) => sum + (s.feedback?.overall || s.feedback?.match_percentage / 10), 0) / scoresWithData.length
      : 0;

    // Calculate improvement rate (last 5 vs previous 5)
    let improvementRate = 0;
    if (scoresWithData.length >= 10) {
      const recent = scoresWithData.slice(0, 5);
      const previous = scoresWithData.slice(5, 10);
      const recentAvg = recent.reduce((sum, s) => sum + (s.feedback?.overall || s.feedback?.match_percentage / 10), 0) / 5;
      const previousAvg = previous.reduce((sum, s) => sum + (s.feedback?.overall || s.feedback?.match_percentage / 10), 0) / 5;
      improvementRate = ((recentAvg - previousAvg) / previousAvg) * 100;
    }

    // Calculate readiness score (0-100)
    const readinessScore = Math.min(100, Math.round(
      (avgScore * 10) + // Base score
      (sessions.length * 2) + // Practice volume
      (Math.max(0, improvementRate) / 2) // Improvement bonus
    ));

    // Predict success probability
    const predictedSuccess = Math.min(95, Math.max(40, 
      readinessScore * 0.8 + (sessions.length >= 20 ? 15 : sessions.length * 0.75)
    ));

    // Analyze categories for strengths/weaknesses
    const categoryScores = {};
    sessions.forEach(session => {
      const category = session.category || 'General';
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0 };
      }
      const score = session.feedback?.overall || session.feedback?.match_percentage / 10 || 0;
      categoryScores[category].total += score;
      categoryScores[category].count += 1;
    });

    const categoryAverages = Object.entries(categoryScores).map(([cat, data]) => ({
      category: cat,
      avg: data.total / data.count
    }));

    const weakestArea = categoryAverages.length > 0
      ? categoryAverages.sort((a, b) => a.avg - b.avg)[0]?.category || 'Unknown'
      : 'Not enough data';

    const strongestArea = categoryAverages.length > 0
      ? categoryAverages.sort((a, b) => b.avg - a.avg)[0]?.category || 'Unknown'
      : 'Keep practicing!';

    // Calculate level and XP (gamification!)
    const xp = sessions.length * 100 + Math.round(avgScore * 50);
    const level = Math.floor(xp / 500) + 1;

    // Award achievements
    const achievements = [];
    if (sessions.length >= 10) achievements.push({ id: 'sessions-10', name: 'Practice Pro', icon: '🎯' });
    if (sessions.length >= 50) achievements.push({ id: 'sessions-50', name: 'Interview Master', icon: '🏆' });
    if (avgScore >= 8.5) achievements.push({ id: 'high-scorer', name: 'Excellence', icon: '⭐' });
    if (improvementRate > 20) achievements.push({ id: 'improver', name: 'Rising Star', icon: '📈' });
    if (readinessScore >= 90) achievements.push({ id: 'ready', name: 'Interview Ready', icon: '✨' });

    return {
      readinessScore,
      averageScore: avgScore,
      improvementRate,
      predictedSuccess: Math.round(predictedSuccess),
      weakestArea,
      strongestArea,
      level,
      xp,
      achievements
    };
  };

  const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const hasSessionThatDay = sessions.some(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
      
      if (hasSessionThatDay) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-amber-600';
    if (score >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-rose-600';
  };

  const getReadinessMessage = (score) => {
    if (score >= 90) return "🎉 You're interview-ready! You've got this!";
    if (score >= 75) return "💪 Almost there! A few more sessions and you'll ace it!";
    if (score >= 50) return "📈 Great progress! Keep building momentum!";
    if (score >= 25) return "🚀 Good start! Practice makes perfect!";
    return "🌱 Just getting started! Every expert was once a beginner!";
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative mb-4">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Brain className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-lg text-gray-600 font-semibold animate-pulse">
          Analyzing your interview readiness...
        </p>
      </div>
    );
  }

  // BETA FIX: Beta users should see Pro dashboard (unlimited access)
  if (userTier === 'pro' || userTier === 'beta') {
    return (
      <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
        {/* Pro Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mb-4 relative">
            <Crown className="w-16 h-16 text-amber-500" />
            {celebrationMode && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Pro Level {stats.level} 👑
          </h2>
          <p className="text-lg text-gray-600">
            Unlimited everything, forever!
          </p>
        </div>

        {/* READINESS SCORE - MEGA FEATURE! */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 mb-1">Interview Readiness</p>
                <h3 className="text-5xl font-black">{stats.readinessScore}%</h3>
              </div>
              <div className="text-6xl">
                {stats.readinessScore >= 80 ? '🔥' : stats.readinessScore >= 60 ? '💪' : '📈'}
              </div>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${stats.readinessScore}%` }}
              ></div>
            </div>
            <p className="text-white/90">{getReadinessMessage(stats.readinessScore)}</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            icon={<Target className="w-6 h-6" />}
            label="Avg Score"
            value={stats.averageScore.toFixed(1)}
            color="blue"
          />
          <MetricCard 
            icon={<TrendingUp className="w-6 h-6" />}
            label="Improvement"
            value={`${stats.improvementRate >= 0 ? '+' : ''}${stats.improvementRate.toFixed(0)}%`}
            color="green"
            trend={stats.improvementRate >= 0 ? 'up' : 'down'}
          />
          <MetricCard 
            icon={<Trophy className="w-6 h-6" />}
            label="Level"
            value={stats.level}
            color="amber"
          />
          <MetricCard 
            icon={<Flame className="w-6 h-6" />}
            label="Streak"
            value={`${stats.streak} days`}
            color="red"
          />
        </div>

        {/* Predictive Analytics - GAME CHANGER! */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Brain className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">AI Success Prediction</h3>
              <p className="text-sm text-gray-600">Based on your practice patterns</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-green-600">{stats.predictedSuccess}%</p>
              <p className="text-xs text-gray-600">success rate</p>
            </div>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
              style={{ width: `${stats.predictedSuccess}%` }}
            ></div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-gray-900">Strongest Area</h3>
            </div>
            <p className="text-2xl font-black text-green-600">{stats.strongestArea}</p>
            <p className="text-sm text-gray-600 mt-2">Keep dominating here! 💪</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-gray-900">Focus Area</h3>
            </div>
            <p className="text-2xl font-black text-orange-600">{stats.weakestArea}</p>
            <p className="text-sm text-gray-600 mt-2">Practice this more! 🎯</p>
          </div>
        </div>

        {/* PRO UNLIMITED ACCESS - Clear Feature Display */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-300 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-600" />
            Your Unlimited Pro Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <UnlimitedFeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Coach Sessions"
              description="Unlimited AI-powered interview coaching"
              color="indigo"
            />
            <UnlimitedFeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Live Prompter"
              description="Unlimited real-time interview support"
              color="green"
            />
            <UnlimitedFeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Practice Mode"
              description="Unlimited quick practice sessions"
              color="blue"
            />
            <UnlimitedFeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Question Generator"
              description="Unlimited custom questions"
              color="purple"
            />
          </div>
        </div>

        {/* Achievements */}
        {stats.achievements.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Your Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-lg px-4 py-2 border-2 border-purple-200 flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="font-semibold text-gray-700">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // FREE USER VERSION - Still Amazing!
  return (
    <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
      {/* Header with Readiness */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
          Your Interview Dashboard 🎯
        </h2>
        
        {/* MEGA READINESS SCORE */}
        <div className={`bg-gradient-to-br ${getReadinessColor(stats.readinessScore)} rounded-2xl p-8 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2">Interview Readiness Score</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-6xl md:text-7xl font-black">{stats.readinessScore}</div>
              <div className="text-4xl">
                {stats.readinessScore >= 80 ? '🔥' : stats.readinessScore >= 60 ? '💪' : '📈'}
              </div>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-4 max-w-md mx-auto">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${stats.readinessScore}%` }}
              ></div>
            </div>
            <p className="text-lg">{getReadinessMessage(stats.readinessScore)}</p>
          </div>
        </div>
      </div>

      {/* AI Prediction */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Brain className="w-10 h-10 text-blue-600" />
          <div className="flex-1">
            <h3 className="font-bold text-lg">AI Success Prediction</h3>
            <p className="text-sm text-gray-600">Your chance of acing it</p>
          </div>
          <div className="text-4xl font-black text-blue-600">{stats.predictedSuccess}%</div>
        </div>
      </div>

      {/* Interview Countdown */}
      {stats.daysUntilInterview !== null && (
        <div className={`rounded-xl p-6 mb-6 ${
          stats.daysUntilInterview <= 3 
            ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200' 
            : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200'
        }`}>
          <div className="flex items-center gap-4">
            <Calendar className="w-10 h-10 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">Interview Countdown</h3>
              <p className="text-3xl font-black text-purple-600">{stats.daysUntilInterview} days</p>
            </div>
            {stats.daysUntilInterview <= 3 && (
              <div className="text-4xl animate-pulse">🔥</div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard 
          icon={<Activity className="w-5 h-5" />}
          label="Avg Score"
          value={stats.averageScore.toFixed(1)}
          subtext="/10"
          color="blue"
        />
        <MetricCard 
          icon={<TrendingUp className="w-5 h-5" />}
          label="Improving"
          value={`${stats.improvementRate >= 0 ? '+' : ''}${stats.improvementRate.toFixed(0)}%`}
          color="green"
          trend={stats.improvementRate >= 0 ? 'up' : stats.improvementRate < 0 ? 'down' : 'stable'}
        />
        <MetricCard 
          icon={<Trophy className="w-5 h-5" />}
          label="Level"
          value={stats.level}
          subtext={`${stats.xp} XP`}
          color="amber"
        />
        <MetricCard 
          icon={<Flame className="w-5 h-5" />}
          label="Streak"
          value={stats.streak}
          subtext="days"
          color="red"
        />
      </div>

      {/* Usage Cards */}
      <div className="space-y-4 mb-6">
        <UsageCard 
          icon={<Sparkles className="w-6 h-6" />}
          title="AI Coach"
          used={stats.aiCoach.used}
          limit={stats.aiCoach.limit}
          color="indigo"
        />
        <UsageCard 
          icon={<Zap className="w-6 h-6" />}
          title="Live Prompter"
          used={stats.livePrompter.used}
          limit={stats.livePrompter.limit}
          color="green"
        />
      </div>

      {/* Smart Insights */}
      <button
        onClick={() => setShowInsights(!showInsights)}
        className="w-full bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6 hover:from-purple-200 hover:to-pink-200 transition-all border-2 border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-gray-900">AI Insights & Recommendations</span>
          </div>
          <span className="text-2xl">{showInsights ? '🔽' : '▶️'}</span>
        </div>
      </button>

      {showInsights && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          <InsightCard 
            icon="🎯"
            title="Focus Area"
            message={`Practice more ${stats.weakestArea} questions to boost your score!`}
            color="orange"
          />
          <InsightCard 
            icon="💪"
            title="Strength"
            message={`You're crushing ${stats.strongestArea}! Keep it up!`}
            color="green"
          />
          {stats.improvementRate > 10 && (
            <InsightCard 
              icon="📈"
              title="Rising Star"
              message={`Your scores improved ${stats.improvementRate.toFixed(0)}% recently. Amazing progress!`}
              color="blue"
            />
          )}
        </div>
      )}

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            Achievements Unlocked
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="bg-white rounded-lg px-4 py-2 border-2 border-amber-300 flex items-center gap-2 hover:scale-105 transition-transform shadow-sm"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="font-semibold text-gray-700 text-sm">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Crown className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg mb-1">Unlock Your Full Potential</h3>
            <p className="text-white/90 text-sm">
              Unlimited practice, advanced analytics, and more for $29.99/month
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg whitespace-nowrap"
          >
            Go Pro Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ icon, label, value, subtext, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    amber: 'from-amber-50 to-yellow-50 border-amber-200',
    red: 'from-red-50 to-pink-50 border-red-200'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border-2`}>
      <div className={`${iconColors[color]} mb-2`}>{icon}</div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-2xl font-black ${iconColors[color]}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
        {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
      </div>
    </div>
  );
};

const UsageCard = ({ icon, title, used, limit, color }) => {
  const percentage = (used / limit) * 100;
  const colorClasses = {
    indigo: 'from-indigo-400 to-purple-500',
    green: 'from-green-400 to-emerald-500'
  };

  return (
    <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-gray-200 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${color === 'indigo' ? 'bg-indigo-100' : 'bg-green-100'} rounded-lg`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${color === 'indigo' ? 'text-indigo-600' : 'text-green-600'}` })}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Today's usage</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">
            {used}<span className="text-gray-400 text-lg">/{limit}</span>
          </p>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const InsightCard = ({ icon, title, message, color }) => {
  const colorClasses = {
    orange: 'from-orange-50 to-red-50 border-orange-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    blue: 'from-blue-50 to-indigo-50 border-blue-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 border-2`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

// PRO USER UNLIMITED FEATURE CARD - Shows "UNLIMITED" clearly
const UnlimitedFeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`bg-white rounded-xl p-4 border-2 ${colors.border} hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${colors.bg} rounded-lg`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${colors.text}` })}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center mt-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg">
        <span className="text-white font-black text-lg tracking-wide flex items-center gap-2">
          ∞ UNLIMITED
        </span>
      </div>
    </div>
  );
};

export default UltimateCompetitiveDashboard;
