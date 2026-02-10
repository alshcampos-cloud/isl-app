// NursingTrack — Confidence Builder
// ============================================================
// A structured tool that takes a nurse's real background and generates
// evidence-based confidence material for interview preparation.
//
// 4 Sections:
//   A. Background Profile Form (FREE, no AI, localStorage)
//   B. Evidence File (FREE, deterministic JS string templates, zero API)
//   C. AI Confidence Brief (CREDITS, fetchWithRetry + charge-after-success)
//   D. Pre-Interview Reset (FREE, reads saved data)
//
// Battle Scars enforced:
//   #3  — fetchWithRetry (3 attempts, 0s/1s/2s backoff) for Section C
//   #8  — Charge AFTER success, never before
//   #9  — Beta users bypass limits
//   #16 — onClick AND onTouchEnd on all buttons
//   #19 — AI NEVER generates clinical content
//
// Credit feature: 'practiceMode' (shares with Practice + SBAR + AI Coach)
// localStorage keys: nursingConfidenceProfile, nursingConfidenceBrief
//
// D.R.A.F.T. Protocol: NEW file. No existing code modified.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Shield, Save, CheckCircle,
  AlertCircle, XCircle, Loader2, FileText, Sparkles, RefreshCw,
  Clock, Clipboard, Heart, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import { canUseFeature, incrementUsage } from '../../utils/creditSystem';

// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEY_PROFILE = 'nursingConfidenceProfile';
const STORAGE_KEY_BRIEF = 'nursingConfidenceBrief';

const SECTIONS = [
  { id: 'profile', label: 'Background', icon: FileText, description: 'Your professional profile' },
  { id: 'evidence', label: 'Evidence File', icon: Clipboard, description: 'Your interview evidence' },
  { id: 'brief', label: 'AI Brief', icon: Sparkles, description: 'AI-generated strategy' },
  { id: 'reset', label: 'Pre-Interview', icon: Heart, description: 'Quick review before you go' },
];

const EXPERIENCE_LEVELS = [
  { value: 'new-grad', label: 'New Graduate (< 1 year)' },
  { value: 'early-career', label: 'Early Career (1-3 years)' },
  { value: 'mid-career', label: 'Mid-Career (3-7 years)' },
  { value: 'experienced', label: 'Experienced (7-15 years)' },
  { value: 'senior', label: 'Senior / Leadership (15+ years)' },
];

const SHIFT_PREFERENCES = [
  { value: 'day', label: 'Day Shift' },
  { value: 'night', label: 'Night Shift' },
  { value: 'rotating', label: 'Rotating' },
  { value: 'flexible', label: 'Flexible / No Preference' },
];

const EMPTY_PROFILE = {
  yearsExperience: '',
  experienceLevel: '',
  currentRole: '',
  targetRole: '',
  certifications: '',
  education: '',
  clinicalStrengths: '',
  patientPopulations: '',
  shiftPreference: '',
  whyThisSpecialty: '',
  biggestAccomplishment: '',
  challengeOvercome: '',
  teamContribution: '',
};

// ============================================================
// SECTION B: Evidence File Generator (Pure JavaScript, no AI)
// ============================================================
function generateEvidenceFile(profile, specialty) {
  const lines = [];

  lines.push('========================================');
  lines.push(`INTERVIEW EVIDENCE FILE — ${specialty.name}`);
  lines.push('========================================');
  lines.push('');

  // Professional Summary
  lines.push('--- PROFESSIONAL SUMMARY ---');
  if (profile.yearsExperience) {
    const years = parseFloat(profile.yearsExperience);
    const approxShifts = Math.round(years * 240); // ~240 shifts/year
    const approxPatients = Math.round(approxShifts * 5); // ~5 patients/shift avg
    lines.push(`Experience: ${profile.yearsExperience} years of nursing experience`);
    lines.push(`Estimated shifts worked: ~${approxShifts.toLocaleString()}`);
    lines.push(`Estimated patient encounters: ~${approxPatients.toLocaleString()}`);
  }
  if (profile.currentRole) {
    lines.push(`Current Role: ${profile.currentRole}`);
  }
  if (profile.targetRole) {
    lines.push(`Target: ${profile.targetRole} in ${specialty.shortName}`);
  }
  if (profile.experienceLevel) {
    const level = EXPERIENCE_LEVELS.find(l => l.value === profile.experienceLevel);
    lines.push(`Career Stage: ${level?.label || profile.experienceLevel}`);
  }
  lines.push('');

  // Education & Credentials
  if (profile.education || profile.certifications) {
    lines.push('--- EDUCATION & CREDENTIALS ---');
    if (profile.education) lines.push(`Education: ${profile.education}`);
    if (profile.certifications) {
      const certs = profile.certifications.split(',').map(c => c.trim()).filter(Boolean);
      lines.push(`Certifications (${certs.length}): ${certs.join(', ')}`);
      lines.push(`  Every certification represents dedication beyond the minimum requirements.`);
    }
    lines.push('');
  }

  // Clinical Strengths
  if (profile.clinicalStrengths) {
    lines.push('--- CLINICAL STRENGTHS ---');
    const strengths = profile.clinicalStrengths.split(',').map(s => s.trim()).filter(Boolean);
    strengths.forEach(s => lines.push(`  + ${s}`));
    lines.push(`  You have ${strengths.length} documented clinical strengths — these are interview talking points.`);
    lines.push('');
  }

  // Patient Populations
  if (profile.patientPopulations) {
    lines.push('--- PATIENT POPULATIONS SERVED ---');
    lines.push(`${profile.patientPopulations}`);
    lines.push(`  Each population you've served demonstrates adaptability and range.`);
    lines.push('');
  }

  // STAR Story: Accomplishment
  if (profile.biggestAccomplishment) {
    lines.push('--- YOUR GO-TO STAR STORY: ACCOMPLISHMENT ---');
    lines.push(`"${profile.biggestAccomplishment}"`);
    lines.push(`  Use this for: "Tell me about your greatest achievement" / "What are you most proud of?"`);
    lines.push(`  Framework: STAR (Situation → Task → Action → Result)`);
    lines.push('');
  }

  // STAR Story: Challenge
  if (profile.challengeOvercome) {
    lines.push('--- YOUR GO-TO STAR STORY: CHALLENGE ---');
    lines.push(`"${profile.challengeOvercome}"`);
    lines.push(`  Use this for: "Describe a difficult situation" / "Tell me about a time you failed"`);
    lines.push(`  Framework: STAR — emphasize what you LEARNED and how you GREW`);
    lines.push('');
  }

  // Teamwork
  if (profile.teamContribution) {
    lines.push('--- TEAMWORK & COLLABORATION ---');
    lines.push(`"${profile.teamContribution}"`);
    lines.push(`  Use this for: "How do you work with a team?" / "Describe interprofessional collaboration"`);
    lines.push('');
  }

  // Motivation
  if (profile.whyThisSpecialty) {
    lines.push(`--- WHY ${specialty.shortName.toUpperCase()} ---`);
    lines.push(`"${profile.whyThisSpecialty}"`);
    lines.push(`  This is your opening and closing — lead with passion, back with evidence.`);
    lines.push('');
  }

  // Shift preference
  if (profile.shiftPreference) {
    const pref = SHIFT_PREFERENCES.find(s => s.value === profile.shiftPreference);
    lines.push('--- LOGISTICS ---');
    lines.push(`Shift Preference: ${pref?.label || profile.shiftPreference}`);
    lines.push('');
  }

  // Footer
  lines.push('========================================');
  lines.push('Remember: You have REAL experience. This evidence file proves it.');
  lines.push('The interviewer isn\'t looking for perfection — they\'re looking for');
  lines.push('a nurse who can communicate clearly and thinks critically.');
  lines.push('You already ARE that nurse. Now show them.');
  lines.push('========================================');

  return lines.join('\n');
}

// ============================================================
// SECTION C: AI Confidence Brief System Prompt
// ============================================================
const CONFIDENCE_BRIEF_PROMPT = (specialty, profile, evidenceFile) => {
  return `You are a nursing interview strategy coach creating a personalized confidence brief for a nurse preparing for a ${specialty.name} (${specialty.shortName}) interview.

=== YOUR ROLE ===
Create a CONCISE, ACTIONABLE interview strategy brief based on this nurse's real background. You coach COMMUNICATION STRATEGY — not clinical knowledge.

=== THE NURSE'S BACKGROUND ===
${evidenceFile}

=== WHAT TO PRODUCE ===
Create a brief with these 4 sections (keep each section to 3-5 bullet points):

1. YOUR STRENGTH NARRATIVE
   Based on their background, identify 3-4 key themes they should weave into every answer.
   Frame these as communication strategies, not clinical evaluations.

2. INTERVIEW TALKING POINTS
   3-5 specific things they should make sure to mention, drawn directly from their profile.
   Include which common interview questions each point answers.

3. POTENTIAL TOUGH QUESTIONS & STRATEGY
   Based on their career stage and background, anticipate 2-3 questions that might be challenging.
   Provide a communication framework (STAR or SBAR) for each.
   DO NOT generate clinical scenarios — focus on behavioral/situational strategy.

4. PRE-INTERVIEW CONFIDENCE BOOST
   3-4 short, evidence-based affirmations drawn from their REAL accomplishments.
   These should be specific to their experience, not generic motivation.

=== RULES ===
- Base EVERYTHING on the nurse's actual profile data above — never invent experiences
- Coach communication strategy, NOT clinical knowledge
- NEVER generate clinical scenarios, protocols, or medical content
- NEVER evaluate clinical accuracy
- Frame ALL advice around how to COMMUNICATE their existing knowledge
- Be warm, direct, and specific — no generic advice
- If their profile is sparse, note that filling in more details will produce a stronger brief
- Keep total response under 600 words

=== TONE ===
Warm, professional, empowering. Like a trusted mentor reviewing your prep the night before.`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function NursingConfidenceBuilder({ specialty, onBack, userData, refreshUsage }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileSaved, setProfileSaved] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState('');
  const [confidenceBrief, setConfidenceBrief] = useState('');
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [error, setError] = useState(null);
  const [creditBlocked, setCreditBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const briefRef = useRef(null);

  // Load saved profile and brief from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setProfileSaved(true);
        // Auto-generate evidence file from saved profile
        setEvidenceFile(generateEvidenceFile(parsed, specialty));
      }
    } catch (e) {
      console.warn('Failed to load saved profile:', e);
    }

    try {
      const savedBrief = localStorage.getItem(STORAGE_KEY_BRIEF);
      if (savedBrief) {
        setConfidenceBrief(savedBrief);
      }
    } catch (e) {
      console.warn('Failed to load saved brief:', e);
    }
  }, [specialty]);

  // Credit check for AI brief
  useEffect(() => {
    if (userData && !userData.loading && userData.usage) {
      const check = canUseFeature(
        { practice_mode: userData.usage.practiceMode?.used || 0 },
        userData.tier,
        'practiceMode'
      );
      if (!check.allowed) setCreditBlocked(true);
    }
  }, [userData]);

  // Save profile to localStorage and regenerate evidence file
  const saveProfile = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      setProfileSaved(true);
      const ev = generateEvidenceFile(profile, specialty);
      setEvidenceFile(ev);
      // Auto-advance to evidence file
      setActiveSection('evidence');
    } catch (e) {
      console.error('Failed to save profile:', e);
      setError('Could not save profile. Please try again.');
    }
  }, [profile, specialty]);

  // Generate AI Confidence Brief — charge-after-success (Battle Scar #8)
  const generateBrief = useCallback(async () => {
    if (isGeneratingBrief || !evidenceFile) return;

    setIsGeneratingBrief(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'answer-assistant-continue',
            systemPrompt: CONFIDENCE_BRIEF_PROMPT(specialty, profile, evidenceFile),
            conversationHistory: [],
            userMessage: 'Generate my personalized confidence brief based on my background profile.',
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Confidence brief error:', response.status, errText);
        throw new Error(`Brief generation failed: ${response.status}`);
      }

      const data = await response.json();
      const briefContent = data.response || data.feedback || 'Unable to generate brief. Please try again.';

      setConfidenceBrief(briefContent);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_BRIEF, briefContent);
      } catch (e) {
        console.warn('Failed to save brief to localStorage:', e);
      }

      // CHARGE AFTER SUCCESS (Battle Scar #8)
      if (userData?.user?.id) {
        try {
          await incrementUsage(supabase, userData.user.id, 'practiceMode');
          if (refreshUsage) refreshUsage();
        } catch (chargeErr) {
          console.warn('Usage increment failed (non-blocking):', chargeErr);
        }
      }

      // Auto-advance to brief view
      setActiveSection('brief');
    } catch (err) {
      console.error('Confidence brief error:', err);
      setError('Something went wrong generating your brief. Please try again.');
    } finally {
      setIsGeneratingBrief(false);
    }
  }, [isGeneratingBrief, evidenceFile, specialty, profile, userData, refreshUsage]);

  // Copy evidence file to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  }, []);

  // Update a single profile field
  const updateField = useCallback((field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setProfileSaved(false);
  }, []);

  // Check if profile has meaningful data
  const profileHasData = profile.yearsExperience || profile.currentRole || profile.clinicalStrengths;
  const isUnlimited = userData?.isBeta || userData?.tier === 'pro';
  const creditInfo = userData?.usage?.practiceMode;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            onTouchEnd={(e) => { e.preventDefault(); onBack(); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-white font-medium text-sm">Confidence Builder</span>
          </div>

          <div className="w-16" />
        </div>

        {/* Section tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              // Disable brief/reset tabs if no profile saved
              const isDisabled = (section.id === 'evidence' || section.id === 'brief' || section.id === 'reset') && !profileSaved && !profileHasData;
              return (
                <button
                  key={section.id}
                  onClick={isDisabled ? undefined : () => setActiveSection(section.id)}
                  onTouchEnd={isDisabled ? undefined : (e) => { e.preventDefault(); setActiveSection(section.id); }}
                  disabled={isDisabled}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md'
                      : isDisabled
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProfileSection
                profile={profile}
                updateField={updateField}
                saveProfile={saveProfile}
                profileSaved={profileSaved}
                specialty={specialty}
              />
            </motion.div>
          )}
          {activeSection === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <EvidenceSection
                evidenceFile={evidenceFile}
                profileHasData={profileHasData}
                copied={copied}
                onCopy={() => copyToClipboard(evidenceFile)}
                onEditProfile={() => setActiveSection('profile')}
                onGenerateBrief={() => {
                  if (creditBlocked) return;
                  generateBrief();
                }}
                creditBlocked={creditBlocked}
                isGeneratingBrief={isGeneratingBrief}
                isUnlimited={isUnlimited}
                creditInfo={creditInfo}
              />
            </motion.div>
          )}
          {activeSection === 'brief' && (
            <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <BriefSection
                confidenceBrief={confidenceBrief}
                isGeneratingBrief={isGeneratingBrief}
                creditBlocked={creditBlocked}
                onRegenerate={generateBrief}
                onCopy={() => copyToClipboard(confidenceBrief)}
                copied={copied}
                briefRef={briefRef}
                isUnlimited={isUnlimited}
                creditInfo={creditInfo}
                evidenceFile={evidenceFile}
                onGoToEvidence={() => setActiveSection('evidence')}
              />
            </motion.div>
          )}
          {activeSection === 'reset' && (
            <motion.div key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ResetSection
                evidenceFile={evidenceFile}
                confidenceBrief={confidenceBrief}
                specialty={specialty}
                profile={profile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 backdrop-blur-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              onTouchEnd={(e) => { e.preventDefault(); setError(null); }}
              className="text-red-400 hover:text-red-300"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-3">
        <p className="text-slate-600 text-xs text-center">
          AI coaches your interview strategy • Clinical content is always your own real experience
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SECTION A: Background Profile Form
// ============================================================
function ProfileSection({ profile, updateField, saveProfile, profileSaved, specialty }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Section intro */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Your Background Profile
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Tell us about your nursing career. This builds your Evidence File and helps the AI
          create a personalized confidence brief. Everything stays on your device.
        </p>
      </div>

      <div className="space-y-5">
        {/* Experience */}
        <FormGroup label="Years of Nursing Experience" hint="Include all clinical experience">
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={profile.yearsExperience}
            onChange={(e) => updateField('yearsExperience', e.target.value)}
            placeholder="e.g., 3.5"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Career Stage">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXPERIENCE_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => updateField('experienceLevel', level.value)}
                onTouchEnd={(e) => { e.preventDefault(); updateField('experienceLevel', level.value); }}
                className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                  profile.experienceLevel === level.value
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </FormGroup>

        <FormGroup label="Current Role / Title" hint="What you do right now">
          <input
            type="text"
            value={profile.currentRole}
            onChange={(e) => updateField('currentRole', e.target.value)}
            placeholder="e.g., Med-Surg RN at County General"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Target Role" hint={`What ${specialty.shortName} role are you pursuing?`}>
          <input
            type="text"
            value={profile.targetRole}
            onChange={(e) => updateField('targetRole', e.target.value)}
            placeholder={`e.g., ${specialty.shortName} Staff Nurse`}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Education" hint="Highest degree or nursing program">
          <input
            type="text"
            value={profile.education}
            onChange={(e) => updateField('education', e.target.value)}
            placeholder="e.g., BSN from State University, 2021"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Certifications" hint="Comma-separated (BLS, ACLS, CCRN, etc.)">
          <input
            type="text"
            value={profile.certifications}
            onChange={(e) => updateField('certifications', e.target.value)}
            placeholder="e.g., BLS, ACLS, NIH Stroke Scale"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Clinical Strengths" hint="Comma-separated areas you're strong in">
          <input
            type="text"
            value={profile.clinicalStrengths}
            onChange={(e) => updateField('clinicalStrengths', e.target.value)}
            placeholder="e.g., Patient assessment, IV therapy, wound care, patient education"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Patient Populations Served" hint="Who have you cared for?">
          <input
            type="text"
            value={profile.patientPopulations}
            onChange={(e) => updateField('patientPopulations', e.target.value)}
            placeholder="e.g., Adult medical-surgical, post-operative, elderly, pediatric"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Shift Preference">
          <div className="flex flex-wrap gap-2">
            {SHIFT_PREFERENCES.map(pref => (
              <button
                key={pref.value}
                onClick={() => updateField('shiftPreference', pref.value)}
                onTouchEnd={(e) => { e.preventDefault(); updateField('shiftPreference', pref.value); }}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                  profile.shiftPreference === pref.value
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {pref.label}
              </button>
            ))}
          </div>
        </FormGroup>

        <FormGroup label={`Why ${specialty.shortName}?`} hint="What drives you toward this specialty?">
          <textarea
            value={profile.whyThisSpecialty}
            onChange={(e) => updateField('whyThisSpecialty', e.target.value)}
            placeholder={`What draws you to ${specialty.shortName}? This becomes your "why" narrative.`}
            rows={3}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Your Biggest Accomplishment" hint="This becomes your go-to STAR story">
          <textarea
            value={profile.biggestAccomplishment}
            onChange={(e) => updateField('biggestAccomplishment', e.target.value)}
            placeholder="Describe a professional moment you're proud of — a patient outcome, a process improvement, a time you went above and beyond."
            rows={3}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="A Challenge You Overcame" hint="Interviewers love growth stories">
          <textarea
            value={profile.challengeOvercome}
            onChange={(e) => updateField('challengeOvercome', e.target.value)}
            placeholder="Describe a difficult situation — what happened, what you did, and what you learned."
            rows={3}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>

        <FormGroup label="Team Contribution" hint="How do you make your team better?">
          <textarea
            value={profile.teamContribution}
            onChange={(e) => updateField('teamContribution', e.target.value)}
            placeholder="How do you contribute to your team? Examples: precepting, charge nurse duties, conflict resolution, supporting new grads."
            rows={3}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
        </FormGroup>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 -mx-4 px-4 py-4 mt-6">
        <button
          onClick={saveProfile}
          onTouchEnd={(e) => { e.preventDefault(); saveProfile(); }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            profileSaved
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:-translate-y-0.5'
          }`}
        >
          {profileSaved ? (
            <><CheckCircle className="w-4 h-4" /> Profile Saved — View Evidence File</>
          ) : (
            <><Save className="w-4 h-4" /> Save Profile & Generate Evidence File</>
          )}
        </button>
        <p className="text-slate-600 text-xs text-center mt-2">
          Saved locally on your device — never sent to a server until you request an AI brief
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SECTION B: Evidence File (Pure JS, no API)
// ============================================================
function EvidenceSection({ evidenceFile, profileHasData, copied, onCopy, onEditProfile, onGenerateBrief, creditBlocked, isGeneratingBrief, isUnlimited, creditInfo }) {
  if (!profileHasData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Clipboard className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Profile Yet</h2>
        <p className="text-slate-400 text-sm mb-4">
          Fill in your background profile first — your Evidence File is generated instantly from your answers.
        </p>
        <button
          onClick={onEditProfile}
          onTouchEnd={(e) => { e.preventDefault(); onEditProfile(); }}
          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
        >
          ← Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-amber-400" />
          Your Evidence File
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            onTouchEnd={(e) => { e.preventDefault(); onCopy(); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Clipboard className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onEditProfile}
            onTouchEnd={(e) => { e.preventDefault(); onEditProfile(); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileText className="w-3 h-3" /> Edit Profile
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-4">
        This is generated entirely from your profile — no AI, no credits, no internet required.
        It calculates your estimated patient encounters and organizes your experience into interview-ready evidence.
      </p>

      {/* Evidence File Display */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 font-mono">
        <pre className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap break-words">
          {evidenceFile}
        </pre>
      </div>

      {/* CTA: Generate AI Brief */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium text-sm mb-1">Ready for your AI Confidence Brief?</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              The AI will analyze your Evidence File and create a personalized interview strategy —
              talking points, tough question prep, and confidence affirmations based on YOUR real experience.
            </p>
          </div>
        </div>

        {/* Credits info */}
        {creditInfo && !isUnlimited && !creditBlocked && (
          <p className="text-slate-500 text-xs mb-3">
            Uses 1 practice credit ({creditInfo.remaining} remaining)
          </p>
        )}

        {creditBlocked ? (
          <a
            href="/app"
            className="block w-full text-center font-semibold py-3 rounded-xl text-sm transition-all bg-gradient-to-r from-purple-600 to-sky-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5"
          >
            Upgrade to Pro — Unlimited AI Briefs
          </a>
        ) : (
          <button
            onClick={onGenerateBrief}
            onTouchEnd={(e) => { e.preventDefault(); onGenerateBrief(); }}
            disabled={isGeneratingBrief}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              isGeneratingBrief
                ? 'bg-white/10 text-white/50 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:-translate-y-0.5'
            }`}
          >
            {isGeneratingBrief ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Your Brief...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate AI Confidence Brief</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SECTION C: AI Confidence Brief
// ============================================================
function BriefSection({ confidenceBrief, isGeneratingBrief, creditBlocked, onRegenerate, onCopy, copied, briefRef, isUnlimited, creditInfo, evidenceFile, onGoToEvidence }) {
  // No brief yet — prompt to generate
  if (!confidenceBrief && !isGeneratingBrief) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Brief Generated Yet</h2>
        <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
          {evidenceFile
            ? 'Your Evidence File is ready. Generate your AI Confidence Brief from the Evidence tab.'
            : 'Fill in your profile first, then generate your Evidence File, then request your AI brief.'
          }
        </p>
        {evidenceFile && (
          <button
            onClick={onGoToEvidence}
            onTouchEnd={(e) => { e.preventDefault(); onGoToEvidence(); }}
            className="text-amber-400 hover:text-amber-300 text-sm font-medium"
          >
            ← Go to Evidence File
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (isGeneratingBrief) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-bold text-white mb-2">Creating Your Confidence Brief</h2>
        <p className="text-slate-400 text-sm">
          Analyzing your background and building personalized interview strategy...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" ref={briefRef}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Your Confidence Brief
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            onTouchEnd={(e) => { e.preventDefault(); onCopy(); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Clipboard className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!creditBlocked && (
            <button
              onClick={onRegenerate}
              onTouchEnd={(e) => { e.preventDefault(); onRegenerate(); }}
              disabled={isGeneratingBrief}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Personalized interview strategy based on your real background. Save this and review it before your interview.
      </p>

      {/* Brief content */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
        <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {confidenceBrief}
        </div>
      </div>

      {/* Credit info */}
      {creditInfo && !isUnlimited && (
        <p className="text-slate-500 text-xs text-center mb-4">
          {creditInfo.remaining} practice credits remaining this month
          {creditBlocked && (
            <span className="text-red-300"> — limit reached</span>
          )}
        </p>
      )}

      {/* Walled garden */}
      <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-3">
        <p className="text-sky-300/70 text-xs leading-relaxed text-center">
          This brief coaches your interview communication strategy. It does not evaluate clinical accuracy
          or serve as a clinical reference. All clinical content comes from YOUR real experiences.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SECTION D: Pre-Interview Reset
// ============================================================
function ResetSection({ evidenceFile, confidenceBrief, specialty, profile }) {
  const hasEvidence = !!evidenceFile;
  const hasBrief = !!confidenceBrief;
  const hasAnything = hasEvidence || hasBrief;

  if (!hasAnything) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Pre-Interview Reset</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          This is your quick-access pre-interview view. Once you have an Evidence File and Confidence Brief,
          they will appear here for a fast review before you walk in.
        </p>
      </div>
    );
  }

  // Quick stats from profile
  const years = parseFloat(profile.yearsExperience) || 0;
  const approxShifts = Math.round(years * 240);
  const approxPatients = Math.round(approxShifts * 5);
  const certs = profile.certifications ? profile.certifications.split(',').map(c => c.trim()).filter(Boolean) : [];
  const strengths = profile.clinicalStrengths ? profile.clinicalStrengths.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Hero reset card */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 mb-6 text-center">
        <div className="text-4xl mb-3">{specialty.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">You Are Ready</h2>
        <p className="text-amber-200/80 text-sm max-w-md mx-auto">
          {profile.targetRole
            ? `You're interviewing for ${profile.targetRole} in ${specialty.shortName}.`
            : `You're interviewing in ${specialty.shortName}.`}
          {' '}Here's your evidence.
        </p>
      </div>

      {/* Quick numbers */}
      {years > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{profile.yearsExperience}y</p>
            <p className="text-slate-500 text-xs">Experience</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">~{approxShifts.toLocaleString()}</p>
            <p className="text-slate-500 text-xs">Shifts</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Heart className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">~{approxPatients.toLocaleString()}</p>
            <p className="text-slate-500 text-xs">Patients</p>
          </div>
        </div>
      )}

      {/* Strengths quick view */}
      {strengths.length > 0 && (
        <div className="mb-6">
          <p className="text-white text-sm font-medium mb-2">Your Strengths</p>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, i) => (
              <span key={i} className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications quick view */}
      {certs.length > 0 && (
        <div className="mb-6">
          <p className="text-white text-sm font-medium mb-2">Your Credentials</p>
          <div className="flex flex-wrap gap-2">
            {certs.map((c, i) => (
              <span key={i} className="bg-white/10 border border-white/10 text-slate-200 text-xs px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Why this specialty */}
      {profile.whyThisSpecialty && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-amber-300 text-xs font-medium mb-1">Your "Why"</p>
          <p className="text-slate-200 text-sm leading-relaxed italic">
            "{profile.whyThisSpecialty}"
          </p>
        </div>
      )}

      {/* Go-to stories */}
      {(profile.biggestAccomplishment || profile.challengeOvercome) && (
        <div className="space-y-3 mb-6">
          <p className="text-white text-sm font-medium">Your Go-To Stories</p>
          {profile.biggestAccomplishment && (
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
              <p className="text-green-300 text-xs font-medium mb-1">Accomplishment Story (STAR)</p>
              <p className="text-slate-300 text-xs leading-relaxed">{profile.biggestAccomplishment}</p>
            </div>
          )}
          {profile.challengeOvercome && (
            <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4">
              <p className="text-sky-300 text-xs font-medium mb-1">Challenge Story (STAR)</p>
              <p className="text-slate-300 text-xs leading-relaxed">{profile.challengeOvercome}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Brief Summary (if available) */}
      {hasBrief && (
        <div className="mb-6">
          <p className="text-white text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Your AI Brief
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap line-clamp-[20]">
              {confidenceBrief}
            </div>
          </div>
        </div>
      )}

      {/* Final encouragement */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 mb-6">
        <div className="text-center">
          <p className="text-amber-200 text-sm font-medium mb-2">Deep breath. You've got this.</p>
          <p className="text-amber-300/60 text-xs leading-relaxed max-w-md mx-auto">
            The interviewer isn't looking for perfection — they're looking for a nurse who thinks critically
            and communicates clearly. Your experience proves you're that nurse. Now go show them.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED: Form Group
// ============================================================
function FormGroup({ label, hint, children }) {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-1.5">{label}</label>
      {hint && <p className="text-slate-500 text-xs mb-2">{hint}</p>}
      {children}
    </div>
  );
}
