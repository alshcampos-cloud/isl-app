// SEO Content Page: Nursing Interview Questions
// Target keywords: "nursing interview questions", "nurse interview questions and answers",
//   "nursing behavioral interview questions", "new grad nurse interview questions",
//   "SBAR interview", "nursing interview tips 2026"
// High-value nursing niche page — funnels to /nurse and /onboarding
// NOTE: All question text here is general/publicly known interview question categories.
// Clinical content is NOT AI-generated — these are standard interview topics.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, Stethoscope, ChevronDown, CheckCircle, Shield, BookOpen, Heart } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';

const nursingCategories = [
  {
    category: 'Patient Care & Clinical Judgment',
    icon: '🏥',
    description: 'Questions about how you assess patients, prioritize care, and make clinical decisions.',
    questions: [
      'Tell me about a time you had to prioritize multiple patients with urgent needs.',
      'Describe a situation where you caught a potential safety issue before it became a problem.',
      'How do you handle a situation where you disagree with a physician\'s order?',
      'Tell me about a time you had to advocate for a patient.',
      'Describe a challenging patient assessment and how you handled it.',
    ],
  },
  {
    category: 'Communication & SBAR',
    icon: '💬',
    description: 'Questions about handoffs, reporting, and communicating with the care team.',
    questions: [
      'Walk me through how you give a bedside handoff report.',
      'Tell me about a time clear communication prevented a patient safety issue.',
      'Describe a situation where you had to deliver difficult news to a patient or family.',
      'How do you communicate with a physician during a rapid change in patient status?',
      'Tell me about a time you had a miscommunication with a colleague and how you resolved it.',
    ],
  },
  {
    category: 'Teamwork & Collaboration',
    icon: '🤝',
    description: 'Questions about working with charge nurses, physicians, techs, and interdisciplinary teams.',
    questions: [
      'Describe a time you worked effectively with a difficult colleague.',
      'Tell me about a situation where you stepped in to help a teammate who was overwhelmed.',
      'How do you handle conflict with a charge nurse or supervisor?',
      'Give me an example of how you contributed to a team effort that improved patient outcomes.',
      'Tell me about a time you collaborated with another department to solve a problem.',
    ],
  },
  {
    category: 'Stress Management & Resilience',
    icon: '💪',
    description: 'Questions about handling high-pressure situations and preventing burnout.',
    questions: [
      'How do you manage stress during a particularly difficult shift?',
      'Tell me about a time you felt overwhelmed and how you handled it.',
      'Describe the most challenging shift you\'ve ever worked. What did you learn?',
      'How do you maintain your well-being and prevent burnout?',
      'Tell me about a time you had to stay calm during an emergency.',
    ],
  },
  {
    category: 'New Graduate Specific',
    icon: '🎓',
    description: 'Common questions for new grad nurses entering their first RN role.',
    questions: [
      'Why did you choose nursing? What drew you to this specialty?',
      'What was your most impactful clinical rotation and what did you learn?',
      'How do you handle situations where you don\'t know the answer?',
      'Tell me about a time during clinicals when you received constructive feedback.',
      'Where do you see yourself in 5 years as a nurse?',
      'How would you handle a situation where a patient refuses care?',
    ],
  },
  {
    category: 'Ethics & Professionalism',
    icon: '⚖️',
    description: 'Questions about ethical dilemmas, boundaries, and professional standards.',
    questions: [
      'Tell me about an ethical dilemma you faced in clinical practice.',
      'How do you handle a situation where you witness a colleague making an error?',
      'Describe a time you had to set professional boundaries with a patient or family.',
      'How do you handle cultural differences in patient care?',
      'Tell me about a time you had to follow a policy you disagreed with.',
    ],
  },
  {
    category: 'Specialty-Specific (ED, ICU, OR, L&D)',
    icon: '🩺',
    description: 'Questions tailored to specific nursing specialties and units.',
    questions: [
      'What experience do you have with [specialty]-specific patient populations?',
      'How do you stay current with evidence-based practice in your specialty?',
      'Describe a time you had to manage a rapidly deteriorating patient.',
      'Tell me about your experience with [specialty-specific equipment or procedures].',
      'How do you handle high patient acuity and fast-paced environments?',
    ],
  },
];

function CategoryCard({ category, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <span className="text-lg font-semibold text-gray-900">{category.category}</span>
            <span className="text-sm text-gray-500 ml-2">({category.questions.length} questions)</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 bg-white">
          <p className="text-sm text-gray-500 mb-4 italic">{category.description}</p>
          <ol className="space-y-3">
            {category.questions.map((q, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="bg-sky-100 text-sky-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700">{q}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/nurse"
              className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center gap-1"
            >
              Practice nursing questions with AI <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NursingInterviewQuestionsPage() {
  const [openCategories, setOpenCategories] = useState(new Set([0]));

  const toggleCategory = (index) => {
    const next = new Set(openCategories);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setOpenCategories(next);
  };

  const totalQuestions = nursingCategories.reduce((sum, c) => sum + c.questions.length, 0);

  useDocumentHead({
    title: `${totalQuestions} Nursing Interview Questions by Category (2026) | NurseInterviewPro`,
    description: `${totalQuestions} nursing interview questions for RNs, new grads, and specialty nurses. Covers patient care, SBAR communication, teamwork, ethics, and more. Practice with AI coaching.`,
    keywords: 'nursing interview questions, nurse interview questions and answers, nursing behavioral interview questions, new grad nurse interview questions, SBAR interview, nursing interview tips, RN interview questions, ICU nurse interview, ED nurse interview, nursing interview preparation 2026, clinical interview questions nursing',
    canonical: 'https://www.interviewanswers.ai/nursing-interview-questions',
    og: {
      title: `${totalQuestions} Nursing Interview Questions by Category (2026)`,
      description: 'Complete nursing interview question bank. Practice with AI coaching built by nurses, for nurses.',
      url: 'https://www.interviewanswers.ai/nursing-interview-questions',
      type: 'article',
    },
    twitter: {
      title: `${totalQuestions} Nursing Interview Questions (2026)`,
      description: 'Complete nursing interview question bank with AI coaching. Built by nurses, for nurses.',
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/nurse" className="text-sky-600 hover:text-sky-700 text-sm font-medium hidden sm:block">
              <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" /> NurseInterviewPro</span>
            </Link>
            <Link
              to="/onboarding"
              className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-600 transition-all"
            >
              Practice Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/nurse" className="hover:text-sky-600 transition-colors">Nursing Interviews</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Interview Questions</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">NURSING</span>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">QUESTION BANK</span>
          <span className="text-sm text-gray-500">Updated February 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {totalQuestions} Nursing Interview Questions<br className="hidden sm:block" />
          <span className="text-sky-600">Every Category You'll Face</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Whether you're a new grad preparing for your first RN position or an experienced nurse switching specialties,
          these are the questions you'll hear in nursing interviews. Organized by category so you can focus your preparation.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-8">
          <div className="bg-sky-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">{totalQuestions}</span> <span className="text-gray-500">questions</span>
          </div>
          <div className="bg-sky-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">{nursingCategories.length}</span> <span className="text-gray-500">categories</span>
          </div>
          <div className="bg-sky-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">AI Practice</span> <span className="text-gray-500">with SBAR coaching</span>
          </div>
        </div>
      </header>

      {/* Framework Tips */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-600" />
            Two Frameworks Every Nurse Should Know
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">STAR Method</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Situation → Task → Action → Result.</strong> Use this for behavioral questions
                like "Tell me about a time..." Perfect for demonstrating leadership, teamwork, and problem-solving.
              </p>
              <Link to="/star-method-guide" className="text-teal-600 hover:text-teal-700 text-sm font-medium inline-flex items-center gap-1">
                Learn STAR Method <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">SBAR Framework</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Situation → Background → Assessment → Recommendation.</strong> Use this for clinical scenario questions.
                Shows you can communicate clearly with physicians and the care team.
              </p>
              <Link to="/nurse" className="text-sky-600 hover:text-sky-700 text-sm font-medium inline-flex items-center gap-1">
                Practice SBAR Drills <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Questions by Category */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Nursing Interview Questions by Category</h2>
        <div className="space-y-4">
          {nursingCategories.map((cat, i) => (
            <CategoryCard
              key={cat.category}
              category={cat}
              isOpen={openCategories.has(i)}
              onToggle={() => toggleCategory(i)}
            />
          ))}
        </div>

        {/* Tips Section */}
        <section className="mt-16 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nursing Interview Tips</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Use Real Clinical Experiences', desc: 'Interviewers can tell when you\'re making it up. Draw from clinicals, preceptorships, and previous positions. Genuine stories — even modest ones — are always more convincing.' },
              { title: 'Know Your Specialty', desc: 'Research the specific unit and patient population. Mention relevant certifications, populations you\'ve cared for, and why you\'re passionate about this specialty.' },
              { title: 'Demonstrate Patient Advocacy', desc: 'Nursing interviews always come back to patient safety. Have 2-3 stories ready that show you prioritize patient well-being, even when it\'s uncomfortable.' },
              { title: 'Practice Out Loud', desc: 'Reading your answers silently is not the same as speaking them. Practice with a colleague, a mentor, or an AI mock interviewer to build fluency and confidence.' },
            ].map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-7 h-7" />
            <span className="text-sky-200 font-medium">NurseInterviewPro.ai</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Practice Nursing Interview Questions with AI</h2>
          <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
            AI mock interviews designed specifically for nurses. SBAR drills, STAR coaching,
            specialty-specific questions across ED, ICU, OR, L&D, Pediatrics, and more.
            Built by nurses, for nurses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-sky-700 font-bold px-8 py-4 rounded-xl hover:bg-sky-50 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/nurse"
              className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Learn More About NurseInterviewPro
            </Link>
          </div>
          <p className="text-sky-200 text-sm mt-4">No credit card required. Free tier includes mock interview sessions.</p>
        </section>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">InterviewAnswers.ai</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="/star-method-guide" className="hover:text-white transition-colors">STAR Method Guide</Link>
              <Link to="/behavioral-interview-questions" className="hover:text-white transition-colors">Behavioral Questions</Link>
              <Link to="/nurse" className="hover:text-white transition-colors">NurseInterviewPro</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} InterviewAnswers.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
