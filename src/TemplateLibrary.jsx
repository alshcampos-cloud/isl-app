import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { BookOpen, Plus, ChevronRight, AlertCircle, CheckCircle, X } from 'lucide-react'

function TemplateLibrary({ onImport, onClose }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateQuestions, setTemplateQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setTemplates(data)
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplateQuestions = async (templateId) => {
    try {
      const { data, error } = await supabase
        .from('template_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setTemplateQuestions(data)
      setSelectedTemplate(templates.find(t => t.id === templateId))
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Failed to load questions')
    }
  }

  const handleImport = async () => {
    if (!selectedTemplate) return

    setImporting(true)
    try {
      // Convert template questions to user's question format
      const questionsToImport = templateQuestions.map(tq => ({
        question: tq.question_text,
        category: tq.category,
        priority: tq.priority,
        bullets: tq.structure_prompts || [],
        narrative: '',
        keywords: [],
        followups: [],
        // Add authenticity tips as a special field
        authenticityTips: tq.authenticity_tips || [],
        timingGuidance: tq.timing_guidance || ''
      }))

      // Pass to parent component to add to user's questions
      if (onImport) {
        onImport(questionsToImport)
      }

      alert(`Successfully imported ${questionsToImport.length} questions!`)
      if (onClose) onClose()
    } catch (err) {
      console.error('Error importing:', err)
      setError('Failed to import questions')
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

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
        <div className="flex-1 overflow-hidden flex">
          {/* Template List */}
          <div className="w-1/3 border-r overflow-y-auto p-6">
            <h3 className="font-bold text-lg mb-4">Available Templates</h3>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => fetchTemplateQuestions(template.id)}
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
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedTemplate ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Select a template to preview questions</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg mb-4">
                  {selectedTemplate.name} ({templateQuestions.length} questions)
                </h3>
                <div className="space-y-6">
                  {templateQuestions.map((q, idx) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{q.question_text}</h4>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{q.category}</span>
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{q.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Structure Prompts */}
                      {q.structure_prompts && q.structure_prompts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Structure Your Answer:</p>
                          <ul className="space-y-1">
                            {q.structure_prompts.map((prompt, i) => (
                              <li key={i} className="text-sm text-gray-600 flex gap-2">
                                <span className="text-indigo-600">•</span>
                                <span>{prompt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timing Guidance */}
                      {q.timing_guidance && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-900">
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              These questions will be added to your question bank. You can customize them with YOUR details.
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {importing ? (
                'Importing...'
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Import {templateQuestions.length} Questions
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateLibrary