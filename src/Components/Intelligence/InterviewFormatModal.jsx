import { useState, useEffect } from 'react';
import { X, RefreshCw, ChevronRight } from 'lucide-react';
import { INTERVIEW_FORMATS, generateSessionSeed } from '../../utils/interviewFormats';
import {
  InterviewerIcon,
  CoachIcon,
  StarDrillIcon,
  CommandCenterIcon,
} from '../icons/FeatureIcons';

const iconMap = {
  interviewer: InterviewerIcon,
  coach: CoachIcon,
  starDrill: StarDrillIcon,
  commandCenter: CommandCenterIcon,
};

const accentBgMap = {
  teal: 'bg-teal-50',
  sky: 'bg-sky-50',
  amber: 'bg-amber-50',
  slate: 'bg-slate-100',
};

export default function InterviewFormatModal({ isOpen, onClose, onStart }) {
  const [selectedFormatId, setSelectedFormatId] = useState(null);
  const [seed, setSeed] = useState(() => generateSessionSeed());

  useEffect(() => {
    if (!isOpen) {
      setSelectedFormatId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedFormat = INTERVIEW_FORMATS.find((f) => f.id === selectedFormatId) || null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleCardPick = (formatId) => {
    setSelectedFormatId(formatId);
  };

  const handleRefreshSeed = (e) => {
    e.stopPropagation();
    setSeed(generateSessionSeed());
  };

  const handleStart = () => {
    if (!selectedFormat) return;
    onStart(selectedFormat, seed);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      onTouchEnd={handleBackdropClick}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Choose Your Interview Type</h2>
          <p className="text-sm text-slate-500 mt-1">Each format trains a different skill set</p>
        </div>

        {/* Format cards */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INTERVIEW_FORMATS.map((format) => {
              const IconComp = iconMap[format.iconKey] || InterviewerIcon;
              const isSelected = selectedFormatId === format.id;
              const iconBg = accentBgMap[format.accentColor] || 'bg-slate-100';

              return (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => handleCardPick(format.id)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleCardPick(format.id);
                  }}
                  className={`text-left rounded-xl p-4 border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
                    <IconComp size={24} gradient={format.accentColor} />
                  </div>
                  <div className="font-bold text-lg text-slate-800 leading-tight">{format.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {format.duration} • {format.questionCount} questions
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{format.description}</p>
                </button>
              );
            })}
          </div>

          {/* Session seed */}
          <div className="mt-5 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold text-slate-700">Session #{seed}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Share this number to replay the exact same questions
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefreshSeed}
              onTouchEnd={handleRefreshSeed}
              className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-white border border-slate-200 transition"
              aria-label="Generate new session seed"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleStart();
            }}
            disabled={!selectedFormat}
            className={`px-5 py-2 rounded-lg font-semibold text-white flex items-center gap-1 transition shadow-sm ${
              selectedFormat
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Start Interview
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
