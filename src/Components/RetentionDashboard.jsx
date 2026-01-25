import React from 'react';

const RetentionDashboard = ({ 
  practiceHistory, 
  questions, 
  interviewDate,
  setCurrentView,
  setCommandCenterTab 
}) => {
  
  // ==========================================
  // RETENTION-FOCUSED METRICS
  // ==========================================
  
  const totalSessions = practiceHistory.length;
  const questionsCount = questions.length;
  
  // Calculate streak (consecutive days of practice)
  const calculateStreak = () => {
    if (practiceHistory.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = practiceHistory
      .map(session => {
        const date = new Date(session.date || session.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((date, index, self) => self.indexOf(date) === index) // unique dates
      .sort((a, b) => b - a); // newest first
    
    let streak = 0;
    let currentDate = today.getTime();
    
    for (const date of sortedDates) {
      if (date === currentDate || date === currentDate - 86400000) {
        streak++;
        currentDate = date - 86400000; // move to previous day
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Calculate unique questions practiced
  const getUniqueQuestionsPracticed = () => {
    const uniqueQuestions = new Set(
      practiceHistory.map(session => session.question_id).filter(Boolean)
    );
    return uniqueQuestions.size;
  };
  
  // Calculate weekly improvement
  const calculateWeeklyImprovement = () => {
    if (practiceHistory.length < 2) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentSessions = practiceHistory
      .filter(s => new Date(s.date || s.created_at) > oneWeekAgo)
      .map(s => s.ai_feedback?.overall || s.score || 0)
      .filter(score => score > 0);
    
    const olderSessions = practiceHistory
      .filter(s => new Date(s.date || s.created_at) <= oneWeekAgo)
      .map(s => s.ai_feedback?.overall || s.score || 0)
      .filter(score => score > 0);
    
    if (recentSessions.length === 0 || olderSessions.length === 0) return 0;
    
    const recentAvg = recentSessions.reduce((a, b) => a + b, 0) / recentSessions.length;
    const olderAvg = olderSessions.reduce((a, b) => a + b, 0) / olderSessions.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  };
  
  // Get next achievement
  const getNextAchievement = () => {
    if (totalSessions < 10) return { name: "Practice Pro", emoji: "🎯", need: 10 - totalSessions };
    if (totalSessions < 50) return { name: "Master", emoji: "🏆", need: 50 - totalSessions };
    return { name: "Legend", emoji: "👑", need: 100 - totalSessions };
  };
  
  // Calculate all metrics
  const streak = calculateStreak();
  const questionsCompleted = getUniqueQuestionsPracticed();
  const weeklyImprovement = calculateWeeklyImprovement();
  const nextAchievement = getNextAchievement();
  const daysUntilInterview = interviewDate 
    ? Math.max(0, Math.ceil((new Date(interviewDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))
    : null;
  
  // Don't show if no data
  if (questionsCount === 0 && totalSessions === 0) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-white/30 shadow-2xl">
      
      {/* Streak Counter (if exists) */}
      {streak > 0 && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 border-2 border-orange-400/50 rounded-2xl px-6 py-4">
            <span className="text-4xl">🔥</span>
            <div className="text-left">
              <div className="text-3xl font-black text-white">{streak} Day Streak</div>
              <div className="text-sm text-white/90 font-bold">Don't break it! Practice today!</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Question Progress */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📚</span>
            <h4 className="text-white font-bold text-sm">Question Bank</h4>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {questionsCompleted}/{questionsCount}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (questionsCompleted / Math.max(1, questionsCount)) * 100)}%` }}
            />
          </div>
          <p className="text-white/80 text-xs font-semibold">
            {questionsCount - questionsCompleted > 0 
              ? `Practice ${questionsCount - questionsCompleted} more to master all!`
              : `All questions practiced! 🎉`
            }
          </p>
        </div>
        
        {/* Interview Countdown */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📅</span>
            <h4 className="text-white font-bold text-sm">Interview</h4>
          </div>
          {daysUntilInterview !== null ? (
            <>
              <div className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                {daysUntilInterview}
                {daysUntilInterview <= 3 && <span className="text-2xl animate-pulse">🔥</span>}
              </div>
              <p className="text-white/80 text-xs font-semibold">
                {daysUntilInterview === 0 ? "Today's the day! You got this!" :
                 daysUntilInterview === 1 ? "Tomorrow! Final practice today!" :
                 daysUntilInterview <= 3 ? "Days left - time to shine!" :
                 "Days away - keep practicing!"}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-white mb-2">—</div>
              <button
                onClick={() => {
                  setCurrentView('command-center');
                  setCommandCenterTab('prep');
                }}
                className="text-blue-300 hover:text-blue-200 text-xs font-bold underline"
              >
                Set your date →
              </button>
            </>
          )}
        </div>
        
        {/* Weekly Improvement */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <h4 className="text-white font-bold text-sm">This Week</h4>
          </div>
          {weeklyImprovement !== 0 ? (
            <>
              <div className={`text-3xl font-black mb-2 ${weeklyImprovement > 0 ? 'text-green-300' : 'text-orange-300'}`}>
                {weeklyImprovement > 0 ? '+' : ''}{weeklyImprovement}%
              </div>
              <p className="text-white/80 text-xs font-semibold">
                {weeklyImprovement > 0 
                  ? "Score improvement - great work!"
                  : "Focus on quality practice!"
                }
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-white mb-2">{totalSessions}</div>
              <p className="text-white/80 text-xs font-semibold">
                Total practice sessions
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Achievement Progress */}
      {nextAchievement && nextAchievement.need > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{nextAchievement.emoji}</span>
              <div>
                <div className="text-white font-black text-base">Almost unlocked: {nextAchievement.name}</div>
                <div className="text-white/80 text-sm font-semibold">{nextAchievement.need} more sessions to go!</div>
              </div>
            </div>
            <div className="text-3xl font-black text-white/50">{totalSessions}/{totalSessions + nextAchievement.need}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionDashboard;
