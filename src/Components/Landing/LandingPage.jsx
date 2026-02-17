import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useDocumentHead from '../../hooks/useDocumentHead';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import SocialProofBar from './SocialProofBar';
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
    description: 'Practice job interviews with AI mock interviews, real-time coaching, and STAR method feedback. Build answers from your real experiences. Free to start, no credit card required.',
    keywords: 'interview preparation, AI interview practice, mock interview, STAR method, behavioral interview questions, job interview tips, interview coaching, AI interview coach, practice interview questions, interview answers, job interview preparation, career coaching',
    canonical: 'https://interviewanswers.ai/',
    og: {
      title: 'InterviewAnswers.ai - AI Interview Practice & Coaching',
      description: 'Practice job interviews with AI. Mock interviews, STAR method coaching, real-time prompts. Build answers from your real experiences.',
      url: 'https://interviewanswers.ai/',
      type: 'website',
    },
    twitter: {
      title: 'InterviewAnswers.ai - AI Interview Practice & Coaching',
      description: 'Practice job interviews with AI. Mock interviews, STAR method coaching, real-time prompts. Free to start.',
    },
  });

  useEffect(() => {
    // Handle auth tokens in URL hash — pass through to /app where ProtectedRoute handles them
    // This covers: email verification (type=signup), password recovery (type=recovery), magic links
    if (window.location.hash.includes('access_token')) {
      console.log('🔑 Auth token detected in URL hash, redirecting to /app');
      navigate('/app' + window.location.hash, { replace: true });
      return;
    }

    // Fallback timeout — if getSession() hangs or fails silently, show landing page anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ LandingPage: getSession() timed out after 3s, showing landing page');
      setLoading(false);
    }, 3000);

    // If already authenticated, redirect to app
    // BUT: anonymous users (from onboarding) should see the landing page, not get trapped
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(fallbackTimer);
      if (session && !session.user.is_anonymous) {
        navigate('/app', { replace: true });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      clearTimeout(fallbackTimer);
      console.error('LandingPage: getSession() failed:', error);
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
      <SocialProofBar />
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
