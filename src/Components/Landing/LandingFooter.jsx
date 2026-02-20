import { Link } from 'react-router-dom';
import { Brain, Lock } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">InterviewAnswers.ai</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/star-method-guide" className="hover:text-white transition-colors">
              STAR Method Guide
            </Link>
            <Link to="/behavioral-interview-questions" className="hover:text-white transition-colors">
              Behavioral Questions
            </Link>
            <Link to="/nursing-interview-questions" className="hover:text-white transition-colors">
              Nursing Questions
            </Link>
            <Link to="/nurse" className="hover:text-white transition-colors">
              🩺 NurseInterviewPro
            </Link>
            <a href="mailto:support@interviewanswers.ai" className="hover:text-white transition-colors">
              Contact
            </a>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-green-400" />
            <span>Secure payments via Stripe</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} InterviewAnswers.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
