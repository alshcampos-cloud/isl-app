import React from 'react';
import { X } from 'lucide-react';
import { isTargetedBuild } from '../utils/appTarget';

const ConsentDialog = ({ 
  show, 
  pendingMode, 
  onCancel, 
  onAgree,
  onNavigate 
}) => {
  
  if (!show) return null;

  // Determine if we should show Practice Prompter warning
  const showLivePrompterWarning = pendingMode === 'prompter';
  const isNative = isTargetedBuild();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">{isNative ? 'Microphone & AI Consent' : 'Recording Consent Required'}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-700 mb-3 text-sm">
            {isNative
              ? <>This app uses your microphone to listen to your practice responses. Your speech is transcribed on-device, and the text is sent to <strong>Anthropic's Claude AI</strong> for personalized coaching feedback.</>
              : <>InterviewAnswers.ai uses your microphone to record practice responses. Your spoken responses are transcribed on your device, and the text is analyzed by <strong>Anthropic's Claude AI</strong> to provide coaching feedback.</>
            }
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3 mb-3 text-xs">
            <p className="text-blue-900 mb-1">✓ {isNative ? 'Speech transcribed on your device' : 'Audio processed on your device only'}</p>
            <p className="text-blue-900 mb-1">✓ Text analyzed by Anthropic's Claude AI for feedback</p>
            <p className="text-blue-900 mb-1">✓ No personal identifiers shared with Anthropic</p>
            <p className="text-blue-900 mb-1">✓ Delete your data anytime in Settings</p>
            <p className="text-blue-900">✓ All data stored securely and encrypted</p>
          </div>

          {/* Practice Prompter — rehearsal-only framing (post-rebrand) */}
          {showLivePrompterWarning && (
            <div className="bg-teal-50 border-l-4 border-teal-500 rounded p-3 mb-3">
              <p className="font-bold text-teal-900 text-sm mb-1">Practice Prompter — rehearsal tool</p>
              <p className="text-teal-800 text-xs">
                This is for practicing your answers out loud, before your interview.
                Using any AI assistance during a live interview violates our
                Terms of Service and can result in offers being rescinded.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-4">
            By clicking "I Agree," you consent to our{' '}
            <button onClick={() => onNavigate('privacy')} className="text-teal-600 underline">
              Privacy Policy
            </button>
            {' '}and{' '}
            <button onClick={() => onNavigate('terms')} className="text-teal-600 underline">
              Terms
            </button>.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onAgree}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg text-sm"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentDialog;
