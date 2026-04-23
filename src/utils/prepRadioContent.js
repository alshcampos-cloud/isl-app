/**
 * prepRadioContent.js — Content generators for Prep Radio episodes.
 * Phase 4K v2: Much richer teaching content with recall techniques,
 * answer analysis, interviewer psychology, and spaced repetition cues.
 *
 * Writing rules for TTS quality:
 * - Keep sentences SHORT (12-18 words max). TTS handles these best.
 * - Use '...' for 2-second pauses between ideas.
 * - Use commas liberally — they create micro-pauses.
 * - Rhetorical questions engage the listener's brain.
 * - Repeat key concepts (spaced repetition in audio form).
 * - Write conversationally — "you" / "your" / "let's" / "think about"
 */

// ---------------------------------------------------------------------------
// Helper: chunk a long sentence into TTS-friendly pieces
// ---------------------------------------------------------------------------
function chunkForTTS(text, maxLen = 80) {
  if (!text || text.length <= maxLen) return [text];
  // Split on sentence boundaries first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Split on commas/semicolons
      const parts = trimmed.split(/[,;]/).map(p => p.trim()).filter(Boolean);
      chunks.push(...parts);
    }
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// 1. DAILY BRIEFING — Smarter, data-driven, motivational
// ---------------------------------------------------------------------------
export function generateDailyBriefing(context) {
  const {
    targetRole, targetCompany, daysUntil,
    questionCount, sessionCount, weakestCategory,
  } = context;
  const lines = [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  lines.push(`Good ${greeting}. Let's get you ready.`);
  lines.push('...');

  // Interview countdown context
  if (targetCompany && targetRole) {
    if (daysUntil !== null && daysUntil !== undefined) {
      if (daysUntil === 0) {
        lines.push(`Today is your interview at ${targetCompany}.`);
        lines.push('You have prepared for this moment. Trust that preparation.');
        lines.push('Remember: they already liked your resume enough to invite you. Your job today is to confirm what they already believe.');
      } else if (daysUntil <= 3) {
        lines.push(`${daysUntil} day${daysUntil !== 1 ? 's' : ''} until ${targetCompany}. Final stretch.`);
        lines.push("Don't cram new material now. Review what you know. Polish your best stories.");
      } else if (daysUntil <= 7) {
        lines.push(`${daysUntil} days until your interview at ${targetCompany}, for the ${targetRole} role.`);
        lines.push('This is the sweet spot. Still time to sharpen weak areas, but close enough to feel the urgency.');
      } else {
        lines.push(`You have ${daysUntil} days until your ${targetRole} interview at ${targetCompany}.`);
        lines.push("That's plenty of time to build real confidence. Consistency beats intensity.");
      }
    } else {
      lines.push(`You're prepping for ${targetRole} at ${targetCompany}. Let's make it count.`);
    }
    lines.push('...');
  }

  // Practice stats — make them meaningful
  if (sessionCount && sessionCount > 0) {
    if (sessionCount >= 50) {
      lines.push(`${sessionCount} practice sessions completed. You're in the top tier of preparation.`);
      lines.push('Most candidates do zero prep. You have done fifty or more. That gap is your advantage.');
    } else if (sessionCount >= 20) {
      lines.push(`${sessionCount} sessions done. Your consistency is paying off.`);
      lines.push("At this point, you're not just memorizing. You're building reflex. Answers should start feeling automatic.");
    } else if (sessionCount >= 5) {
      lines.push(`${sessionCount} sessions so far. Good momentum.`);
      lines.push('Push for five more this week. Each session carves the neural pathway deeper.');
    } else {
      lines.push(`You've started with ${sessionCount} session${sessionCount !== 1 ? 's' : ''}. The hardest part, starting, is behind you.`);
    }
    lines.push('...');
  }

  // Weakness coaching — don't just name it, explain WHY it matters
  if (weakestCategory) {
    lines.push(`Your data shows ${weakestCategory} as your biggest gap.`);
    if (weakestCategory === 'Core Narrative') {
      lines.push("That's your personal brand story. The tell me about yourself question. It's almost always the first question, and it sets the tone for everything after it.");
      lines.push("Spend ten minutes today tightening that narrative. Make it 90 seconds. Make it specific.");
    } else if (weakestCategory === 'Behavioral') {
      lines.push("Behavioral questions are where most interviews are won or lost. They're testing if you've actually done what you claim.");
      lines.push("The secret: specificity. Vague answers score 4 out of 10. Specific answers with numbers score 8 out of 10.");
    } else if (weakestCategory === 'Technical') {
      lines.push('Technical questions test your domain knowledge. But here is the thing. They also test how you communicate complexity.');
      lines.push("Even if you know the answer, a rambling explanation fails. Structure your response. Lead with the conclusion.");
    } else {
      lines.push(`Focus your next few sessions on ${weakestCategory} questions. Even 15 minutes of targeted practice moves the needle.`);
    }
    lines.push('...');
  }

  // Rotating tip of the day
  const tips = [
    [
      'Quick tip for today. The best interview answers follow one rule.',
      '"Show, don\'t tell." Don\'t say you\'re a leader. Tell a story that proves it.',
      'Anyone can claim a quality. Only evidence makes it believable.',
    ],
    [
      "Here's something most candidates miss.",
      "The interviewer isn't just evaluating your answer. They're evaluating how you think.",
      "When you pause, organize your thoughts, and then speak clearly? That's a signal of competence.",
      "Rushing is the opposite of confidence.",
    ],
    [
      'A reminder about the STAR method.',
      'Most people nail the Situation and Action, but skip the Result.',
      "The Result is where you prove impact. Always end with a number, a percentage, or a concrete outcome.",
      "If you can't quantify it, describe what changed because of your work.",
    ],
    [
      "Today's focus: the power of silence.",
      "When they ask a question, you do NOT have to start talking immediately.",
      "Take two or three seconds. Organize your thoughts. Then begin.",
      "Interviewers respect the pause. It shows you're thoughtful, not rehearsed.",
    ],
    [
      "One thing that separates good from great candidates.",
      "Great candidates connect their past to the role's future.",
      '"In my last role I did X, and I see that directly applying to your challenge of Y."',
      "That bridge, from your experience to their needs, is what makes them think: this person gets it.",
    ],
  ];
  const todayTip = tips[new Date().getDate() % tips.length];
  todayTip.forEach(line => lines.push(line));
  lines.push('...');

  // Motivational closer
  const closers = [
    'You are more prepared than you think. Go show them.',
    "The interview isn't a test. It's a conversation. And you have a great story to tell.",
    'Remember: they need someone for this role. You might be exactly who they need.',
    "Every session you've done is an investment. Today, that investment compounds.",
  ];
  lines.push(closers[Math.floor(Math.random() * closers.length)]);

  return lines;
}

// ---------------------------------------------------------------------------
// 2. QUESTION WALKTHROUGH — Deep teaching, not surface reading
// ---------------------------------------------------------------------------
export function generateQuestionWalkthrough(question, sparkNotes) {
  const lines = [];

  lines.push("Let's break down a question together.");
  lines.push('...');
  lines.push(`The question is: "${question.question}"`);
  lines.push('...');

  // Interviewer psychology — what are they REALLY testing?
  if (sparkNotes?.whatTheyreReallyAsking) {
    lines.push("Here's what the interviewer is really looking for.");
    chunkForTTS(sparkNotes.whatTheyreReallyAsking).forEach(c => lines.push(c));
    lines.push('...');
  } else {
    // Generic interviewer psychology based on question category
    const cat = question.category?.toLowerCase() || '';
    if (cat.includes('behavioral')) {
      lines.push("This is a behavioral question. The interviewer wants proof you've done this before.");
      lines.push("They believe past behavior predicts future performance. That's the science behind it.");
      lines.push("So don't give a hypothetical answer. Give a REAL story.");
    } else if (cat.includes('narrative') || cat.includes('about')) {
      lines.push('This tests your self-awareness and communication skills.');
      lines.push("They want to see: Can you tell a coherent story? Do you know your own strengths?");
    } else {
      lines.push("Think about what skill this question is testing. Is it leadership? Problem-solving? Teamwork?");
      lines.push("Once you know the skill, pick a story that proves you have it.");
    }
    lines.push('...');
  }

  // Framework guidance
  if (sparkNotes?.framework) {
    lines.push(`For this question, use the ${sparkNotes.framework.name} framework.`);
    lines.push('...');
    sparkNotes.framework.sections?.forEach(sec => {
      lines.push(`${sec.letter}, for ${sec.label}.`);
      if (sec.prompt) {
        chunkForTTS(sec.prompt).forEach(c => lines.push(c));
      }
      lines.push('...');
    });
  } else {
    lines.push("Structure your answer with STAR. Situation, Task, Action, Result.");
    lines.push('...');
    lines.push('Situation: Set the scene in one or two sentences. When, where, what was at stake.');
    lines.push('...');
    lines.push("Task: What was YOUR specific responsibility? Use the word 'I', not 'we'.");
    lines.push('...');
    lines.push('Action: Two to three concrete steps YOU took. This is the meat of your answer.');
    lines.push('...');
    lines.push('Result: The outcome, with numbers. Revenue, percentages, time saved, people impacted.');
    lines.push('...');
  }

  // What a great answer sounds like vs. a weak one
  lines.push("Let me describe what separates a weak answer from a strong one here.");
  lines.push('...');
  lines.push('A weak answer is vague. "I worked with the team and things improved."');
  lines.push('That tells the interviewer nothing. No specifics, no proof, no impact.');
  lines.push('...');
  lines.push('A strong answer is concrete. "I identified the bottleneck in our review process, reduced approval time from 5 days to 1 day, which saved the department 40 hours per month."');
  lines.push('See the difference? Numbers. Specifics. Clear personal ownership.');
  lines.push('...');

  // Power phrases
  if (sparkNotes?.powerPhrases?.length > 0) {
    lines.push('Here are phrases that signal competence for this type of question.');
    sparkNotes.powerPhrases.forEach(p => {
      lines.push(`Try saying: "${p}"`);
    });
    lines.push('...');
  }

  // Common mistakes
  if (sparkNotes?.commonMistakes?.length > 0) {
    lines.push("Mistakes to avoid.");
    sparkNotes.commonMistakes.slice(0, 3).forEach(m => {
      chunkForTTS(m).forEach(c => lines.push(c));
    });
    lines.push('...');
  }

  // Key takeaway
  if (sparkNotes?.oneThingToRemember) {
    lines.push('If you remember one thing about this question, remember this.');
    chunkForTTS(sparkNotes.oneThingToRemember).forEach(c => lines.push(c));
  } else {
    lines.push("The key: pick ONE specific story, tell it with numbers, and end with the result. That's it.");
  }
  lines.push('...');

  // Recall anchor
  lines.push(`Quick recall anchor. For "${question.question.substring(0, 50)}",`);
  if (question.keywords?.length > 0) {
    lines.push(`remember these keywords: ${question.keywords.slice(0, 3).join(', ')}.`);
  } else {
    lines.push('pick one word that triggers your story. Say it to yourself now.');
  }
  lines.push('...');

  return lines;
}

// ---------------------------------------------------------------------------
// 3. STORY REVIEW — Deeper, with recall strengthening
// ---------------------------------------------------------------------------
export function generateStoryReview(story) {
  const lines = [];

  lines.push(`Let's strengthen your story: "${story.title}".`);
  lines.push('...');
  lines.push('I will walk through each STAR section. As you listen, try to VISUALIZE the scene.');
  lines.push('Visualization is one of the strongest recall techniques. See it happening as I describe it.');
  lines.push('...');

  if (story.situation) {
    lines.push('Situation.');
    chunkForTTS(story.situation).forEach(c => lines.push(c));
    lines.push('...');
    lines.push('Can you picture that moment? Where were you standing? Who was there? Hold that image.');
    lines.push('...');
  }

  if (story.task) {
    lines.push('Task.');
    chunkForTTS(story.task).forEach(c => lines.push(c));
    lines.push('...');
  }

  if (story.actions?.length > 0) {
    lines.push('Actions you took.');
    const actionList = Array.isArray(story.actions) ? story.actions : [story.actions];
    actionList.filter(Boolean).forEach((a, i) => {
      lines.push(`Step ${i + 1}.`);
      chunkForTTS(a).forEach(c => lines.push(c));
      lines.push('...');
    });
  }

  if (story.result) {
    lines.push('Result.');
    chunkForTTS(story.result).forEach(c => lines.push(c));
    lines.push('...');
    lines.push('That result is your closer. In the interview, pause after you say it. Let it land.');
    lines.push('...');
  }

  if (story.skills?.length > 0) {
    lines.push(`This story proves: ${story.skills.join(', ')}.`);
    lines.push(`Which means you can use "${story.title}" for any question about ${story.skills.slice(0, 2).join(' or ')}.`);
    lines.push('...');
  }

  // Recall technique: one-word trigger
  lines.push('Recall trick. Pick one word for this story. A trigger word.');
  lines.push(`Maybe it's "${story.title.split(' ').slice(0, 2).join(' ')}". Maybe it's a name or a number from the result.`);
  lines.push('When you hear a question in the interview, that one word should pop into your head, and the whole story follows.');
  lines.push('...');

  return lines;
}

// ---------------------------------------------------------------------------
// 4. MOCK INTERVIEW — Richer prompting with after-answer coaching
// ---------------------------------------------------------------------------
export function generateMockInterviewAudio(questions) {
  const lines = [];
  const selected = questions.slice(0, 5);

  lines.push("Mental rehearsal time.");
  lines.push("This is proven to work. Athletes visualize before performing. Interviewees should too.");
  lines.push("I'll ask a question. You think through your answer. Then I'll coach you on what to hit.");
  lines.push('...');

  selected.forEach((q, i) => {
    lines.push(`Question ${i + 1} of ${selected.length}.`);
    lines.push('...');
    lines.push(`"${q.question}"`);
    lines.push('...');

    // Guided think time — more structured
    lines.push("First, which story comes to mind? Don't overthink it. Pick the first one.");
    lines.push('...');
    lines.push('Now, what was the situation? Set it in one sentence.');
    lines.push('...');
    lines.push("What was your task? What was YOUR specific role?");
    lines.push('...');
    lines.push("What did you DO? Think of two concrete actions. Remember, use 'I', not 'we'.");
    lines.push('...');
    lines.push("And the result. What changed? What number proves it?");
    lines.push('...');

    // After-answer coaching — what a great answer hits
    if (q.bullets?.length > 0) {
      lines.push("Here's what a strong answer to this question touches on.");
      q.bullets.slice(0, 3).forEach(b => {
        chunkForTTS(b).forEach(c => lines.push(c));
      });
      lines.push('...');
    }

    if (q.category) {
      lines.push(`This was a ${q.category} question. Interviewers use these to assess a specific competency.`);
      lines.push("If your story demonstrated that competency clearly, you nailed it.");
    }

    if (i < selected.length - 1) {
      lines.push('...');
      lines.push("Good. Shake it off. Fresh mind for the next one.");
      lines.push('...');
    }
  });

  lines.push('...');
  lines.push("That's all five. Nice work.");
  lines.push("Each time you do this, recall gets faster. Your brain is literally building interview reflexes.");
  lines.push("Do this once a day for a week and the real interview will feel like a rerun.");

  return lines;
}

// ---------------------------------------------------------------------------
// 5. NEW: ANSWER REVIEW — Walk through user's actual practice answers
// ---------------------------------------------------------------------------
export function generateAnswerReview(practiceHistory, questions) {
  const lines = [];

  // Find sessions with scores and answers
  const scored = practiceHistory
    .filter(s => s.feedback?.overall != null && s.answer)
    .sort((a, b) => (b.feedback?.overall || 0) - (a.feedback?.overall || 0));

  if (scored.length === 0) {
    lines.push("You don't have any scored practice answers yet.");
    lines.push("Complete a few practice sessions first, then come back here to review what worked and what didn't.");
    return lines;
  }

  lines.push("Let's review your actual practice answers.");
  lines.push("We'll look at what worked, what didn't, and how to improve.");
  lines.push("Hearing your own logic back helps cement the good patterns.");
  lines.push('...');

  // Take top 3 best and bottom 2 worst
  const best = scored.slice(0, 3);
  const worst = scored.length > 3 ? scored.slice(-2) : [];

  // Best answers first — reinforce success
  lines.push('First, your strongest answers. These are patterns to KEEP.');
  lines.push('...');

  best.forEach((session, i) => {
    const score = session.feedback.overall;
    const q = session.question || 'a practice question';
    lines.push(`Answer ${i + 1}. Score: ${score} out of 10.`);
    lines.push(`Question: "${q.length > 80 ? q.substring(0, 80) + '...' : q}"`);
    lines.push('...');

    // Read back key parts of their answer (first 200 chars)
    if (session.answer) {
      const answerPreview = session.answer.substring(0, 200);
      lines.push('Your answer started with:');
      chunkForTTS(answerPreview).forEach(c => lines.push(c));
      lines.push('...');
    }

    // Explain why it scored well
    if (score >= 8) {
      lines.push("This scored high because it likely had specific details, clear structure, and a measurable result.");
      lines.push("When you're in the real interview, channel this energy. This is your benchmark.");
    } else if (score >= 6) {
      lines.push("Good answer. To push it from good to great, look for one more specific detail or number you could add.");
    }

    // Framework analysis feedback
    const fa = session.feedback?.framework_analysis;
    if (fa) {
      const strong = [];
      const weak = [];
      if (fa.situation === 'Strong') strong.push('Situation');
      else if (fa.situation === 'Missing' || fa.situation === 'Weak') weak.push('Situation');
      if (fa.action === 'Strong') strong.push('Action');
      else if (fa.action === 'Missing' || fa.action === 'Weak') weak.push('Action');
      if (fa.result === 'Strong') strong.push('Result');
      else if (fa.result === 'Missing' || fa.result === 'Weak') weak.push('Result');

      if (strong.length > 0) {
        lines.push(`Your ${strong.join(' and ')} sections were strong. That's great.`);
      }
      if (weak.length > 0) {
        lines.push(`But your ${weak.join(' and ')} could use more detail next time.`);
      }
    }
    lines.push('...');
  });

  // Weakest answers — coach improvement
  if (worst.length > 0) {
    lines.push("Now, a couple answers that have room to grow. No judgment. This is where the learning happens.");
    lines.push('...');

    worst.forEach((session, i) => {
      const score = session.feedback.overall;
      const q = session.question || 'a practice question';
      lines.push(`Question: "${q.length > 60 ? q.substring(0, 60) + '...' : q}"`);
      lines.push(`Score: ${score} out of 10.`);
      lines.push('...');

      if (score <= 3) {
        lines.push("Low scores usually mean the answer was too vague or didn't follow the STAR structure.");
        lines.push("Next time, before you speak, think: What's my Situation? What's my Result? Start there.");
      } else {
        lines.push("This was close. One or two more specific details would bump it up significantly.");
        lines.push("Try adding a number. A percentage. A timeframe. Specificity is the fastest way to improve.");
      }
      lines.push('...');
    });
  }

  lines.push("That's your answer review. The pattern is clear: specific details and structured stories score highest.");
  lines.push("Keep practicing. Each session, your answers get sharper.");

  return lines;
}

// ---------------------------------------------------------------------------
// 6. NEW: RECALL COACH — Teach memory techniques for interview prep
// ---------------------------------------------------------------------------
export function generateRecallCoach(questions, stories, practiceHistory) {
  const lines = [];

  lines.push("Welcome to Recall Coach.");
  lines.push("This session teaches you techniques to remember your stories under pressure.");
  lines.push("In a real interview, nerves can blank your mind. These techniques prevent that.");
  lines.push('...');

  // Technique 1: Keyword Anchoring
  lines.push('Technique one: Keyword Anchoring.');
  lines.push('...');
  lines.push("For every question you might face, you need ONE trigger word.");
  lines.push("When you hear the question, this word fires in your brain, and your whole story follows.");
  lines.push("It's like a mental bookmark.");
  lines.push('...');

  // Practice with actual questions
  const sampleQs = questions.slice(0, 3);
  if (sampleQs.length > 0) {
    lines.push("Let's practice. I'll read a question. You think of ONE word.");
    lines.push('...');
    sampleQs.forEach(q => {
      lines.push(`"${q.question}"`);
      lines.push('...');
      lines.push("What's your one word? Say it out loud. Got it?");
      lines.push('...');
      if (q.keywords?.length > 0) {
        lines.push(`Some options: ${q.keywords.slice(0, 3).join(', ')}.`);
      }
      lines.push('...');
    });
  }

  // Technique 2: Story Mapping
  lines.push('Technique two: Story Mapping.');
  lines.push('...');
  lines.push("Here's the secret top interviewers know.");
  lines.push("You don't need a different answer for every question.");
  lines.push("You need seven to ten great stories. Each story answers three to five questions.");
  lines.push("That means with ten stories, you can handle fifty questions.");
  lines.push('...');

  if (stories && stories.length > 0) {
    lines.push(`You have ${stories.length} stories in your bank. Let's map them.`);
    lines.push('...');
    stories.slice(0, 3).forEach(s => {
      lines.push(`"${s.title}".`);
      if (s.skills?.length > 0) {
        lines.push(`This story covers: ${s.skills.join(', ')}.`);
        lines.push(`So any question about ${s.skills[0]} or ${s.skills.length > 1 ? s.skills[1] : 'related topics'}? This is your go-to.`);
      }
      lines.push('...');
    });
  } else {
    lines.push("You haven't added stories to your Story Bank yet.");
    lines.push('After this session, go add your three best career stories. That alone covers a lot of ground.');
    lines.push('...');
  }

  // Technique 3: The Opening Sentence
  lines.push('Technique three: The Opening Sentence.');
  lines.push('...');
  lines.push("This is the most practical technique.");
  lines.push("For each story, memorize ONLY the first sentence.");
  lines.push("Once you say that first sentence out loud, the rest flows naturally.");
  lines.push("It's like the first domino. You tip it, everything else falls.");
  lines.push('...');
  lines.push('For example, instead of memorizing your whole answer, just memorize:');
  lines.push('"In Q3 of last year, my team faced a critical deadline after two members left unexpectedly."');
  lines.push("That's your launch pad. From there, you tell the story naturally because you lived it.");
  lines.push('...');

  // Technique 4: Rehearsal Spacing
  lines.push('Technique four: Spaced Repetition.');
  lines.push('...');
  lines.push("Cramming doesn't work. Your brain discards crammed information within hours.");
  lines.push("But if you review the same material at increasing intervals, it sticks permanently.");
  lines.push("Review today. Then in two days. Then in five days. Then it's locked in.");
  lines.push('...');

  const totalPracticed = practiceHistory?.length || 0;
  if (totalPracticed > 0) {
    lines.push(`You have ${totalPracticed} practice sessions in your history.`);
    lines.push("That repetition is already building recall. But make sure you're spacing it out, not cramming.");
  }
  lines.push('...');

  // Technique 5: Body anchoring
  lines.push('Bonus technique: Body Anchoring.');
  lines.push('...');
  lines.push("Before your interview, pick a physical gesture. Like pressing your thumb and finger together.");
  lines.push("Every time you practice a great answer, do that gesture.");
  lines.push("In the real interview, that same gesture triggers confidence. Athletes do this. It works.");
  lines.push('...');

  // Close
  lines.push("Those are your five recall techniques. Keyword anchoring, story mapping, opening sentences, spaced repetition, and body anchoring.");
  lines.push("Even using one of these will make you calmer and sharper in the interview.");
  lines.push("You've got this.");

  return lines;
}

// ---------------------------------------------------------------------------
// 7. LEARN REVIEW — Replays audio from completed Learn lessons
// ---------------------------------------------------------------------------
export function generateLearnReview(completedLessons = []) {
  if (!completedLessons.length) {
    return [
      "You haven't completed any Learn lessons yet.",
      '...',
      "Head to the Learn section to start your first lesson.",
      "Once you complete a lesson, you can review it here hands-free.",
    ];
  }

  const lines = [];
  lines.push("Welcome to Learn Review.");
  lines.push("Let's revisit what you've learned recently.");
  lines.push('...');

  for (let i = 0; i < completedLessons.length; i++) {
    const lesson = completedLessons[i];
    if (!lesson?.audioScript) continue;

    if (i > 0) {
      lines.push('...');
      lines.push('...');
      lines.push(`Moving on to the next lesson: ${lesson.title}.`);
      lines.push('...');
    } else {
      lines.push(`First up: ${lesson.title}.`);
      lines.push('...');
    }

    // Include the lesson's audio content
    for (const line of lesson.audioScript) {
      lines.push(line);
    }
  }

  lines.push('...');
  lines.push("That's your review session. Great job reinforcing what you've learned.");
  lines.push("Repetition is the key to retention. Come back tomorrow for another review.");

  return lines;
}

// ---------------------------------------------------------------------------
// 8. AUDIO FLASHCARDS — Hands-free spaced repetition
// ---------------------------------------------------------------------------
export function generateAudioFlashcards(questions = [], practiceHistory = []) {
  const lines = [];

  lines.push("Audio Flashcards. Hands-free practice.");
  lines.push("I'll read a question. You get ten seconds to think. Then I'll share key answer points.");
  lines.push('...');
  lines.push("Let's begin.");
  lines.push('...');

  // Pick up to 10 questions, prioritizing low scores
  const scoredQuestions = questions.map(q => {
    const sessions = practiceHistory.filter(s => s.question === q.question);
    const avgScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.feedback?.overall ?? 5), 0) / sessions.length
      : 5;
    return { ...q, avgScore, practiced: sessions.length > 0 };
  });

  // Sort: unpracticed first, then by lowest score
  scoredQuestions.sort((a, b) => {
    if (a.practiced !== b.practiced) return a.practiced ? 1 : -1;
    return a.avgScore - b.avgScore;
  });

  const selected = scoredQuestions.slice(0, 10);

  if (selected.length === 0) {
    lines.push("You don't have any questions loaded yet.");
    lines.push("Add questions through the Question Bank or JD Decoder first.");
    return lines;
  }

  selected.forEach((q, idx) => {
    lines.push(`Question ${idx + 1} of ${selected.length}.`);
    lines.push('...');

    // Read the question
    const chunks = chunkForTTS(q.question, 80);
    chunks.forEach(c => lines.push(c));
    lines.push('...');

    // Think time (5 pauses = ~10 seconds)
    lines.push("Take a moment to think about your answer.");
    lines.push('...');
    lines.push('...');
    lines.push('...');
    lines.push('...');
    lines.push('...');

    // Answer points
    lines.push("Here are the key points to hit:");
    lines.push('...');

    if (q.bullets && q.bullets.length > 0) {
      q.bullets.slice(0, 4).forEach((b, bIdx) => {
        const bulletText = typeof b === 'string' ? b : b.text || String(b);
        lines.push(`Point ${bIdx + 1}: ${bulletText}`);
        lines.push('...');
      });
    } else if (q.narrative) {
      const parts = chunkForTTS(q.narrative, 80);
      parts.forEach(p => lines.push(p));
      lines.push('...');
    } else {
      lines.push("Focus on the STAR method. Be specific about YOUR actions and the measurable results.");
      lines.push('...');
    }

    if (idx < selected.length - 1) {
      lines.push("Next question coming up.");
      lines.push('...');
      lines.push('...');
    }
  });

  lines.push('...');
  lines.push(`That's all ${selected.length} flashcards. Great mental practice.`);
  lines.push("The more you rehearse, the more automatic your answers become.");
  lines.push("Keep it up.");

  return lines;
}

// ---------------------------------------------------------------------------
// Helper: Estimate audio duration from content lines
// ---------------------------------------------------------------------------
export function estimateEpisodeDuration(lines) {
  if (!lines || !Array.isArray(lines)) return 0;
  let totalMs = 0;
  for (const line of lines) {
    if (line === '...') {
      totalMs += 1800; // Pause duration
    } else if (line && line.trim()) {
      // Average speaking rate: ~150 words/min = 2.5 words/sec
      const words = line.trim().split(/\s+/).length;
      totalMs += (words / 2.5) * 1000 + 400; // + 400ms inter-sentence pause
    }
  }
  return Math.round(totalMs / 60000); // Return minutes
}
