import { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle, Brain, Mic, Target, BookOpen, Sparkles, Lightbulb, Zap, AlertCircle, Crown } from 'lucide-react';

export default function Tutorial({ user, isActive, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('isl_tutorial_seen');
    if (tutorialSeen) {
      setHasShownTutorial(true);
    }
  }, []);

  // Don't show if user has already seen it
  if (!isActive || hasShownTutorial) return null;

  const steps = [
    {
      title: "Welcome to ISL! 🎉",
      icon: <Brain className="w-16 h-16 text-indigo-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Interview as a Second Language</strong> helps you master interviews using proven techniques from motivational interviewing and cognitive psychology.
          </p>
          <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
            <p className="font-semibold text-indigo-900 mb-2">🎯 Our Philosophy:</p>
            <p className="text-sm text-indigo-800">
              Great interview answers come from YOUR real experiences - not generic scripts. ISL helps you discover, structure, and practice telling your authentic stories effectively.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Build Your Question Bank",
      icon: <BookOpen className="w-16 h-16 text-purple-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Start by adding questions you expect in your interviews. You have three options:
          </p>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
              <p className="font-semibold text-green-900 mb-1">✨ AI Question Generator (Recommended)</p>
              <p className="text-sm text-green-800">
                Enter your target role, background, and job description. The AI generates personalized questions that match what you'll actually be asked.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
              <p className="font-semibold text-blue-900 mb-1">📚 Template Library</p>
              <p className="text-sm text-blue-800">
                Import pre-built question sets for common roles (Product Manager, Software Engineer, Emergency Management, etc.)
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-500">
              <p className="font-semibold text-gray-900 mb-1">✍️ Manual Entry</p>
              <p className="text-sm text-gray-800">
                Add questions directly from job postings or past interview experiences
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Create Your Answers",
      icon: <Lightbulb className="w-16 h-16 text-yellow-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed">
            For each question, build your answer using the <strong>Answer Assistant</strong>:
          </p>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="font-bold text-purple-900 mb-3">🤔 How the Answer Assistant Works:</p>
            <ol className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
                <span>The AI asks you questions about your experiences (using Motivational Interviewing techniques)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
                <span>You share stories, details, and context in a conversational way</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
                <span>After 3-6 exchanges, the AI synthesizes your responses into a professional STAR-formatted answer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
                <span>You get both a <strong>full narrative</strong> and <strong>bullet points</strong> for quick reference</span>
              </li>
            </ol>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-900">
              <strong>💡 Pro Tip:</strong> Don't rush the conversation! The more details you share, the more compelling your final answer will be.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Customize for Live Prompter",
      icon: <Target className="w-16 h-16 text-orange-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed">
            To use <strong>Live Prompter</strong> during real interviews, you need to customize your questions with keywords:
          </p>
          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <p className="font-bold text-orange-900 mb-3">🎯 How Keywords Work:</p>
            <div className="space-y-3 text-sm text-orange-800">
              <div>
                <p className="font-semibold mb-1">Interviewer asks: "Tell me about a time you led a difficult project"</p>
                <p className="text-xs text-orange-700 mb-2">Your keywords: <span className="bg-orange-200 px-2 py-1 rounded">led</span> <span className="bg-orange-200 px-2 py-1 rounded">difficult</span> <span className="bg-orange-200 px-2 py-1 rounded">project</span></p>
                <p className="text-green-700 font-semibold">✅ Live Prompter instantly shows your bullet points!</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900 mb-1">📝 Customization Requirements:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add at least <strong>5 keywords</strong> per question</li>
              <li>• Use words the interviewer will actually say</li>
              <li>• Include variations (e.g., "conflict", "disagreement", "difficult")</li>
              <li>• Customize at least <strong>3 questions</strong> to unlock unlimited Live Prompter</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
            <p className="text-sm text-red-900">
              <strong>⚠️ Legal Warning:</strong> Live Prompter is for YOUR reference only. Some companies prohibit notes during interviews. Use responsibly and check your company's policies.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Practice Modes Explained",
      icon: <Zap className="w-16 h-16 text-green-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed mb-4">
            Choose the right practice mode for your needs:
          </p>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-green-600" />
                <p className="font-bold text-green-900">🟢 Live Prompter (Real Interviews)</p>
              </div>
              <p className="text-sm text-green-800 mb-2">
                Use during actual interviews to get instant bullet point reminders
              </p>
              <ul className="text-xs text-green-700 space-y-1 pl-4">
                <li>• Hold SPACEBAR when interviewer asks question</li>
                <li>• Your prepared talking points appear instantly</li>
                <li>• Works with Teams/Zoom calls</li>
                <li>• Your answers are NOT recorded</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <p className="font-bold text-blue-900">🤖 AI Interviewer (Best Practice)</p>
              </div>
              <p className="text-sm text-blue-800 mb-2">
                Realistic interview practice with detailed AI feedback
              </p>
              <ul className="text-xs text-blue-700 space-y-1 pl-4">
                <li>• AI asks questions and listens to your answers</li>
                <li>• Get scored feedback (0-100) on completeness</li>
                <li>• AI asks follow-up questions like real interviewers</li>
                <li>• Progressive feedback: basic → detailed → expert</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <p className="font-bold text-purple-900">📝 Practice Mode (Quick Drill)</p>
              </div>
              <p className="text-sm text-purple-800 mb-2">
                Answer questions and get instant feedback on coverage
              </p>
              <ul className="text-xs text-purple-700 space-y-1 pl-4">
                <li>• Practice answering without interviewer presence</li>
                <li>• See which bullet points you covered</li>
                <li>• Get feedback on what you missed</li>
                <li>• Great for memorization and refining delivery</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Free vs Pro Tier",
      icon: <Crown className="w-16 h-16 text-yellow-600" />,
      content: (
        <div className="text-left space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300 mb-4">
            <p className="font-bold text-yellow-900 mb-3">🆓 Free Tier Includes:</p>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>3 AI Interviewer sessions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>5 Practice Mode sessions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>2 Answer Assistant sessions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>5 Question Generations</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>10 Live Prompter questions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> question bank storage</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-300">
            <p className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              💎 Pro Tier ($29.99/month):
            </p>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>50 AI Interviewer sessions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited Practice Mode</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>15 Answer Assistant sessions</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited Question Generator</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited Live Prompter</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Priority feature updates</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
            <p className="text-sm text-green-900">
              <strong>💡 Smart Strategy:</strong> Use the free tier to try out all features. When you're ready to practice seriously, upgrade to Pro for unlimited access to everything!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Your Roadmap to Success 🚀",
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      content: (
        <div className="text-left space-y-4">
          <p className="text-gray-700 leading-relaxed mb-4">
            Follow this proven workflow to master your interviews:
          </p>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
            <ol className="space-y-3 text-sm text-green-900">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-bold mb-1">Generate Your Questions (5-10 min)</p>
                  <p className="text-green-800 text-xs">Use AI Generator with your role, background, and job description</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-bold mb-1">Build Your Answers (2-3 sessions)</p>
                  <p className="text-green-800 text-xs">Use Answer Assistant for 5-10 key questions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-bold mb-1">Practice with AI Interviewer (2-4 sessions)</p>
                  <p className="text-green-800 text-xs">Refine delivery, get feedback, handle follow-ups</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="font-bold mb-1">Customize for Live Prompter (15 min)</p>
                  <p className="text-green-800 text-xs">Add keywords to 3+ questions, unlock unlimited use</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <div>
                  <p className="font-bold mb-1">Use Live Prompter in Real Interviews</p>
                  <p className="text-green-800 text-xs">Get instant bullet point reminders during actual interviews</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 mt-4">
            <p className="font-bold text-blue-900 mb-2">🎯 Ready to Start?</p>
            <p className="text-sm text-blue-800">
              Click "Get Started" below to go to the Command Center and begin building your question bank!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('isl_tutorial_seen', 'true');
    setHasShownTutorial(true);
    if (onClose) onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn overflow-y-auto p-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl max-w-3xl w-full my-8 p-8 relative animate-slideUp">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          title="Skip Tutorial"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep 
                  ? 'w-8 bg-indigo-600' 
                  : idx < currentStep
                  ? 'w-2 bg-green-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            {step.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{step.title}</h2>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {step.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Get Started
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Progress text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
