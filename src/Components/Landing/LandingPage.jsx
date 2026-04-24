import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useDocumentHead from '../../hooks/useDocumentHead';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import TrustBar from './TrustBar';
import SocialProofBar from './SocialProofBar';
import CogPsychTrustStrip from './CogPsychTrustStrip';
import InlineDemoSection from './InlineDemoSection';
import ProblemSection from './ProblemSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import WhyISLSection from './WhyISLSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // SEO: Dynamic meta tags for the general landing page
  useDocumentHead({
    title: 'InterviewAnswers.ai - AI Interview Practice & STAR Method Coaching',
    description: 'Practice job interviews with AI mock interviews and STAR method coaching. Rehearse out loud, build answers from your real experiences. Practice, not cheat. Free to start, no credit card required.',
    keywords: 'interview preparation, AI interview practice, mock interview, STAR method, behavioral interview questions, job interview tips, interview coaching, AI interview coach, practice interview questions, interview answers, job interview preparation, career coaching, ethical interview prep',
    canonical: 'https://www.interviewanswers.ai/',
    og: {
      title: 'InterviewAnswers.ai - Practice, Not Cheat',
      description: 'The interview AI that doesn\'t go in the interview. Mock interviews, STAR method coaching, rehearsal tools. Built for preparation, not real-time assistance.',
      url: 'https://www.interviewanswers.ai/',
      type: 'website',
    },
    twitter: {
      title: 'InterviewAnswers.ai - AI Interview Practice & Coaching',
      description: 'Practice job interviews with AI. Mock interviews, STAR method coaching, rehearsal tools. Free to start.',
    },
  });

  useEffect(() => {
    // Handle auth tokens in URL hash — pass through to /app or /nursing where ProtectedRoute handles them
    // This covers: email verification (type=signup), password recovery (type=recovery), magic links
    if (window.location.hash.includes('access_token')) {
      console.log('🔑 Auth token detected in URL hash, checking user context...');
      // Parse the hash to detect nursing users and route them correctly
      // After email confirmation, check user metadata for onboarding_field
      supabase.auth.getSession().then(({ data: { session } }) => {
        const field = session?.user?.user_metadata?.onboarding_field;
        const dest = field === 'nursing' ? '/nursing' : '/app';
        console.log(`🔑 Routing to ${dest} (onboarding_field: ${field || 'not set'})`);
        navigate(dest + window.location.hash, { replace: true });
      }).catch(() => {
        // Fallback: if getSession fails, default to /app (safe default)
        navigate('/app' + window.location.hash, { replace: true });
      });
      return;
    }

    // Fallback timeout — if getSession() hangs or fails silently, show landing page anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ LandingPage: getSession() timed out after 3s, showing landing page');
      setLoading(false);
    }, 3000);

    // If already authenticated, redirect to app or nursing based on user metadata
    // BUT: anonymous users (from onboarding/demo) should see the landing page
    //
    // IMPORTANT: Use getUser() not getSession(). getSession() returns whatever's
    // in localStorage even if expired — which causes this bug: stale session →
    // LandingPage redirects to /app → /app revalidates with getUser() → session
    // is actually invalid → shows login page. Net: user visits the homepage and
    // lands on login for no good reason.
    //
    // getUser() validates server-side and returns null for expired sessions, so
    // we only redirect users whose session is genuinely live.
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      clearTimeout(fallbackTimer);
      if (!error && user && !user.is_anonymous) {
        const field = user.user_metadata?.onboarding_field;
        navigate(field === 'nursing' ? '/nursing' : '/app', { replace: true });
      } else {
        // No user, stale/expired session, or anonymous session — show landing
        setLoading(false);
      }
    }).catch((error) => {
      clearTimeout(fallbackTimer);
      console.error('LandingPage: getUser() failed:', error);
      setLoading(false); // Show landing page even if auth check fails
    });

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">Loading InterviewAnswers.ai...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <TrustBar />
      <SocialProofBar />
      <CogPsychTrustStrip />
      <InlineDemoSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyISLSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 z-40">
        <a
          href="/onboarding"
          className="block w-full text-center bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg"
        >
          Start Practicing Free
        </a>
      </div>
    </div>
  );
}
