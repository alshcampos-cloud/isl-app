import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FirstTimeConsent({ user, onAccepted }) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkTermsAcceptance();
  }, [user]);

  const checkTermsAcceptance = async () => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('accepted_terms')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error checking terms:', error);
      setIsChecking(false);
      return;
    }

    if (!data.accepted_terms) {
      setShowModal(true);
    }
    
    setIsChecking(false);
  };

  const handleAccept = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      alert('Error saving acceptance. Please try again.');
      return;
    }

    setShowModal(false);
    if (onAccepted) onAccepted();
  };

  const handleReject = async () => {
    if (window.confirm('You must accept the Terms and Privacy Policy to use ISL. Sign out?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  if (isChecking || !showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ISL</h2>
          <p className="text-gray-600">Before we begin, please review our policies</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Summary:</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• We collect your email to create your account</li>
            <li>• Microphone access is used for interview practice</li>
            <li>• Your data is stored securely and encrypted</li>
            <li>• You can delete your data anytime</li>
            <li>• We never sell your information</li>
          </ul>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 text-center">
            For full details, see our Privacy Policy and Terms of Service
          </p>
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