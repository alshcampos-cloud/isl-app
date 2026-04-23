import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

export default function TermsPage() {
  useDocumentHead({
    title: 'Terms of Service | InterviewAnswers.ai',
    description: 'Terms of Service for InterviewAnswers.ai — AI-powered interview preparation platform.',
    canonical: 'https://www.interviewanswers.ai/terms',
    robots: 'noindex, follow',
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </button>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Last updated:</strong> February 28, 2026</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using InterviewAnswers.ai, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with these terms, you may not use InterviewAnswers.ai.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2. Description of Service</h2>
          <p>
            InterviewAnswers.ai provides AI-powered interview preparation tools including practice sessions,
            mock interviews, answer building, question generation, and practice prompting for rehearsal. The
            Service uses <strong>Anthropic's Claude AI</strong> to generate personalized feedback and coaching.
            The Service is intended for educational and personal development purposes only.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2a. Intended Use — Practice Only</h2>
          <p>
            <strong>InterviewAnswers.ai is designed and intended exclusively for interview preparation and practice.</strong>{' '}
            The Service is to be used BEFORE an interview, not during one. You agree that you will NOT use
            the Service, in whole or in part, during a live interview, recorded interview, pre-recorded
            video interview, job assessment, academic exam, or any other evaluative hiring or evaluation
            process in which a prospective employer or evaluator has not expressly authorized the use of AI
            assistance. Using our tools during a live interview may violate the terms of the interview
            process and is not supported by InterviewAnswers.ai. Violation of this intended-use restriction
            is a material breach of these Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">2b. Good Faith Use</h2>
          <p>
            By using the Service, you agree to use it in good faith for its intended purpose: preparing for
            interviews. You will not use the Service to deceive, misrepresent, or gain an unfair advantage
            during live evaluations. You acknowledge that many employers prohibit the use of external AI
            tools during interviews, and that such use may violate the policies of the employer, result in
            withdrawal of an offer, or result in termination of employment. The Company is not responsible
            for any consequences that result from your misuse of the Service contrary to these Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">3. License to Use</h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable, revocable license to access and use InterviewAnswers.ai
            for personal interview practice and preparation. You may not use InterviewAnswers.ai for any commercial purpose
            without our prior written consent.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">4. User Accounts</h2>
          <p>
            You must be at least 13 years old to create an account. You are responsible for maintaining the
            confidentiality of your account credentials. You agree to provide accurate information when creating your account.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5. AI-Generated Content</h2>
          <p>
            InterviewAnswers.ai uses <strong>Anthropic's Claude AI</strong> to generate interview feedback, coaching,
            and suggestions. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI-generated feedback may contain errors, inaccuracies, or biases</li>
            <li>Feedback is provided for educational and practice purposes only</li>
            <li>AI feedback does not constitute professional career counseling or advice</li>
            <li>You should exercise your own judgment and seek professional guidance for important career decisions</li>
            <li>We make no guarantees regarding interview success, job offers, or career outcomes</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">5a. Clinical Content Disclaimer (Nursing Track)</h2>
          <p>
            The nursing interview content on InterviewAnswers.ai and NurseInterviewPro.ai is communication
            coaching content only. The AI does NOT provide clinical advice, medical guidance, diagnosis,
            treatment recommendations, or a substitute for clinical training, NCLEX preparation,
            continuing education, or licensed clinical judgment. Questions, scenarios, and feedback focus
            on how you communicate clinical experiences in an interview context, not on the clinical
            accuracy of responses. Clinical content is reviewed by qualified nurses or nurse educators
            before publication but is not a substitute for your facility protocols, hospital policy, or
            the judgment of a licensed clinician in patient care. For clinical questions, consult
            UpToDate, your facility protocols, or qualified clinical educators. You agree not to rely on
            the Service as a clinical reference.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">6. Recording Consent and Legal Compliance</h2>
          <p><strong>User Responsibility for Recording Consent:</strong></p>
          <p>
            Practice Prompter is designed for rehearsal, not live interviews. If despite our guidance you use any recording functionality
            during a live conversation with another party, you are solely responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Obtaining explicit consent from all parties before recording</li>
            <li>Complying with all applicable federal, state, and local recording laws</li>
            <li>Informing all parties that you are using assistance technology</li>
            <li>Verifying that such use is permitted by the organization conducting the interview</li>
          </ul>
          <p>
            Many jurisdictions require all-party consent before recording conversations. States with all-party
            consent laws include California, Connecticut, Florida, Illinois, Maryland, Massachusetts, Michigan,
            Montana, Nevada, New Hampshire, Pennsylvania, and Washington. This list is not exhaustive. Recording
            without proper consent may result in criminal penalties, civil liability, and disqualification from
            employment consideration. You agree to indemnify and hold InterviewAnswers.ai harmless from any claims arising from
            your failure to obtain proper recording consent.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">7. Subscription and Payments</h2>
          <p>
            InterviewAnswers.ai offers both free and paid subscription tiers. Paid subscriptions are billed through Stripe.
            You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.
            No refunds are provided for partial billing periods.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">8. Acceptable Use Policy</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Record conversations without obtaining legally required consent from all parties</li>
            <li>Use InterviewAnswers.ai for any unlawful purpose or in violation of any applicable laws</li>
            <li>Upload, transmit, or share illegal, harmful, threatening, or offensive content</li>
            <li>Attempt to gain unauthorized access to InterviewAnswers.ai's systems or other users' accounts</li>
            <li>Reverse engineer, decompile, or disassemble any part of InterviewAnswers.ai</li>
            <li>Use automated systems to access or interact with InterviewAnswers.ai without authorization</li>
            <li>Interfere with or disrupt the operation of InterviewAnswers.ai or its servers</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">9. Intellectual Property</h2>
          <p>
            The Service, including its design, features, and content, is owned by InterviewAnswers.ai. Your interview
            answers and personal content remain your own property. By using the Service, you grant us a limited license
            to process your content for the purpose of providing the Service.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">10. Limitation of Liability</h2>
          <p><strong>Maximum Liability Cap:</strong></p>
          <p>
            To the maximum extent permitted by law, InterviewAnswers.ai's total liability for all claims related to the service
            shall not exceed the lesser of (a) the amount you paid to InterviewAnswers.ai in the twelve months preceding the
            claim, or (b) one hundred dollars ($100 USD).
          </p>
          <p><strong>Exclusion of Damages:</strong></p>
          <p>
            InterviewAnswers.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
            including but not limited to loss of profits, data, business opportunities, or goodwill, whether based
            on contract, tort, negligence, strict liability, or otherwise, arising from your use of InterviewAnswers.ai, reliance
            on AI-generated feedback, or violation of recording consent laws, even if InterviewAnswers.ai has been advised of the
            possibility of such damages.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">11. Disclaimer of Warranties</h2>
          <p>
            INTERVIEWANSWERS.AI IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            OR NON-INFRINGEMENT. We do not warrant that InterviewAnswers.ai will be uninterrupted, secure, or error-free, that
            defects will be corrected, or that AI-generated feedback will be accurate, complete, or reliable.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless InterviewAnswers.ai and its officers, directors, employees, and
            agents from and against any claims, liabilities, damages, losses, costs, or expenses (including
            reasonable attorneys' fees) arising from or related to: (a) your use of InterviewAnswers.ai; (b) your violation
            of these Terms; (c) your violation of any recording laws or failure to obtain proper consent;
            (d) your reliance on AI-generated feedback; or (e) your violation of any third-party rights.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">13. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to InterviewAnswers.ai at any time, with or without notice,
            for any reason, including but not limited to violation of these Terms, fraudulent conduct, or
            misuse of the service. You may terminate your account at any time by deleting your account
            through the Settings page. Upon termination, your right to use InterviewAnswers.ai will immediately cease.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">14. Dispute Resolution and Arbitration</h2>
          <p>
            Any dispute, claim, or controversy arising out of or relating to these Terms or your use of InterviewAnswers.ai
            shall be resolved through binding arbitration administered by the American Arbitration Association
            under its Commercial Arbitration Rules. The arbitration shall take place in San Francisco, California,
            or another mutually agreed location.
          </p>
          <p>
            <strong>You waive your right to a jury trial and your right to participate in class action lawsuits or
            class-wide arbitrations.</strong>
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California,
            without regard to its conflict of law provisions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">16. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
            limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain
            in full force and effect.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">17. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of material changes
            by posting the updated Terms on this page and updating the "Last updated" date. Your continued
            use of InterviewAnswers.ai after such changes constitutes your acceptance of the modified Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">18. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@interviewanswers.ai" className="text-teal-600 hover:text-teal-700">support@interviewanswers.ai</a>.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">19. Apple App Store Terms</h2>
          <p>
            If you access the Service through an Apple iOS application, the following additional terms apply:
          </p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              This agreement is between you and Koda Labs LLC, not Apple Inc. Apple has no obligation
              to provide maintenance or support for the Service.
            </li>
            <li>
              In-app purchases and subscriptions are processed through Apple's App Store. Subscriptions
              can be managed and canceled through your iOS device Settings &gt; Apple ID &gt; Subscriptions.
            </li>
            <li>
              Apple has no warranty obligation for the Service. Any claims relating to the Service are the
              responsibility of Koda Labs LLC, not Apple.
            </li>
            <li>
              Apple is not responsible for addressing any claims you may have relating to the Service,
              including product liability claims, regulatory compliance, or intellectual property infringement.
            </li>
            <li>
              In the event of any failure of the Service to conform to applicable warranties, you may notify
              Apple for a refund of the purchase price (if applicable). Apple has no other warranty obligation.
            </li>
            <li>
              Apple and its subsidiaries are third-party beneficiaries of this agreement. Upon acceptance of
              these terms, Apple has the right to enforce them against you as a third-party beneficiary.
            </li>
          </ol>

          <hr className="my-8 border-gray-300" />
          <p className="text-sm text-gray-500 italic">
            By using InterviewAnswers.ai, you acknowledge that you have read, understood, and agree to be bound by these
            Terms of Service. These Terms constitute a legal agreement between you and InterviewAnswers.ai.
          </p>
        </div>
      </div>
    </div>
  );
}
