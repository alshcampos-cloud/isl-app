import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X, Stethoscope } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              scrolled
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              InterviewAnswers.ai
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo('features')}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-indigo-200 hover:text-white'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Pricing
            </button>
            <Link
              to="/nurse"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                scrolled ? 'text-sky-600 hover:text-sky-700' : 'text-sky-300 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Nursing
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Log In
            </Link>
            <Link
              to="/onboarding"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start Practicing Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'text-gray-600' : 'text-white'
            }`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block w-full text-left text-gray-700 font-medium py-2">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left text-gray-700 font-medium py-2">How It Works</button>
            <button onClick={() => scrollTo('pricing')} className="block w-full text-left text-gray-700 font-medium py-2">Pricing</button>
            <Link to="/nurse" className="flex items-center gap-2 text-sky-600 font-medium py-2" onClick={() => setMobileOpen(false)}>
              <Stethoscope className="w-4 h-4" />
              Nursing Interviews
            </Link>
            <hr className="border-gray-200" />
            <Link to="/login" className="block text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>Log In</Link>
            <Link
              to="/onboarding"
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Start Practicing Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
