import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ISL!',
    description: "ISL helps you master interviews by practicing with AI. Let's show you around!",
    targetSelector: null,
    position: 'center',
  },
  {
    id: 'modes',
    title: 'Practice Modes',
    description: 'Live Prompter shows key points during real interviews. AI Interviewer asks questions and gives feedback. Practice Mode lets you practice and improve with detailed AI analysis.',
    targetSelector: '[data-tutorial="practice-modes"]',
    position: 'bottom',
  },
  {
    id: 'command-center',
    title: 'Command Center',
    description: 'Your progress dashboard! Track your scores over time, manage your question bank, review past sessions, and see which questions need more practice.',
    targetSelector: '[data-tutorial="command-center"]',
    position: 'bottom',
  },
  {
    id: 'menu',
    title: 'Profile Menu',
    description: 'Access your account settings, restart this tutorial anytime, or sign out. All your data syncs automatically!',
    targetSelector: '[data-tutorial="menu"]',
    position: 'bottom-left',
  },
];

export default function Tutorial({ user, isActive, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);

  useEffect(() => {
    if (!isActive) return;
    setCurrentStep(0);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    if (!step.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setSpotlightRect(el.getBoundingClientRect()), 300);

    const onResize = () => {
      const updated = document.querySelector(step.targetSelector);
      if (updated) setSpotlightRect(updated.getBoundingClientRect());
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [currentStep, isActive]);

  const step = TUTORIAL_STEPS[currentStep];
  const { cardClassName, cardStyle } = useMemo(
    () => getCardPlacement(step?.position, spotlightRect),
    [step?.position, spotlightRect]
  );

  const persistTutorialState = async ({ completed }) => {
    if (!user?.id) return;
    await supabase
      .from('user_profiles')
      .update({ tutorial_completed: !!completed })
      .eq('user_id', user.id);
  };

  const handleNext = async () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      await persistTutorialState({ completed: true });
      onClose();
    }
  };

  const handleSkip = async () => {
    if (window.confirm('Skip tutorial? You can restart it from Settings.')) {
      await persistTutorialState({ completed: true });
      onClose();
    }
  };

  if (!isActive || !step) return null;

  return (
    <div className="fixed inset-0 z-50">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.x - 8}
                y={spotlightRect.y - 8}
                width={spotlightRect.width + 16}
                height={spotlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#spotlight-mask)" />
      </svg>

      {spotlightRect && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: spotlightRect.x + spotlightRect.width / 2,
            top: spotlightRect.y + spotlightRect.height / 2,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-12 h-12 -ml-6 -mt-6 border-4 border-blue-400 rounded-full" />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute bg-white rounded-2xl shadow-2xl p-6 max-w-sm ${cardClassName}`}
          style={cardStyle}
        >
          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
          <p className="text-gray-700 mb-4">{step.description}</p>

          <div className="flex gap-3">
            <button onClick={handleSkip} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getCardPlacement(position, rect) {
  if (!rect || position === 'center') {
    return {
      cardClassName: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      cardStyle: {},
    };
  }

  const pad = 20;

  switch (position) {
    case 'bottom':
      return {
        cardClassName: 'left-1/2 -translate-x-1/2',
        cardStyle: { top: rect.bottom + pad },
      };
    case 'bottom-left':
      return {
        cardClassName: '',
        cardStyle: { right: window.innerWidth - rect.right, top: rect.bottom + pad },
      };
    default:
      return {
        cardClassName: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        cardStyle: {},
      };
  }
}