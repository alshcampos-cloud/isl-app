import React from 'react';
import { X } from 'lucide-react';

const ConsentDialog = ({ 
  show, 
  pendingMode, 
  onCancel, 
  onAgree,
  onNavigate 
}) => {
  
  if (!show) return null;

  // Determine if we should show Live Prompter warning
  const showLivePrompterWarning = pendingMode === 'prompter';
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Recording Consent Required</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-700 mb-3 text-sm">
            InterviewAnswers.ai uses your microphone to record practice responses for AI feedback.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3 mb-3 text-xs">
            <p className="text-blue-900 mb-1">✓ Recordings for feedback only</p>
            <p className="text-blue-900 mb-1">✓ Delete anytime in Settings</p>
            <p className="text-blue-900">✓ Data stored securely</p>
          </div>

          {/* ONLY show Live Prompter warning if using Live Prompter */}
          {showLivePrompterWarning && (
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded p-3 mb-3">
              <p className="font-bold text-orange-900 text-sm mb-1">⚠️ Live Prompter Use</p>
              <p className="text-orange-800 text-xs">
                If using during actual interviews, <strong>YOU must obtain consent from all parties</strong>. 
                Recording without consent may be illegal.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-4">
            By clicking "I Agree," you consent to our{' '}
            <button onClick={() => onNavigate('privacy')} className="text-indigo-600 underline">
              Privacy Policy
            </button>
            {' '}and{' '}
            <button onClick={() => onNavigate('terms')} className="text-indigo-600 underline">
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-sm"
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
