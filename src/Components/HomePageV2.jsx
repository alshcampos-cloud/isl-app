/**
 * HomePageV2.jsx
 *
 * NEW home page layout following the Hero + Feed pattern (Headspace/Duolingo/Noom style).
 * Replaces the "panel of panels" dashboard with a single-column mobile-first feed that uses
 * varied visual treatment (hero, squares, cards, dark strips) to create dashboard rhythm.
 *
 * This is a STANDALONE component. It is NOT yet wired into App.jsx. Once approved, a single
 * import + render replacement in App.jsx home view will swap layouts.
 *
 * All data + action handlers are passed via props. No local state, no side effects.
 *
 * Per Battle Scar #1: DO NOT add this to App.jsx. Keep it isolated here.
 * Per Battle Scar #16: Every interactive element uses onClick AND onTouchEnd.
 */

import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import {
  PrompterIcon, InterviewerIcon, PracticeIcon, FlashcardIcon,
  LearnIcon, RadioIcon, CoachIcon, DecoderIcon, StoryBankIcon, StarDrillIcon,
  PortfolioIcon, InterviewDayIcon, FollowUpIcon, NotesIcon, FlashcardCompactIcon,
  CommandCenterIcon, IconContainer,
  QuestionsStatIcon, SessionsStatIcon, UnlimitedStatIcon, DaysStatIcon, StreakStatIcon
} from './icons/FeatureIcons';
import IRSDisplay from './IRS/IRSDisplay';
import StreakDisplay from './Streaks/StreakDisplay';
import ScoreTrendSparkline from './Intelligence/ScoreTrendSparkline';
import JourneyProgress from './Intelligence/JourneyProgress';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

function daysUntilDate(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

function averageScore(practiceHistory) {
  if (!practiceHistory || practiceHistory.length === 0) return null;
  const scores = practiceHistory.map(s => s.score || s.averageScore || 0).filter(Boolean);
  if (scores.length === 0) return null;
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

const touch = (fn) => ({ onClick: fn, onTouchEnd: fn });

export default function HomePageV2({
  currentUser,
  userData,
  userTier,
  questions = [],
  practiceHistory = [],
  activeGroups,
  streakRefreshTrigger = 0,
  interviewDate = null,
  onStartPractice = () => {},
  onStartAIInterviewer = () => {},
  onStartPrompter = () => {},
  onStartFlashcard = () => {},
  onNavigate = () => {},
  onOpenCoachPanel = () => {},
  onOpenUsageDashboard = () => {},
  onOpenPricing = () => {},
  onOpenProfileMenu = () => {},
}) {
  const firstName = (currentUser?.user_metadata?.first_name
    || currentUser?.user_metadata?.full_name?.split(' ')[0]
    || currentUser?.email?.split('@')[0]
    || 'there');

  const daysUntil = daysUntilDate(interviewDate);
  const avg = averageScore(practiceHistory);
  const sessionCount = practiceHistory.length;
  const questionCount = questions.length;
  const streakCount = userData?.streak?.current_streak || 0;
  const usage = userData?.usage || {};
  const isPro = userTier === 'pro' || userTier === 'unlimited';

  // Hero subtitle
  let heroSubtitle;
  if (sessionCount === 0) {
    heroSubtitle = 'Start your first session — it takes 5 minutes';
  } else if (daysUntil !== null && daysUntil <= 7) {
    heroSubtitle = `${daysUntil} day${daysUntil === 1 ? '' : 's'} until your interview. Let's go.`;
  } else {
    heroSubtitle = avg
      ? `Your average is ${avg}/10. Keep building momentum.`
      : 'Keep building momentum.';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 space-y-6">

      {/* 1. GREETING STRIP */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              {getGreeting()}, {firstName}
            </div>
            <div className="text-xs text-slate-500">{formatToday()}</div>
          </div>
          {streakCount > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Zap size={12} className="fill-amber-500 text-amber-500" />
              {streakCount} day{streakCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
        <button
          {...touch(onOpenProfileMenu)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-semibold flex items-center justify-center shadow-sm hover:shadow transition-shadow"
          aria-label="Profile menu"
        >
          {firstName.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* 2. HERO ACTION CARD */}
      <button
        {...touch(onStartPractice)}
        className="relative w-full aspect-[3/1] md:aspect-[4/1] rounded-3xl overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 shadow-2xl shadow-teal-500/20 text-left p-6 md:p-12 flex items-center justify-between group hover:shadow-teal-500/30 transition-shadow"
      >
        <div className="relative z-10 max-w-xl">
          <div className="text-white text-xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2 md:mb-3">
            Ready for your next practice?
          </div>
          <div className="text-teal-50 text-sm md:text-base mb-4 md:mb-6">
            {heroSubtitle}
          </div>
          <div className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg group-hover:scale-105 transition-transform text-sm md:text-base">
            Start Today's Practice
            <ChevronRight size={18} />
          </div>
        </div>
        <div className="hidden md:block relative z-10 opacity-90">
          <PracticeIcon size={120} gradient="teal" />
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl" />
      </button>

      {/* 3. IRS + STREAK PAIR */}
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <IRSDisplay refreshTrigger={streakRefreshTrigger} />
        </div>
        <div className="aspect-square bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <StreakDisplay refreshTrigger={streakRefreshTrigger} variant="light" />
        </div>
      </div>

      {/* 4. STAT CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          {...touch(() => onNavigate('command-center'))}
          className="aspect-square bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center text-center hover:border-teal-300 transition-colors"
        >
          <QuestionsStatIcon size={22} className="mb-1" />
          <div className="text-2xl font-bold text-slate-900 leading-none">{questionCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Questions</div>
        </button>
        <div className="aspect-square bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center text-center">
          <SessionsStatIcon size={22} className="mb-1" />
          <div className="text-2xl font-bold text-slate-900 leading-none">{sessionCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Sessions</div>
        </div>
        <button
          {...touch(onOpenUsageDashboard)}
          className="aspect-square bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center text-center hover:border-amber-300 transition-colors"
        >
          <UnlimitedStatIcon size={22} className="mb-1" />
          <div className="text-lg font-bold text-slate-900 leading-none">
            {isPro ? '∞' : (usage?.practice_sessions || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
            {isPro ? 'Unlimited' : 'Usage'}
          </div>
        </button>
        <button
          {...touch(() => onNavigate('command-center'))}
          className="aspect-square bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center text-center hover:border-slate-400 transition-colors"
        >
          <DaysStatIcon size={22} className="mb-1" />
          <div className="text-2xl font-bold text-slate-900 leading-none">
            {daysUntil !== null ? daysUntil : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Days</div>
        </button>
        <div className="aspect-square bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center text-center">
          <StreakStatIcon size={22} className="mb-1" />
          <div className="text-2xl font-bold text-slate-900 leading-none">{streakCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Streak</div>
        </div>
      </div>

      {/* 5. PRACTICE MODE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PracticeModeCard
          icon={<IconContainer color="teal" size="lg"><PrompterIcon size={28} /></IconContainer>}
          title="Practice Prompter"
          description="Real-time coaching as you practice"
          buttonLabel="Start Prompter"
          buttonClass="bg-gradient-to-r from-teal-500 to-emerald-500"
          onClick={onStartPrompter}
        />
        <PracticeModeCard
          icon={<IconContainer color="slate" size="lg"><InterviewerIcon size={28} /></IconContainer>}
          title="AI Interviewer"
          description="Full conversational mock interview"
          buttonLabel="Start Interview"
          buttonClass="bg-gradient-to-r from-slate-700 to-slate-900"
          onClick={onStartAIInterviewer}
        />
        <PracticeModeCard
          icon={<IconContainer color="teal" size="lg"><PracticeIcon size={28} /></IconContainer>}
          title="Practice"
          description="Self-paced with STAR feedback"
          buttonLabel="Start Practice"
          buttonClass="bg-gradient-to-r from-teal-500 to-emerald-500"
          onClick={onStartPractice}
        />
        <PracticeModeCard
          icon={<IconContainer color="amber" size="lg"><FlashcardIcon size={28} /></IconContainer>}
          title="Flashcards"
          description="Quick review of your answers"
          buttonLabel="Start Flashcards"
          buttonClass="bg-gradient-to-r from-amber-500 to-orange-500"
          onClick={onStartFlashcard}
        />
      </div>

      {/* 6. SCORE TREND */}
      {practiceHistory.length >= 2 && (
        <div className="w-full aspect-[16/9] bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
          <ScoreTrendSparkline
            practiceHistory={practiceHistory}
            onClick={() => onNavigate('command-center')}
          />
        </div>
      )}

      {/* 7. JOURNEY PROGRESS */}
      <div className="w-full">
        <JourneyProgress
          practiceHistory={practiceHistory}
          questions={questions}
          getUserContext={() => {}}
          onNavigate={onNavigate}
        />
      </div>

      {/* 8. LEARN & LISTEN */}
      <div className="grid grid-cols-2 gap-4">
        <button
          {...touch(() => onNavigate('learn'))}
          className="aspect-[3/2] sm:aspect-[2/1] rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 shadow-lg p-5 text-left flex flex-col justify-between text-white hover:shadow-xl transition-shadow"
        >
          <LearnIcon size={32} gradient="teal" />
          <div>
            <div className="text-lg font-bold">Learn</div>
            <div className="text-xs text-teal-100">20+ audio lessons</div>
          </div>
        </button>
        <button
          {...touch(() => onNavigate('prep-radio'))}
          className="aspect-[3/2] sm:aspect-[2/1] rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg p-5 text-left flex flex-col justify-between text-white hover:shadow-xl transition-shadow"
        >
          <RadioIcon size={32} gradient="navy" />
          <div>
            <div className="text-lg font-bold">Prep Radio</div>
            <div className="text-xs text-slate-300">8 playlists</div>
          </div>
        </button>
      </div>

      {/* 9. TOOLS GRID */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <ToolCard icon={<DecoderIcon size={24} gradient="teal" />} label="JD Decoder" onClick={() => onNavigate('jd-decoder')} />
        <ToolCard icon={<StoryBankIcon size={24} gradient="teal" />} label="Story Bank" onClick={() => onNavigate('story-bank')} />
        <ToolCard icon={<CoachIcon size={24} gradient="slate" />} label="AI Coach" onClick={onOpenCoachPanel} />
        <ToolCard icon={<StarDrillIcon size={24} gradient="amber" />} label="STAR Drill" onClick={() => onNavigate('weak-drill')} />
        <ToolCard icon={<PortfolioIcon size={24} gradient="slate" />} label="Portfolio" onClick={() => onNavigate('portfolio')} />
        <ToolCard icon={<InterviewDayIcon size={24} gradient="amber" />} label="Day Mode" onClick={() => onNavigate('interview-day')} />
        <ToolCard icon={<FollowUpIcon size={24} gradient="teal" />} label="Follow-Up" onClick={() => onNavigate('follow-up-email')} />
        <ToolCard icon={<FlashcardCompactIcon size={24} gradient="amber" />} label="Flashcards" onClick={onStartFlashcard} />
      </div>

      {/* 10. COMMAND CENTER BAR */}
      <button
        {...touch(() => onNavigate('command-center'))}
        className="w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 sm:p-6 shadow-md flex items-center justify-between text-left hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-4">
          <CommandCenterIcon size={32} gradient="teal" />
          <div>
            <div className="text-white font-bold text-base sm:text-lg">Command Center</div>
            <div className="text-slate-300 text-xs sm:text-sm">Track progress, manage questions</div>
          </div>
        </div>
        <ChevronRight size={24} className="text-slate-400" />
      </button>

    </div>
  );
}

/* --- Subcomponents --- */

function PracticeModeCard({ icon, title, description, buttonLabel, buttonClass, onClick }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
      <div className="aspect-[4/3] flex flex-col justify-between">
        <div>{icon}</div>
        <div>
          <div className="text-base font-bold text-slate-900 mb-1">{title}</div>
          <div className="text-xs text-slate-500 leading-snug">{description}</div>
        </div>
      </div>
      <button
        {...touch(onClick)}
        className={`mt-4 w-full ${buttonClass} text-white font-semibold py-2.5 rounded-lg text-sm shadow hover:shadow-md transition-shadow`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function ToolCard({ icon, label, onClick }) {
  return (
    <button
      {...touch(onClick)}
      className="aspect-square bg-white rounded-xl border border-slate-200/80 p-2 flex flex-col items-center justify-center gap-1.5 hover:border-teal-300 hover:bg-slate-50 transition-colors"
    >
      {icon}
      <div className="text-[11px] font-medium text-slate-700 text-center leading-tight">{label}</div>
    </button>
  );
}
