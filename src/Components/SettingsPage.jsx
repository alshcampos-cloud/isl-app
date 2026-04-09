import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, User, CreditCard, Shield, FileText,
  Scale, Mail, Star, RotateCcw, Trash2, LogOut, Info, ExternalLink,
  AlertTriangle, Loader2, CheckCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isNativeApp } from '../utils/platform';
import { restorePurchases } from '../utils/nativePurchases';
import { resetAllProgress } from '../utils/resetProgress';

// Tier display labels
const TIER_LABELS = {
  free: 'Free',
  beta: 'Beta Tester',
  pro: 'Pro',
  nursing_pass: 'Nursing Pass',
  general_pass: 'General Pass',
  annual: 'Annual All-Access',
};

// Tier badge styles
const TIER_BADGE_STYLES = {
  free: 'bg-slate-100 text-slate-600',
  beta: 'bg-purple-50 text-purple-700',
  pro: 'bg-teal-50 text-teal-700',
  nursing_pass: 'bg-teal-50 text-teal-700',
  general_pass: 'bg-indigo-50 text-indigo-700',
  annual: 'bg-amber-50 text-amber-700',
};

export default function SettingsPage({ user, userData, supabase: supabaseProp, onBack, onNavigate }) {
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDone, setDeleteDone] = useState(false);

  // Reset progress state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Sign out state
  const [loggingOut, setLoggingOut] = useState(false);

  // Restore purchases state
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);

  // Derive tier
  const tier = userData?.tier || 'free';
  const tierLabel = TIER_LABELS[tier] || tier;
  const email = user?.email || userData?.user?.email || 'Unknown';
  const userInitial = (email && email !== 'Unknown') ? email[0].toUpperCase() : '?';
  const tierBadgeStyle = TIER_BADGE_STYLES[tier] || TIER_BADGE_STYLES.free;

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign-out error:', err.message);
    }
    window.location.href = '/';
  };

  const handleResetProgress = async () => {
    const userId = user?.id || userData?.user?.id;
    if (!userId) return;

    setResetLoading(true);
    try {
      const result = await resetAllProgress(userId);
      if (result.success) {
        setResetDone(true);
        setShowResetConfirm(false);
        setTimeout(() => setResetDone(false), 3000);
      } else {
        console.warn('Reset had errors:', result.errors);
        setResetDone(true);
        setShowResetConfirm(false);
        setTimeout(() => setResetDone(false), 3000);
      }
    } catch (err) {
      console.error('Reset progress error:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = user?.id || userData?.user?.id;
    if (!userId) {
      setDeleteError('Unable to identify your account. Please sign out and back in.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      // Try Edge Function first (bypasses RLS)
      const { data, error: fnError } = await supabase.functions.invoke('delete-account');

      if (fnError) throw fnError;

      if (data?.success) {
        console.log('[AccountDeletion] Edge Function succeeded');
      } else {
        throw new Error(data?.error || 'Deletion failed');
      }

      // Clear localStorage
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('isl_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }

      await supabase.auth.signOut();
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeleteDone(true);
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch (err) {
      console.error('Account deletion error:', err);
      setDeleteError('Something went wrong. Please try again or contact support@interviewanswers.ai');
      setDeleteLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    const userId = user?.id || userData?.user?.id;
    if (!userId) return;

    setRestoring(true);
    setRestoreMessage(null);
    try {
      const result = await restorePurchases(userId);
      if (result.restored) {
        setRestoreMessage('Purchases restored successfully.');
      } else {
        setRestoreMessage(result.error || 'No active purchases found.');
      }
    } catch (err) {
      setRestoreMessage('Failed to restore purchases.');
    } finally {
      setRestoring(false);
      setTimeout(() => setRestoreMessage(null), 4000);
    }
  };

  // ── Icon color map per section ────────────────────────────────────

  const iconStyles = {
    User:       { bg: 'bg-teal-50',   text: 'text-teal-600' },
    CreditCard: { bg: 'bg-teal-50',   text: 'text-teal-600' },
    RefreshCw:  { bg: 'bg-teal-50',   text: 'text-teal-600' },
    Shield:     { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
    FileText:   { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
    Scale:      { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
    Mail:       { bg: 'bg-sky-50',     text: 'text-sky-600' },
    Star:       { bg: 'bg-amber-50',   text: 'text-amber-600' },
    Info:       { bg: 'bg-slate-100',  text: 'text-slate-500' },
  };

  const getIconStyle = (iconName) => iconStyles[iconName] || { bg: 'bg-slate-100', text: 'text-slate-500' };

  // ── Sections Definition ───────────────────────────────────────────

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          iconName: 'User',
          label: 'Profile',
          subtitle: email,
          action: null,
        },
        {
          icon: CreditCard,
          iconName: 'CreditCard',
          label: 'Subscription',
          subtitle: tierLabel,
          action: () => onNavigate('pricing'),
          actionLabel: 'Manage',
          tierBadge: true,
        },
        ...(isNativeApp() ? [{
          icon: RefreshCw,
          iconName: 'RefreshCw',
          label: 'Restore Purchases',
          subtitle: restoreMessage || 'Restore previous App Store purchases',
          action: handleRestorePurchases,
          loading: restoring,
        }] : []),
      ],
    },
    {
      title: 'AI & Privacy',
      items: [
        {
          icon: Shield,
          iconName: 'Shield',
          label: 'AI Data Sharing',
          subtitle: 'Your responses are processed by Anthropic\'s Claude AI',
          action: () => window.open('https://www.anthropic.com/privacy', '_blank'),
          badge: 'Active',
        },
        {
          icon: FileText,
          iconName: 'FileText',
          label: 'Privacy Policy',
          subtitle: 'How we handle your data',
          action: () => onNavigate('privacy'),
        },
        {
          icon: Scale,
          iconName: 'Scale',
          label: 'Terms of Service',
          subtitle: 'Usage terms and conditions',
          action: () => onNavigate('terms'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: Mail,
          iconName: 'Mail',
          label: 'Contact Support',
          subtitle: 'support@interviewanswers.ai',
          action: () => { window.location.href = 'mailto:support@interviewanswers.ai'; },
        },
        {
          icon: Star,
          iconName: 'Star',
          label: 'Rate the App',
          subtitle: 'Help us improve with your feedback',
          action: () => window.open('https://apps.apple.com/app/interviewanswers-ai/id0000000000', '_blank'),
        },
      ],
    },
  ];

  // ── Section Header Component ──────────────────────────────────────

  const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-2.5 mb-3 px-1">
      <div className="w-1 h-4 rounded-full bg-navy-600" />
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            onTouchEnd={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 active:scale-[0.96] transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-navy-700">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Profile Avatar Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xl font-bold text-white leading-none">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-navy-700 truncate">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierBadgeStyle}`}>
                  {tierLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} />
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-sm">
              {section.items.map((item) => {
                const Icon = item.icon;
                const style = getIconStyle(item.iconName);
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    onTouchEnd={item.action ? (e) => { e.preventDefault(); item.action(); } : undefined}
                    disabled={!item.action || item.loading}
                    className={`w-full flex items-center gap-3.5 px-4 min-h-[52px] py-3.5 text-left transition-all duration-200 ${
                      item.action
                        ? 'hover:bg-slate-50/80 active:bg-slate-100 active:scale-[0.98]'
                        : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg} transition-all duration-200`}>
                      {item.loading ? (
                        <Loader2 className={`w-[18px] h-[18px] ${style.text} animate-spin`} />
                      ) : (
                        <Icon className={`w-[18px] h-[18px] ${style.text}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.tierBadge && (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${tierBadgeStyle}`}>
                            {tierLabel}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                    {item.action && !item.loading && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data Management Section */}
        <div>
          <SectionHeader title="Data Management" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Reset Progress */}
            <button
              onClick={() => setShowResetConfirm(true)}
              onTouchEnd={(e) => { e.preventDefault(); setShowResetConfirm(true); }}
              className="w-full flex items-center gap-3.5 px-4 min-h-[52px] py-3.5 text-left hover:bg-slate-50/80 active:bg-slate-100 active:scale-[0.98] transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50 transition-all duration-200">
                <RotateCcw className="w-[18px] h-[18px] text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">Reset Progress</p>
                <p className="text-xs text-slate-500 mt-0.5">Reset scores and streaks. Questions and answers are kept.</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-amber-100 shadow-sm">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-navy-700 mb-2">Reset All Progress?</h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                This will reset your practice scores, session history, and streaks. Your saved questions and answers will not be affected.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : 'Reset Progress'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Success Toast */}
        {resetDone && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 shadow-sm transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-700 font-medium">Progress has been reset.</p>
          </div>
        )}

        {/* Danger Zone — Delete Account */}
        <div>
          <SectionHeader title="Danger Zone" />
          <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden p-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100/80">
                <AlertTriangle className="w-[18px] h-[18px] text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">Delete My Account</p>
                <p className="text-xs mt-1 text-red-600/70 leading-relaxed">
                  Permanently delete all your data including practice sessions, saved answers, AI history, and your account. This cannot be undone.
                </p>
                <button
                  onClick={() => {
                    setDeleteInput('');
                    setDeleteError(null);
                    setDeleteLoading(false);
                    setShowDeleteConfirm(true);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setDeleteInput('');
                    setDeleteError(null);
                    setDeleteLoading(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-200 active:scale-[0.98] transition-all duration-200 min-h-[40px]"
                >
                  Delete My Account...
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation */}
        {showDeleteConfirm && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-red-100 shadow-sm">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-navy-700 mb-2">Delete Your Account?</h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                This will permanently delete all your data:
              </p>
              <ul className="text-xs text-left w-full space-y-1.5 mb-4 text-slate-600">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> Practice sessions and scores</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> Saved questions and answers</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> AI coaching history</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> Streaks and progress data</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> Your account and profile</li>
              </ul>

              <div className="flex items-start gap-2.5 rounded-lg p-3 mb-4 w-full bg-white border border-slate-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm. Active subscriptions must be cancelled separately through Stripe or the App Store.
                </p>
              </div>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-300/60 focus:border-red-300 placeholder:text-slate-400 transition-all duration-200"
              />

              {deleteError && (
                <p className="text-xs text-red-600 mt-2">{deleteError}</p>
              )}

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE' || deleteLoading}
                  className="flex-1 py-2.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Success */}
        {deleteDone && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 shadow-sm transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-700 font-medium">Account deleted. Redirecting...</p>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          onTouchEnd={(e) => { e.preventDefault(); handleSignOut(); }}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2.5 py-4 min-h-[52px] rounded-xl border border-red-200 bg-white text-red-500 font-medium hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all duration-200 shadow-sm"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        {/* Version Footer */}
        <div className="pt-4 pb-2">
          <p className="text-center text-[11px] text-slate-400 leading-relaxed">
            InterviewAnswers.ai v1.0.0
          </p>
          <p className="text-center text-[11px] text-slate-300 mt-0.5">
            Made with &#9829; by Koda Labs LLC
          </p>
        </div>
      </div>
    </div>
  );
}
