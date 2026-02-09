import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FirstTimeConsent({ user, onAccepted }) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    checkTermsAcceptance();
  }, [user]);

  const checkTermsAcceptance = async () => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('accepted_terms')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing rows gracefully

      if (error) {
        console.error('Error checking terms:', error);
        setIsChecking(false);
        return;
      }

      // If no profile exists yet, or accepted_terms is false/null, show the modal
      if (!data || !data.accepted_terms) {
        setShowModal(true);
      }

      setIsChecking(false);
    } catch (err) {
      console.error('FirstTimeConsent error:', err);
      setIsChecking(false);
    }
  };

  const handleAccept = async () => {
    try {
      // Use upsert to create profile if it doesn't exist, or update if it does
      // First check if profile already exists to preserve existing tier
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id, tier')
        .eq('user_id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
          // Only set tier to 'free' for brand new users — preserve existing tier for returning users
          ...(existingProfile ? {} : { tier: 'free' })
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving acceptance:', error);
        alert('Error saving acceptance. Please try again.');
        return;
      }

      setShowModal(false);
      if (onAccepted) onAccepted();
    } catch (err) {
      console.error('FirstTimeConsent handleAccept error:', err);
      alert('Error saving acceptance. Please try again.');
    }
  };

  const handleReject = async () => {
    if (window.confirm('You must accept the Terms and Privacy Policy to use ISL. Sign out?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  if (isChecking || !showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ISL</h2>
          <p className="text-gray-600">Before we begin, please review our policies</p>
        </div>

        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'privacy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'terms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Terms of Service
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto text-sm text-gray-700">
          {activeTab === 'summary' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Summary:</h3>
              <ul className="space-y-2">
                <li>• We collect your email to create your account</li>
                <li>• Microphone access is used for interview practice</li>
                <li>• Your data is stored securely and encrypted</li>
                <li>• You can delete your data anytime</li>
                <li>• We never sell your information</li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Last updated: January 12, 2026</p>
              <p>InterviewAnswers.ai is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

              <h4 className="font-semibold text-gray-900">Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email address for account creation and authentication</li>
                <li>Audio recordings of your practice interview responses</li>
                <li>Text transcriptions generated from your audio responses</li>
                <li>Practice session history, scores, and progress metrics</li>
                <li>Question banks and custom questions you create</li>
                <li>Usage data and analytics to improve our services</li>
              </ul>

              <h4 className="font-semibold text-gray-900">How We Use Your Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authenticate your account and enable access across devices</li>
                <li>Generate AI-powered feedback on your interview responses</li>
                <li>Track your progress and improvement over time</li>
                <li>Improve our AI models and service features</li>
                <li>Send service-related communications and product updates</li>
                <li>Provide customer support when requested</li>
              </ul>

              <h4 className="font-semibold text-gray-900">Data Storage and Security</h4>
              <p>We use Supabase as our database provider. Audio recordings are stored locally on your device. All data transmitted between your device and our servers is encrypted using industry-standard HTTPS/TLS protocols. Data at rest is encrypted using AES-256 encryption.</p>

              <h4 className="font-semibold text-gray-900">Third-Party Services</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>OpenAI:</strong> AI-powered feedback generation</li>
                <li><strong>Web Speech API:</strong> Browser-based speech recognition</li>
              </ul>
              <p>We do not sell, rent, or share your personal information with third parties for their marketing purposes.</p>

              <h4 className="font-semibold text-gray-900">Microphone Access and Recording</h4>
              <p>InterviewAnswers.ai requests microphone access to record your practice interview responses. You have complete control over when recording occurs. Audio is used solely to generate transcriptions and provide feedback.</p>
              <p><strong>Important:</strong> If you use the Live Prompter feature during actual interviews, you are solely responsible for obtaining consent from all parties being recorded and complying with applicable recording laws.</p>

              <h4 className="font-semibold text-gray-900">Your Rights and Data Control</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> View all your data within the app</li>
                <li><strong>Deletion:</strong> Delete all your data at any time from Settings</li>
                <li><strong>Export:</strong> Request a copy of your data by contacting us</li>
                <li><strong>Correction:</strong> Update or correct your information within the app</li>
                <li><strong>Opt-out:</strong> Opt-out of non-essential communications</li>
              </ul>

              <h4 className="font-semibold text-gray-900">Children's Privacy</h4>
              <p>InterviewAnswers.ai is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

              <h4 className="font-semibold text-gray-900">Contact Us</h4>
              <p>Email: support@interviewanswers.ai</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Last updated: January 12, 2026</p>

              <h4 className="font-semibold text-gray-900">1. Acceptance of Terms</h4>
              <p>By accessing or using InterviewAnswers.ai, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with these terms, you may not use InterviewAnswers.ai.</p>

              <h4 className="font-semibold text-gray-900">2. Description of Service</h4>
              <p>InterviewAnswers.ai is an AI-powered interview preparation platform that provides practice questions, real-time feedback, and performance tracking to help users improve their interview skills.</p>

              <h4 className="font-semibold text-gray-900">3. User Accounts</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 13 years old to use the service</li>
                <li>One person may not maintain more than one account</li>
              </ul>

              <h4 className="font-semibold text-gray-900">4. Subscription and Billing</h4>
              <p>InterviewAnswers.ai offers free and paid subscription plans. Paid subscriptions are billed monthly. You may cancel your subscription at any time through the Stripe customer portal.</p>

              <h4 className="font-semibold text-gray-900">5. Acceptable Use</h4>
              <p>You agree not to misuse the service, including but not limited to: attempting to gain unauthorized access, interfering with the service, using the service for illegal purposes, or distributing malware.</p>

              <h4 className="font-semibold text-gray-900">6. Intellectual Property</h4>
              <p>The service and its original content, features, and functionality are owned by InterviewAnswers.ai. Your practice responses and custom content remain your property.</p>

              <h4 className="font-semibold text-gray-900">7. AI-Generated Content Disclaimer</h4>
              <p>AI-generated feedback and suggestions are provided for educational purposes only. They should not be considered professional career advice. We make no guarantees about interview outcomes based on using our service.</p>

              <h4 className="font-semibold text-gray-900">8. Recording Disclaimer</h4>
              <p>You are solely responsible for compliance with all applicable recording and wiretapping laws when using audio features, especially the Live Prompter feature during actual interviews.</p>

              <h4 className="font-semibold text-gray-900">9. Limitation of Liability</h4>
              <p>InterviewAnswers.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>

              <h4 className="font-semibold text-gray-900">10. Termination</h4>
              <p>We may terminate or suspend your account at any time for violations of these terms. You may delete your account at any time from the Settings page.</p>

              <h4 className="font-semibold text-gray-900">11. Contact Us</h4>
              <p>Email: support@interviewanswers.ai</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg"
          >
            Accept & Continue
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          By clicking "Accept & Continue" you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}