import { useState } from 'react';
import { BookOpen, Plus, ChevronRight, CheckCircle, X, Lightbulb, Sparkles } from 'lucide-react';

// Hardcoded templates - no database needed!
const TEMPLATES = [
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Core PM questions covering strategy, metrics, and execution',
    industry: 'Product',
    is_free: true,
    questions: [
      {
        id: 'pm-1',
        question_text: 'Tell me about a time you launched a product feature that failed',
        category: 'Product Strategy',
        priority: 'High',
        structure_prompts: [
          'What was the feature and why did you build it?',
          'What went wrong and how did you discover it?',
          'How did you respond and what did you learn?',
          'What would you do differently next time?'
        ],
        timing_guidance: 'Aim for 2-3 minutes. Show humility and learning.',
        authenticity_tips: [
          'Pick a real failure, not a humble-brag',
          'Be specific about metrics that showed failure',
          'Show genuine reflection on what you learned'
        ]
      },
      {
        id: 'pm-2',
        question_text: 'How do you prioritize features on your roadmap?',
        category: 'Product Strategy',
        priority: 'High',
        structure_prompts: [
          'Describe your prioritization framework (RICE, value vs effort, etc.)',
          'How do you gather input from stakeholders?',
          'Give a specific example of a tough prioritization decision',
          'How do you communicate priorities to the team?'
        ],
        timing_guidance: 'Aim for 2-3 minutes. Show systematic thinking.',
        authenticity_tips: [
          'Name the actual framework you use',
          'Mention specific tools (Jira, ProductBoard, etc.)',
          'Share a real tradeoff you made'
        ]
      },
      {
        id: 'pm-3',
        question_text: 'Tell me about a time you had to influence without authority',
        category: 'Leadership',
        priority: 'High',
        structure_prompts: [
          'What was the situation and who did you need to influence?',
          'What tactics did you use to build buy-in?',
          'What obstacles did you face?',
          'What was the outcome?'
        ],
        timing_guidance: 'Aim for 2-3 minutes.',
        authenticity_tips: [
          'Show empathy for the other person\'s perspective',
          'Mention specific persuasion techniques you used',
          'Don\'t make yourself sound manipulative'
        ]
      }
    ]
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    description: 'Technical and behavioral questions for engineering roles',
    industry: 'Engineering',
    is_free: true,
    questions: [
      {
        id: 'swe-1',
        question_text: 'Tell me about a time you had to debug a difficult production issue',
        category: 'Technical Problem Solving',
        priority: 'High',
        structure_prompts: [
          'What was the issue and how did it manifest?',
          'What was your debugging process?',
          'What tools and techniques did you use?',
          'What was the root cause and how did you fix it?',
          'What did you do to prevent it in the future?'
        ],
        timing_guidance: 'Aim for 2-3 minutes. Show systematic debugging approach.',
        authenticity_tips: [
          'Mention specific tools (logs, metrics, debuggers)',
          'Share actual commands or techniques you used',
          'Don\'t skip over false starts or wrong hypotheses'
        ]
      },
      {
        id: 'swe-2',
        question_text: 'Describe a time you had to make a technical tradeoff',
        category: 'System Design',
        priority: 'High',
        structure_prompts: [
          'What was the technical decision you faced?',
          'What were the options and their tradeoffs?',
          'How did you evaluate the options?',
          'What did you decide and why?',
          'What was the outcome?'
        ],
        timing_guidance: 'Aim for 2-3 minutes.',
        authenticity_tips: [
          'Be specific about technical constraints',
          'Mention actual technologies/frameworks',
          'Show you considered multiple perspectives'
        ]
      },
      {
        id: 'swe-3',
        question_text: 'Tell me about a time you improved code quality or system performance',
        category: 'Technical Excellence',
        priority: 'Medium',
        structure_prompts: [
          'What was the problem with the existing code/system?',
          'How did you identify the opportunity?',
          'What changes did you make?',
          'What was the measurable impact?'
        ],
        timing_guidance: 'Aim for 2 minutes. Focus on impact.',
        authenticity_tips: [
          'Include actual metrics (latency reduced by X%, etc.)',
          'Mention specific patterns or techniques',
          'Show you balanced perfection vs. pragmatism'
        ]
      }
    ]
  },
  {
    id: 'general-behavioral',
    name: 'General Behavioral',
    description: 'Common behavioral questions for any role',
    industry: 'All Industries',
    is_free: true,
    questions: [
      {
        id: 'gen-1',
        question_text: 'Tell me about yourself',
        category: 'Introduction',
        priority: 'Critical',
        structure_prompts: [
          'Brief personal background (30 seconds)',
          'Key professional experiences (1 minute)',
          'Why you\'re interested in this role (30 seconds)'
        ],
        timing_guidance: 'Keep to 2 minutes total. This sets the tone.',
        authenticity_tips: [
          'Don\'t just recite your resume',
          'Connect your experiences to the role you\'re applying for',
          'Show passion for your work'
        ]
      },
      {
        id: 'gen-2',
        question_text: 'What is your greatest weakness?',
        category: 'Self-Awareness',
        priority: 'High',
        structure_prompts: [
          'Name a real weakness (not a humble-brag)',
          'Explain how it has affected your work',
          'Describe what you\'re doing to improve',
          'Show progress you\'ve made'
        ],
        timing_guidance: 'Aim for 1-2 minutes.',
        authenticity_tips: [
          'Pick a real weakness, not "I work too hard"',
          'Show genuine self-awareness',
          'Demonstrate growth mindset'
        ]
      },
      {
        id: 'gen-3',
        question_text: 'Why do you want to work here?',
        category: 'Motivation',
        priority: 'High',
        structure_prompts: [
          'What specifically excites you about the company?',
          'How does this role align with your career goals?',
          'What unique value can you bring?'
        ],
        timing_guidance: 'Aim for 1-2 minutes.',
        authenticity_tips: [
          'Reference specific company initiatives or values',
          'Connect to your personal career narrative',
          'Avoid generic answers about "learning" or "growth"'
        ]
      },
      {
        id: 'gen-4',
        question_text: 'Tell me about a time you received critical feedback',
        category: 'Growth Mindset',
        priority: 'Medium',
        structure_prompts: [
          'What was the feedback and who gave it?',
          'How did you initially react?',
          'What actions did you take?',
          'What was the result?'
        ],
        timing_guidance: 'Aim for 2 minutes.',
        authenticity_tips: [
          'Share a substantive piece of feedback, not something minor',
          'Show emotional maturity in how you received it',
          'Demonstrate concrete behavior change'
        ]
      },
      {
        id: 'gen-5',
        question_text: 'Describe a time you disagreed with your manager',
        category: 'Conflict Resolution',
        priority: 'Medium',
        structure_prompts: [
          'What was the disagreement about?',
          'How did you approach the conversation?',
          'What was the outcome?',
          'What did you learn about handling disagreements?'
        ],
        timing_guidance: 'Aim for 2 minutes.',
        authenticity_tips: [
          'Show respect even when disagreeing',
          'Focus on ideas, not personalities',
          'Demonstrate professional maturity'
        ]
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Business',
    description: 'Questions for marketing, sales, and business roles',
    industry: 'Marketing',
    is_free: true,
    questions: [
      {
        id: 'mkt-1',
        question_text: 'Tell me about a successful campaign you ran',
        category: 'Campaign Management',
        priority: 'High',
        structure_prompts: [
          'What was the campaign goal and target audience?',
          'What was your strategy and execution plan?',
          'What channels did you use and why?',
          'What were the measurable results?',
          'What did you learn?'
        ],
        timing_guidance: 'Aim for 2-3 minutes. Focus on metrics.',
        authenticity_tips: [
          'Include specific numbers (CTR, conversion rate, ROI)',
          'Mention actual tools and platforms you used',
          'Be honest about what worked and what didn\'t'
        ]
      },
      {
        id: 'mkt-2',
        question_text: 'How do you measure marketing success?',
        category: 'Analytics',
        priority: 'High',
        structure_prompts: [
          'What metrics matter most for your campaigns?',
          'How do you set targets and benchmarks?',
          'How do you tie marketing to business outcomes?',
          'Give an example of optimizing based on data'
        ],
        timing_guidance: 'Aim for 2 minutes.',
        authenticity_tips: [
          'Name specific metrics and tools',
          'Show you understand funnel metrics',
          'Connect marketing metrics to revenue'
        ]
      },
      {
        id: 'mkt-3',
        question_text: 'Tell me about a time you had to work with a tight budget',
        category: 'Resource Management',
        priority: 'Medium',
        structure_prompts: [
          'What was the constraint and what were you trying to achieve?',
          'How did you prioritize and make tradeoffs?',
          'What creative solutions did you find?',
          'What was the outcome?'
        ],
        timing_guidance: 'Aim for 2 minutes.',
        authenticity_tips: [
          'Show resourcefulness and creativity',
          'Mention specific budget numbers if possible',
          'Demonstrate ROI thinking'
        ]
      }
    ]
  }
];

function TemplateLibrary({ onImport, onClose, onOpenAICoach, checkUsageLimit }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleImport = async () => {
    if (!selectedTemplate) return;

    setImporting(true);
    try {
      // Convert template questions to user's question format
      const questionsToImport = selectedTemplate.questions.map(tq => ({
        question: tq.question_text,
        category: tq.category,
        priority: tq.priority,
        bullets: tq.structure_prompts || [],
        narrative: '',
        keywords: [],
        followups: [],
        authenticityTips: tq.authenticity_tips || [],
        timingGuidance: tq.timing_guidance || ''
      }));

      // Pass to parent component to add to user's questions
      if (onImport) {
        onImport(questionsToImport);
      }

      alert(`✅ Successfully imported ${questionsToImport.length} questions from ${selectedTemplate.name}!`);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error importing:', err);
      alert('Failed to import questions. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportSingle = async (templateQuestion) => {
    try {
      const questionToImport = {
        question: templateQuestion.question_text,
        category: templateQuestion.category,
        priority: templateQuestion.priority,
        bullets: templateQuestion.structure_prompts || [],
        narrative: '',
        keywords: [],
        followups: [],
        authenticityTips: templateQuestion.authenticity_tips || [],
        timingGuidance: templateQuestion.timing_guidance || ''
      };

      if (onImport) {
        onImport([questionToImport]);
      }

      alert(`✅ Added "${templateQuestion.question_text}" to your Question Bank!`);
    } catch (err) {
      console.error('Error importing single question:', err);
      alert('Failed to import question. Please try again.');
    }
  };

  const handleAICoach = async (templateQuestion) => {
    // Check usage limit first
    if (checkUsageLimit) {
      const canUse = await checkUsageLimit();
      if (!canUse) return; // Limit reached, modal shown by parent
    }

    // Create question object for AI Coach
    const questionForCoach = {
      question: templateQuestion.question_text,
      category: templateQuestion.category,
      priority: templateQuestion.priority,
      bullets: templateQuestion.structure_prompts || [],
      narrative: '',
      keywords: [],
      followups: [],
      id: `template-${templateQuestion.id}` // Temporary ID
    };

    if (onOpenAICoach) {
      onOpenAICoach(questionForCoach);
    }
  };

  const templateQuestions = selectedTemplate?.questions || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold">Question Templates</h2>
              <p className="text-gray-600 text-sm">Start with pre-built questions, customize with YOUR stories</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Template List */}
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto p-4 md:p-6 max-h-[30vh] md:max-h-none">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Available Templates</h3>
            <div className="space-y-3">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{template.industry}</span>
                        {template.is_free && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Free</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Preview */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!selectedTemplate ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-sm md:text-base">Select a template to preview questions</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                  {selectedTemplate.name} ({templateQuestions.length} questions)
                </h3>
                <div className="space-y-4">
                  {templateQuestions.map((q, idx) => (
                    <div key={q.id} className="border-2 border-gray-200 rounded-xl p-3 md:p-4 hover:border-indigo-300 transition">
                      <div className="flex items-start gap-2 md:gap-3 mb-3">
                        <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{q.question_text}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{q.category}</span>
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{q.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Structure Prompts */}
                      {q.structure_prompts && q.structure_prompts.length > 0 && (
                        <div className="mb-3 bg-gray-50 rounded-lg p-2 md:p-3">
                          <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">📝 Structure Your Answer:</p>
                          <ul className="space-y-1">
                            {q.structure_prompts.map((prompt, i) => (
                              <li key={i} className="text-xs md:text-sm text-gray-600 flex gap-2">
                                <span className="text-indigo-600">•</span>
                                <span>{prompt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timing Guidance */}
                      {q.timing_guidance && (
                        <div className="mb-3 p-2 md:p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs md:text-sm text-blue-900">
                            <span className="font-semibold">⏱️ Timing:</span> {q.timing_guidance}
                          </p>
                        </div>
                      )}

                      {/* Authenticity Tips */}
                      {q.authenticity_tips && q.authenticity_tips.length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm font-semibold text-amber-900 mb-2">💡 Be Authentic:</p>
                          <ul className="space-y-1">
                            {q.authenticity_tips.map((tip, i) => (
                              <li key={i} className="text-sm text-amber-800 flex gap-2">
                                <span>•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
                        {onOpenAICoach && (
                          <button
                            onClick={() => handleAICoach(q)}
                            className="flex-1 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                          >
                            <Lightbulb className="w-4 h-4" />
                            <span className="hidden sm:inline">Can't Think of Answer?</span>
                            <span>AI Coach</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleImportSingle(q)}
                          className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Bank</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-600">
              These questions will be added to your question bank. You can customize them with YOUR details.
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 md:px-6 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
            >
              {importing ? (
                'Importing...'
              ) : (
                <>
                  <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
                  Import All {templateQuestions.length} Questions
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateLibrary;
