import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

export default function PrivacyPage() {
  useDocumentHead({
    title: 'Privacy Policy | InterviewAnswers.ai',
    description: 'Privacy Policy for InterviewAnswers.ai — how we protect your data, handle your information, and ensure your interview practice stays private.',
    canonical: 'https://www.interviewanswers.ai/privacy',
    robots: 'noindex, follow',
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </button>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Last updated:</strong> February 28, 2026</p>

          <p>
            InterviewAnswers.ai is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>We collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address for account creation and authentication</li>
            <li>Audio recordings of your practice interview responses</li>
            <li>Text transcriptions generated from your audio responses</li>
            <li>Practice session history, scores, and progress metrics</li>
            <li>Question banks and custom questions you create</li>
            <li>Usage data and analytics to improve our services</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Authenticate your account and enable access across devices</li>
            <li>Generate AI-powered feedback on your interview responses</li>
            <li>Track your progress and improvement over time</li>
            <li>Improve our service features and user experience</li>
            <li>Send service-related communications and product updates</li>
            <li>Provide customer support when requested</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. Data Storage and Security</h2>
          <p>
            We use Supabase as our database provider to store your account information and practice data.
            Audio recordings are stored locally on your device. All data transmitted between your device
            and our servers is encrypted using industry-standard HTTPS/TLS protocols. Data at rest is
            encrypted using AES-256 encryption.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> Database and authentication services</li>
            <li><strong>Anthropic (Claude API):</strong> AI-powered interview coaching and feedback generation</li>
            <li><strong>Apple StoreKit and RevenueCat:</strong> In-app purchase and subscription processing on iOS. Apple handles all payment information directly — we never see card numbers or billing details.</li>
            <li><strong>Stripe:</strong> Payment processing for subscriptions purchased through the web version of InterviewAnswers.ai. Stripe handles all payment information directly — we never see card numbers or billing details.</li>
            <li><strong>Web Speech API / iOS Speech Framework:</strong> On-device speech recognition (no audio sent to external servers)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. AI Data Processing — Anthropic (Claude)</h2>
          <p>
            Your practice responses (text only) are sent to <strong>Anthropic's Claude AI</strong> to generate personalized coaching feedback.
            No personal identifiers (email, password, payment info) are included in AI requests. Audio is transcribed on your
            device — only the text transcript is sent for analysis. Anthropic processes your data in accordance with their Privacy Policy ({' '}
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">anthropic.com/privacy</a>
            ) and provides protection of user data consistent with the standards described in this Privacy Policy. Anthropic does not use data submitted via its API to train or improve its AI models.
          </p>
          <p>
            We do not sell, rent, or share your personal information with third parties for their marketing purposes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">6. Microphone Access and Recording</h2>
          <p>
            InterviewAnswers.ai requests microphone access to record your practice interview responses. You have complete
            control over when recording occurs. Audio is used solely to generate transcriptions and provide
            feedback. We do not monitor, listen to, or store your recordings on external servers without
            your explicit consent.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6">Recording Consent and Legal Compliance</h3>
          <p>
            <strong>Important:</strong> Practice Prompter is designed for rehearsal sessions, not live interviews with other people.
            If despite our guidance you choose to use any audio feature during a live conversation with another party,
            you are solely responsible for obtaining consent from all parties being recorded and complying with
            applicable recording laws. Many jurisdictions require all-party consent before recording conversations.
          </p>
          <p>
            States requiring all-party consent include: California, Connecticut, Florida, Illinois, Maryland,
            Massachusetts, Michigan, Montana, Nevada, New Hampshire, Pennsylvania, and Washington. This list
            is not exhaustive. You should consult local laws and obtain appropriate consent before recording
            any conversation.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">7. Your Rights and Data Control</h2>
          <p>You have the following rights regarding your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You can view all your data within the app</li>
            <li><strong>Deletion:</strong> You can delete all your data at any time from Settings</li>
            <li><strong>Export:</strong> You can request a copy of your data by contacting us</li>
            <li><strong>Correction:</strong> You can update or correct your information within the app</li>
            <li><strong>Opt-out:</strong> You can opt-out of non-essential communications</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">8. California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to know what personal information we collect and how we use it</li>
            <li>Right to delete your personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
          <p>
            To exercise these rights, use the Delete Data function in Settings or contact us at support@interviewanswers.ai.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">9. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide
            services. You may delete your account and all associated data at any time from the Settings page.
            After deletion, your data will be permanently removed from our systems within 30 days, except where
            we are required to retain it for legal compliance.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">10. Children's Privacy</h2>
          <p>
            InterviewAnswers.ai is not intended for children under the age of 13. We do not knowingly collect personal
            information from children under 13. If you believe we have collected information from a child
            under 13, please contact us immediately and we will delete such information.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued
            use of InterviewAnswers.ai after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us
            at <a href="mailto:support@interviewanswers.ai" className="text-teal-600 hover:text-teal-700">support@interviewanswers.ai</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
