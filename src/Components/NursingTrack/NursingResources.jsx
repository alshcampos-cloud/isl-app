// NursingTrack — Resources Page
// Links to legitimate free clinical references.
// Reinforces the walled garden: "We coach your communication.
// These are where you learn the clinical substance."
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.
// All links are to free, publicly available resources.

import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, Stethoscope, Shield, FileText, Globe, Award } from 'lucide-react';

const RESOURCE_CATEGORIES = [
  {
    title: 'Licensure & Competency',
    icon: Award,
    color: 'text-sky-400',
    resources: [
      {
        name: 'NCLEX-RN Test Plan',
        org: 'NCSBN',
        description: 'Official test plan outlining the competency domains and clinical judgment model used in nursing licensure.',
        url: 'https://www.nclex.com/test-plans.page',
        type: 'PDF',
      },
      {
        name: 'Clinical Judgment Measurement Model',
        org: 'NCSBN',
        description: 'The framework for clinical judgment: Recognize Cues, Analyze Cues, Prioritize Hypotheses, Generate Solutions, Take Action, Evaluate Outcomes.',
        url: 'https://www.nclex.com/clinical-judgment-measurement-model.page',
        type: 'Reference',
      },
      {
        name: 'State Board of Nursing Directory',
        org: 'NCSBN',
        description: 'Find your state board for scope-of-practice documents, license verification, and practice requirements.',
        url: 'https://www.ncsbn.org/membership/member-boards.page',
        type: 'Directory',
      },
    ],
  },
  {
    title: 'Communication Frameworks',
    icon: Stethoscope,
    color: 'text-green-400',
    resources: [
      {
        name: 'SBAR Communication Toolkit',
        org: 'Institute for Healthcare Improvement (IHI)',
        description: 'Situation, Background, Assessment, Recommendation — the standard for structured clinical communication.',
        url: 'https://www.ihi.org/resources/Pages/Tools/SBARToolkit.aspx',
        type: 'Toolkit',
      },
      {
        name: 'TeamSTEPPS Communication Framework',
        org: 'AHRQ',
        description: 'Evidence-based teamwork system for healthcare professionals to improve patient safety through communication.',
        url: 'https://www.ahrq.gov/teamstepps/index.html',
        type: 'Program',
      },
    ],
  },
  {
    title: 'Clinical Guidelines (Public Domain)',
    icon: Shield,
    color: 'text-blue-400',
    resources: [
      {
        name: 'CDC Infection Control Guidelines',
        org: 'Centers for Disease Control and Prevention',
        description: 'Public domain clinical guidelines covering infection prevention, hand hygiene, isolation precautions, and healthcare-associated infections.',
        url: 'https://www.cdc.gov/infection-control/hcp/guidance/index.html',
        type: 'Guidelines',
      },
      {
        name: 'National Patient Safety Goals',
        org: 'The Joint Commission',
        description: 'Annual safety goals for healthcare organizations — know these for interviews about patient safety culture.',
        url: 'https://www.jointcommission.org/standards/national-patient-safety-goals/',
        type: 'Standards',
      },
      {
        name: 'CMS Quality Measures',
        org: 'Centers for Medicare & Medicaid Services',
        description: 'Public domain quality measures and conditions of participation that hospitals must meet.',
        url: 'https://www.cms.gov/medicare/quality-initiatives-patient-assessment-instruments/qualityinitiativesgeninfo',
        type: 'Guidelines',
      },
    ],
  },
  {
    title: 'Professional Associations',
    icon: Globe,
    color: 'text-purple-400',
    resources: [
      {
        name: 'American Nurses Association (ANA)',
        org: 'ANA',
        description: 'Code of Ethics, position statements, scope and standards of practice, advocacy resources.',
        url: 'https://www.nursingworld.org/',
        type: 'Association',
      },
      {
        name: 'Emergency Nurses Association (ENA)',
        org: 'ENA',
        description: 'ED-specific practice guidelines, workplace violence prevention, triage resources.',
        url: 'https://www.ena.org/',
        type: 'Association',
      },
      {
        name: 'American Association of Critical-Care Nurses (AACN)',
        org: 'AACN',
        description: 'Critical care nursing standards, CCRN certification resources, evidence-based practice.',
        url: 'https://www.aacn.org/',
        type: 'Association',
      },
      {
        name: 'Association of periOperative Registered Nurses (AORN)',
        org: 'AORN',
        description: 'Perioperative practice guidelines, surgical safety standards, OR nursing resources.',
        url: 'https://www.aorn.org/',
        type: 'Association',
      },
      {
        name: "Assoc. of Women's Health, Obstetric and Neonatal Nurses (AWHONN)",
        org: 'AWHONN',
        description: 'L&D nursing practice guidelines, fetal monitoring standards, maternal health resources.',
        url: 'https://www.awhonn.org/',
        type: 'Association',
      },
      {
        name: 'American Psychiatric Nurses Association (APNA)',
        org: 'APNA',
        description: 'Psychiatric nursing resources, therapeutic communication, crisis intervention standards.',
        url: 'https://www.apna.org/',
        type: 'Association',
      },
    ],
  },
  {
    title: 'Research & Evidence-Based Practice',
    icon: FileText,
    color: 'text-amber-400',
    resources: [
      {
        name: 'PubMed (Nursing Journals)',
        org: 'National Library of Medicine',
        description: 'Free access to nursing research abstracts and many open-access full-text articles.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=nursing',
        type: 'Database',
      },
      {
        name: 'AHRQ Evidence Reports',
        org: 'Agency for Healthcare Research and Quality',
        description: 'Public domain evidence-based practice reports on patient safety, quality improvement, and more.',
        url: 'https://www.ahrq.gov/research/publications/index.html',
        type: 'Reports',
      },
    ],
  },
];

export default function NursingResources({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span className="text-white font-medium text-sm">Clinical Resources</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Clinical Resources & References
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            We coach your interview communication and delivery. For clinical knowledge,
            these are the authoritative sources used by nursing professionals nationwide.
            All resources listed here are freely available to the public.
          </p>
          <div className="mt-4 bg-sky-500/10 border border-sky-400/20 rounded-xl p-4">
            <p className="text-sky-300 text-xs leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>About our approach:</strong> Our interview questions reference these established
                clinical frameworks by name. The AI evaluates how you communicate your clinical
                knowledge — it never generates clinical content or evaluates clinical accuracy.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Resource Categories */}
        <div className="space-y-10">
          {RESOURCE_CATEGORIES.map((category, catIndex) => {
            const CatIcon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h2 className={`text-lg font-semibold text-white mb-4 flex items-center gap-2`}>
                  <CatIcon className={`w-5 h-5 ${category.color}`} />
                  {category.title}
                </h2>

                <div className="grid gap-3">
                  {category.resources.map((resource, resIndex) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-medium text-sm">{resource.name}</h3>
                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                              {resource.type}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{resource.org}</p>
                          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 mb-8 text-center">
          <p className="text-slate-500 text-xs">
            All resources are freely available to the public. NurseInterviewPro.ai is not
            affiliated with the listed organizations. Links open in a new tab.
          </p>
        </div>
      </div>
    </div>
  );
}
