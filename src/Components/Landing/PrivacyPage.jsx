import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Effective Date:</strong> January 1, 2025</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>When you use InterviewAnswers.ai, we collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> Email address, full name, and password (securely hashed)</li>
            <li><strong>Practice data:</strong> Your interview questions, answers, practice session recordings (text only), and performance scores</li>
            <li><strong>Usage data:</strong> Feature usage, session frequency, and interaction patterns to improve the Service</li>
            <li><strong>Payment information:</strong> Processed securely by Stripe. We do not store credit card numbers.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve the interview preparation Service</li>
            <li>Generate AI-powered feedback on your practice sessions</li>
            <li>Track your progress and provide analytics</li>
            <li>Process subscription payments</li>
            <li>Send essential account communications (password resets, billing notices)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Data Security</h2>
          <p>We take the security of your data seriously:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All data is encrypted using <strong>AES-256 encryption</strong></li>
            <li>Authentication is handled by <strong>Supabase</strong> with industry-standard security practices</li>
            <li>All connections use HTTPS/TLS encryption</li>
            <li>Payment processing is handled by <strong>Stripe</strong>, a PCI-DSS Level 1 certified payment processor</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Third-Party Services</h2>
          <p>We use the following third-party services to provide and improve our Service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> Authentication, database, and serverless functions</li>
            <li><strong>OpenAI:</strong> AI-powered interview feedback and answer generation</li>
            <li><strong>Stripe:</strong> Payment processing for Pro subscriptions</li>
            <li><strong>Web Speech API:</strong> Browser-based speech recognition for practice sessions</li>
            <li><strong>Vercel:</strong> Application hosting and deployment</li>
          </ul>
          <p>Each of these services has their own privacy policies governing how they handle data.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. Data Sharing</h2>
          <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We only share data with the third-party services listed above as necessary to provide the Service.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">6. Speech Recognition</h2>
          <p>When you use speech recognition features, your audio is processed by your browser's Web Speech API. Audio data is processed locally or by your browser's speech service (e.g., Google for Chrome). We do not store audio recordings. Only the transcribed text is saved to your account.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">7. Live Prompter</h2>
          <p>The Live Prompter feature processes audio locally in your browser to detect interview questions. No audio is transmitted to our servers. Only question-matching is performed locally to display your prepared bullet points.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">8. Data Retention</h2>
          <p>Your practice data and account information are retained as long as your account is active. If you delete your account, we will remove your personal data within 30 days. Some anonymized usage data may be retained for analytics purposes.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">9. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your practice data</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">10. Children's Privacy</h2>
          <p>The Service is not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware of such collection, we will delete the information promptly.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the Service constitutes acceptance of the updated policy.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">12. Contact</h2>
          <p>For privacy-related questions or requests, contact us at <a href="mailto:support@interviewanswers.ai" className="text-teal-600 hover:text-teal-700">support@interviewanswers.ai</a>.</p>
        </div>
      </div>
    </div>
  );
}
