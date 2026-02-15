import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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

  useEffect(() => {
    // Handle recovery tokens — pass through to /app where ProtectedRoute handles them
    if (window.location.hash.includes('type=recovery')) {
      navigate('/app' + window.location.hash, { replace: true });
      return;
    }

    // Fallback timeout — if getSession() hangs or fails silently, show landing page anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ LandingPage: getSession() timed out after 3s, showing landing page');
      setLoading(false);
    }, 3000);

    // If already authenticated, redirect to app
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(fallbackTimer);
      if (session) {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
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
          href="/signup"
          className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg"
        >
          Start Practicing Free
        </a>
      </div>
    </div>
  );
}
