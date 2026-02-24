import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

export default function TermsPage() {
  useDocumentHead({
    title: 'Terms of Service | InterviewAnswers.ai',
    description: 'Terms of Service for InterviewAnswers.ai — AI-powered interview preparation platform.',
    canonical: 'https://www.interviewanswers.ai/terms',
    robots: 'noindex, follow',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Effective Date:</strong> January 1, 2025</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using InterviewAnswers.ai ("we", "our", or "the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Description of Service</h2>
          <p>InterviewAnswers.ai provides AI-powered interview preparation tools including practice sessions, answer building, question generation, and live interview prompting. The Service is intended for educational and personal development purposes only.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. User Accounts</h2>
          <p>You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when creating your account.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Share your account credentials with others</li>
            <li>Use the Service in a way that could harm other users</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. Subscription and Payments</h2>
          <p>InterviewAnswers.ai offers both free and paid subscription tiers. Paid subscriptions are billed monthly through Stripe. You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">6. Live Prompter Disclaimer</h2>
          <p>The Live Prompter feature is designed to assist during interviews. Some employers may have policies regarding the use of notes or assistance during interviews. It is your responsibility to understand and comply with any such policies. InterviewAnswers.ai is not responsible for any consequences resulting from the use of the Live Prompter feature.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">7. AI-Generated Content</h2>
          <p>The AI feedback, suggestions, and generated content provided by the Service are for educational purposes only and should not be considered professional career advice. AI-generated content may not always be accurate or appropriate for your specific situation.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">8. Intellectual Property</h2>
          <p>The Service, including its design, features, and content, is owned by InterviewAnswers.ai. Your interview answers and personal content remain your own property. By using the Service, you grant us a limited license to process your content for the purpose of providing the Service.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">9. Limitation of Liability</h2>
          <p>The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to job interview outcomes.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">10. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will notify users of significant changes via email.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">11. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@interviewanswers.ai" className="text-teal-600 hover:text-teal-700">support@interviewanswers.ai</a>.</p>
        </div>
      </div>
    </div>
  );
}
