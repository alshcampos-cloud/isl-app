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

  // ── Sections Definition ───────────────────────────────────────────

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          subtitle: email,
          action: null,
        },
        {
          icon: CreditCard,
          label: 'Subscription',
          subtitle: tierLabel,
          action: () => onNavigate('pricing'),
          actionLabel: 'Manage',
        },
        ...(isNativeApp() ? [{
          icon: RefreshCw,
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
          label: 'AI Data Sharing',
          subtitle: 'Your responses are processed by Anthropic\'s Claude AI',
          action: () => window.open('https://www.anthropic.com/privacy', '_blank'),
          badge: 'Active',
        },
        {
          icon: FileText,
          label: 'Privacy Policy',
          subtitle: 'How we handle your data',
          action: () => onNavigate('privacy'),
        },
        {
          icon: Scale,
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
          label: 'Contact Support',
          subtitle: 'support@interviewanswers.ai',
          action: () => { window.location.href = 'mailto:support@interviewanswers.ai'; },
        },
        {
          icon: Star,
          label: 'Rate the App',
          subtitle: 'Help us improve with your feedback',
          action: () => window.open('https://apps.apple.com/app/interviewanswers-ai/id0000000000', '_blank'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'InterviewAnswers.AI',
          subtitle: 'Version 1.0.0',
          action: null,
          footer: 'Made by Koda Labs LLC',
        },
      ],
    },
  ];

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1 text-slate-500">
              {section.title}
            </h2>
            <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden divide-y divide-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={!item.action || item.loading}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                      item.action ? 'hover:bg-slate-50 active:bg-slate-100' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
                      {item.loading ? (
                        <Loader2 className="w-[18px] h-[18px] text-slate-500 animate-spin" />
                      ) : (
                        <Icon className="w-[18px] h-[18px] text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      )}
                      {item.footer && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.footer}</p>
                      )}
                    </div>
                    {item.action && !item.loading && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data Management Section */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1 text-slate-500">
            Data Management
          </h2>
          <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden divide-y divide-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
            {/* Reset Progress */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50">
                <RotateCcw className="w-[18px] h-[18px] text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">Reset Progress</p>
                <p className="text-xs text-slate-500">Reset scores and streaks. Questions and answers are kept.</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-amber-100">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Reset All Progress?</h3>
              <p className="text-xs text-slate-600 mb-4">
                This will reset your practice scores, session history, and streaks. Your saved questions and answers will not be affected.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Progress has been reset.</p>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200/60 bg-white text-red-600 font-medium hover:bg-red-50 active:bg-red-100 transition-colors shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)]"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>

        {/* Delete Account — Danger Zone */}
        <div className="pt-4">
          <div className="rounded-2xl border border-red-200/50 bg-red-50/60 overflow-hidden p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100">
                <Trash2 className="w-[18px] h-[18px] text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">Delete My Account</p>
                <p className="text-xs mt-0.5 text-red-600/70">
                  Permanently delete all your data including practice sessions, saved answers, AI history, and your account. This cannot be undone.
                </p>
                <button
                  onClick={() => {
                    setDeleteInput('');
                    setDeleteError(null);
                    setDeleteLoading(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-200 transition-colors"
                >
                  Delete My Account...
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation */}
        {showDeleteConfirm && (
          <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-red-100">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Your Account?</h3>
              <p className="text-xs text-slate-600 mb-3">
                This will permanently delete all your data:
              </p>
              <ul className="text-xs text-left w-full space-y-1 mb-3 text-slate-600">
                <li className="flex items-center gap-2"><span className="text-red-500">&#8226;</span> Practice sessions and scores</li>
                <li className="flex items-center gap-2"><span className="text-red-500">&#8226;</span> Saved questions and answers</li>
                <li className="flex items-center gap-2"><span className="text-red-500">&#8226;</span> AI coaching history</li>
                <li className="flex items-center gap-2"><span className="text-red-500">&#8226;</span> Streaks and progress data</li>
                <li className="flex items-center gap-2"><span className="text-red-500">&#8226;</span> Your account and profile</li>
              </ul>

              <div className="flex items-start gap-2 rounded-xl p-2.5 mb-4 w-full bg-slate-100/60">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <p className="text-xs text-slate-600">
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm. Active subscriptions must be cancelled separately through Stripe or the App Store.
                </p>
              </div>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 placeholder:text-slate-400"
              />

              {deleteError && (
                <p className="text-xs text-red-600 mt-2">{deleteError}</p>
              )}

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE' || deleteLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Account deleted. Redirecting...</p>
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
