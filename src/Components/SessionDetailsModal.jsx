import React from 'react';
import { X, CheckCircle, Target } from 'lucide-react';

const SessionDetailsModal = ({ 
  show,
  selectedPoint,
  onClose 
}) => {
  
  if (!show || !selectedPoint) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header - Never Scrolls */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {selectedPoint.question ? '📊 Practice Session Details' : '📈 Session Details'}
              </h3>
              <p className="text-indigo-100 text-sm md:text-base">
                Attempt {selectedPoint.idx} of {selectedPoint.total}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Score Display */}
          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8">
            <p className="text-gray-600 font-semibold mb-2">Score</p>
            <p className="text-6xl font-black text-indigo-600 mb-2">{selectedPoint.score.toFixed(1)}</p>
            <p className="text-gray-500 text-sm">out of 10.0</p>
          </div>
          
          {/* Question (if available) */}
          {selectedPoint.question && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
              <p className="text-sm font-bold text-indigo-700 mb-2">📝 Question:</p>
              <p className="text-gray-900 font-semibold text-base md:text-lg">{selectedPoint.question}</p>
            </div>
          )}
          
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">📅 Date</p>
              <p className="font-bold text-gray-900">
                {new Date(selectedPoint.session.date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">⏰ Time</p>
              <p className="font-bold text-gray-900">
                {new Date(selectedPoint.session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          {/* Feedback Sections */}
          {selectedPoint.session.feedback ? (
            <>
              {/* Strengths */}
              {selectedPoint.session.feedback.strengths && selectedPoint.session.feedback.strengths.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </p>
                  <ul className="space-y-2">
                    {selectedPoint.session.feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-800 flex gap-2">
                        <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Areas for Improvement */}
              {selectedPoint.session.feedback.gaps && selectedPoint.session.feedback.gaps.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <p className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Areas for Improvement
                  </p>
                  <ul className="space-y-2">
                    {selectedPoint.session.feedback.gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-orange-800 flex gap-2">
                        <span className="flex-shrink-0 text-orange-600 font-bold">→</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* No feedback message */}
              {(!selectedPoint.session.feedback.strengths || selectedPoint.session.feedback.strengths.length === 0) &&
               (!selectedPoint.session.feedback.gaps || selectedPoint.session.feedback.gaps.length === 0) && (
                <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                  <p className="text-gray-600">
                    📊 Score recorded, but detailed feedback not available for this session.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
              <p className="text-gray-600">
                📊 This session has a score of {selectedPoint.score.toFixed(1)}/10, but detailed feedback is not available.
              </p>
            </div>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
