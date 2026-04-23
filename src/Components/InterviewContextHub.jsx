/**
 * InterviewContextHub.jsx — The central place to set up and view your interview context.
 *
 * Replaces the old Prep tab (countdown + daily goal) with an inline-editable
 * interview setup that reads/writes the SAME localStorage keys as QuestionAssistant.
 * No new data layer, no new API — just a better front door.
 */

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Building2, Briefcase, FileText, User, ChevronDown, ChevronUp, Sparkles, Play, Target, Edit2, Check, AlertCircle, BookOpen, Search } from 'lucide-react';
import CompanyBrief from './Intelligence/CompanyBrief';

// Same localStorage keys as QuestionAssistant.jsx
const CONTEXT_KEY = 'isl_question_context';
const DATE_KEY = 'isl_interview_date';
const GOAL_KEY = 'isl_daily_goal';

function InterviewContextHub({
  questions = [],
  practiceHistory = [],
  dailyGoal,
  setDailyGoal,
  interviewDate,
  setInterviewDate,
  setCurrentView,
  onGenerateQuestions,
}) {
  // Interview context fields (synced with QuestionAssistant's localStorage)
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [background, setBackground] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTEXT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setRole(data.role || '');
        setCompany(data.comp || '');
        setInterviewType(data.type || '');
        setBackground(data.bg || '');
        setJobDescription(data.jd || '');
      }
    } catch (err) {
      console.error('Error loading interview context:', err);
    }
  }, []);

  // Auto-save to localStorage when context changes
  const saveContext = useCallback(() => {
    const data = { role, comp: company, type: interviewType, bg: background, jd: jobDescription };
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(data));
  }, [role, company, interviewType, background, jobDescription]);

  useEffect(() => {
    // Only auto-save if we have some data (don't overwrite with empty on mount)
    if (role || company || interviewType || background || jobDescription) {
      saveContext();
    }
  }, [role, company, interviewType, background, jobDescription, saveContext]);

  // Calculate days until interview
  const getDaysUntil = () => {
    if (!interviewDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interview = new Date(interviewDate + 'T00:00:00');
    const diffTime = interview.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays + 1);
  };

  const daysUntil = getDaysUntil();
  const hasContext = role || company;
  const todaysSessions = practiceHistory.filter(
    s => new Date(s.date).toDateString() === new Date().toDateString()
  ).length;
  const goalProgress = dailyGoal > 0 ? Math.min(100, (todaysSessions / dailyGoal) * 100) : 0;

  // Category mastery calculation
  const practicedQuestionTexts = new Set(practiceHistory.map(s => s.question));
  const categories = ['Core Narrative', 'System-Level', 'Behavioral', 'Technical'];

  return (
    <div className="space-y-5">
      {/* ========== INTERVIEW CONTEXT CARD ========== */}
      {!hasContext && !isEditing ? (
        /* Empty state — nudge to set up */
        <div
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300 p-6 cursor-pointer hover:border-amber-400 transition-all"
          onClick={() => setIsEditing(true)}
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-warm-800 mb-1">Tell me about your interview</h3>
            <p className="text-sm text-warm-500 mb-4">
              Set up your role, company, and background so your practice is personalized.
            </p>
            <button className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl text-sm hover:from-teal-600 hover:to-emerald-600 transition-all active:scale-[0.97]">
              Set Up My Interview
            </button>
          </div>
        </div>
      ) : isEditing ? (
        /* Editing mode — inline form */
        <div className="bg-white rounded-2xl shadow-md border border-warm-200/60 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-warm-800">Interview Setup</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              <Check className="w-4 h-4" /> Done
            </button>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              <Building2 className="w-4 h-4 inline mr-1.5 opacity-60" />Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Stanford Health Care"
              className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              <Briefcase className="w-4 h-4 inline mr-1.5 opacity-60" />Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Nurse Manager"
              className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
            />
          </div>

          {/* Interview Date */}
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5 opacity-60" />Interview Date
            </label>
            <input
              type="date"
              value={interviewDate || ''}
              onChange={(e) => {
                setInterviewDate(e.target.value);
                localStorage.setItem(DATE_KEY, e.target.value);
              }}
              className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all"
            />
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              <Target className="w-4 h-4 inline mr-1.5 opacity-60" />Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all bg-white"
            >
              <option value="">Select type...</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="panel">Panel</option>
              <option value="phone-screen">Phone Screen</option>
              <option value="case-study">Case Study</option>
              <option value="mixed">Mixed / General</option>
            </select>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5 opacity-60" />Your Background
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Briefly describe your experience, skills, and what makes you a good fit..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all resize-none"
            />
          </div>

          {/* Job Description (collapsible) */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-sm font-medium text-warm-500 hover:text-warm-700 transition-colors"
            >
              <FileText className="w-4 h-4 opacity-60" />
              Job Description (optional)
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDetails && (
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for more targeted AI feedback..."
                rows={4}
                className="w-full mt-2 px-3.5 py-2.5 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all resize-none"
              />
            )}
          </div>
        </div>
      ) : (
        /* Display mode — show current context with edit button */
        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-5 text-white relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 opacity-80" />
                  <span className="text-sm font-medium text-white/80">Interviewing at</span>
                </div>
                <h3 className="text-xl font-bold">{company || 'Your Company'}</h3>
                <p className="text-sm text-white/90 mt-0.5">
                  {role || 'Your Role'}
                  {interviewType && ` \u00b7 ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1).replace('-', ' ')}`}
                </p>
              </div>

              {/* Countdown badge */}
              {daysUntil !== null && (
                <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center min-w-[80px]">
                  <div className="text-3xl font-black">{daysUntil}</div>
                  <div className="text-xs text-white/90 font-semibold">
                    {daysUntil === 1 ? 'day left' : 'days left'}
                  </div>
                </div>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 mt-1 mr-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Edit interview details"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setCurrentView && setCurrentView('practice')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              >
                <Play className="w-3.5 h-3.5" /> Practice Now
              </button>
              {jobDescription && (
                <button
                  onClick={() => setCurrentView && setCurrentView('jd-decoder')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                >
                  <Search className="w-3.5 h-3.5" /> Decode JD
                </button>
              )}
              {questions.length === 0 && onGenerateQuestions && (
                <button
                  onClick={onGenerateQuestions}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Questions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== DAILY GOAL + PROGRESS ========== */}
      <div className="bg-white rounded-2xl shadow-md border border-warm-200/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-warm-800 flex items-center gap-2">
            <Target className="w-4.5 h-4.5 text-teal-600" /> Daily Goal
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newVal = Math.max(1, dailyGoal - 1);
                setDailyGoal(newVal);
                localStorage.setItem(GOAL_KEY, String(newVal));
              }}
              className="w-8 h-8 rounded-lg bg-warm-100 hover:bg-warm-200 text-warm-600 font-bold text-sm flex items-center justify-center transition-colors"
            >-</button>
            <span className="w-8 text-center font-bold text-warm-800">{dailyGoal}</span>
            <button
              onClick={() => {
                const newVal = Math.min(20, dailyGoal + 1);
                setDailyGoal(newVal);
                localStorage.setItem(GOAL_KEY, String(newVal));
              }}
              className="w-8 h-8 rounded-lg bg-warm-100 hover:bg-warm-200 text-warm-600 font-bold text-sm flex items-center justify-center transition-colors"
            >+</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-warm-100 rounded-full h-3 mb-1.5">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-500">{todaysSessions} of {dailyGoal} sessions today</span>
          {todaysSessions >= dailyGoal && (
            <span className="text-emerald-600 font-bold">Goal reached!</span>
          )}
        </div>
      </div>

      {/* ========== CATEGORY MASTERY ========== */}
      <div className="bg-white rounded-2xl shadow-md border border-warm-200/60 p-5">
        <h3 className="text-base font-bold text-warm-800 mb-3">Category Progress</h3>
        <div className="space-y-3">
          {categories.map(category => {
            const categoryQuestions = questions.filter(q => q.category === category);
            const total = categoryQuestions.length;
            const practiced = categoryQuestions.filter(q => practicedQuestionTexts.has(q.question)).length;
            const percentage = total > 0 ? (practiced / total) * 100 : 0;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-warm-700">{category}</span>
                  <span className="text-xs text-warm-500 font-medium">{practiced}/{total}</span>
                </div>
                <div className="w-full bg-warm-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percentage === 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : percentage >= 50
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        : percentage > 0
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                        : 'bg-warm-200'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              No questions in your bank yet. Add some questions to track your category progress.
            </p>
          </div>
        )}
      </div>

      {/* ========== COMPANY BRIEF (auto-renders when company is set) ========== */}
      {company && (
        <CompanyBrief
          companyName={company}
          getUserContext={() => ({ targetRole: role, targetCompany: company, background, jobDescription, interviewType })}
        />
      )}
    </div>
  );
}

export default InterviewContextHub;
