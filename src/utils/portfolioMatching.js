// Portfolio → Question Bank Matching
// ============================================================
// Fuzzy-matches portfolio "questionsThisAnswers" strings to real
// question bank entries, enabling "Practice this question →" links.
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

/**
 * Extract meaningful words from a string (lowercase, no stop words).
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'during', 'before', 'after', 'above', 'below', 'and', 'but',
  'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
  'if', 'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'this',
  'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
  'tell', 'describe', 'explain', 'give', 'example', 'time',
]);

function extractWords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Calculate word overlap score between two strings.
 * Returns 0-1 where 1 = perfect match.
 */
function overlapScore(textA, textB) {
  const wordsA = extractWords(textA);
  const wordsB = extractWords(textB);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setB = new Set(wordsB);
  const matches = wordsA.filter(w => setB.has(w)).length;

  // Jaccard-like: matches / union size
  const setA = new Set(wordsA);
  const union = new Set([...setA, ...setB]);
  return matches / union.size;
}

/**
 * Match portfolio projects' questionsThisAnswers to real question bank entries.
 *
 * @param {Array} projects - Portfolio projects (each has questionsThisAnswers[])
 * @param {Array} questions - Question bank entries (each has { id, question })
 * @param {number} threshold - Minimum overlap score (default 0.25)
 * @returns {Object} Map of questionId → [{ projectId, projectTitle, matchedText, score }]
 */
export function matchPortfolioToQuestions(projects, questions, threshold = 0.25) {
  if (!projects?.length || !questions?.length) return {};

  const matches = {};

  for (const project of projects) {
    if (!project.isAnalyzed || !project.questionsThisAnswers?.length) continue;

    for (const answerText of project.questionsThisAnswers) {
      // answerText is a string like "Tell me about a time you led a project"
      const text = typeof answerText === 'string' ? answerText : answerText?.text || '';
      if (!text) continue;

      for (const q of questions) {
        const score = overlapScore(text, q.question);
        if (score >= threshold) {
          if (!matches[q.id]) matches[q.id] = [];
          // Avoid duplicate project entries for the same question
          if (!matches[q.id].some(m => m.projectId === project.id)) {
            matches[q.id].push({
              projectId: project.id,
              projectTitle: project.title,
              matchedText: text,
              score,
            });
          }
        }
      }
    }
  }

  // Sort each question's matches by score descending
  for (const qId of Object.keys(matches)) {
    matches[qId].sort((a, b) => b.score - a.score);
  }

  return matches;
}

/**
 * For a single project, find matching questions from the question bank.
 * Returns array of { questionId, questionText, score } sorted by score desc.
 */
export function findQuestionsForProject(project, questions, threshold = 0.25) {
  if (!project?.questionsThisAnswers?.length || !questions?.length) return [];

  const seen = new Set();
  const results = [];

  for (const answerText of project.questionsThisAnswers) {
    const text = typeof answerText === 'string' ? answerText : answerText?.text || '';
    if (!text) continue;

    for (const q of questions) {
      if (seen.has(q.id)) continue;
      const score = overlapScore(text, q.question);
      if (score >= threshold) {
        seen.add(q.id);
        results.push({
          questionId: q.id,
          questionText: q.question,
          score,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
