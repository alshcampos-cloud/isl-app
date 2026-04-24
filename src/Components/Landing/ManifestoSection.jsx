/**
 * ManifestoSection
 *
 * Founder-voiced editorial section: "We built this because rehearsal is
 * the thing interview prep products skip."
 *
 * Headline softened from "rehearsal is how humans actually learn" to the
 * current positioning — more defensible (avoids the Hambrick/Macnamara
 * deliberate-practice critique) and sharper (names the actual market gap
 * rather than making a universal claim).
 *
 * Why this exists: this is the highest-leverage anti-template change on the
 * landing page. It breaks the feature-grid pattern with a single-column,
 * personal, editorial voice. Positioned between the interactive demo (the
 * proof moment) and the problem statement (the emotional pivot).
 *
 * Typography note: spec called for Instrument Serif, which is not bundled.
 * Source Serif 4 IS already loaded with italic variants (see src/index.css)
 * and is mapped to Tailwind's `font-serif`. Swapping to the already-loaded
 * serif preserves the editorial feel without adding a new dependency (the
 * sprint rules prohibit new deps + touching shared config).
 *
 * Copy is Researcher-drafted + Auditor-corrected. Positive-framed rewrite
 * (Sprint 9) — centers the why-rehearsal-works thesis instead of the
 * deleted-feature mea culpa. Auditor struck the "9 AM under fluorescent
 * lights" line as too specific for the nursing audience; replaced with
 * "on the day it counts". Co-founder is referenced by role only per
 * binding legal/consent direction.
 */

export default function ManifestoSection() {
  return (
    <section
      className="relative py-20 sm:py-28 bg-amber-50/30"
      aria-labelledby="manifesto-headline"
    >
      <div className="max-w-[620px] mx-auto px-6 sm:px-8">
        {/* Hook headline — serif, large, not bold */}
        <h2
          id="manifesto-headline"
          className="font-serif text-4xl lg:text-5xl font-normal text-slate-900 leading-tight tracking-tight mb-10"
        >
          We built this because rehearsal is the thing interview prep products skip.
        </h2>

        {/* Body — sans, readable, not serif (accessibility) */}
        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
          <p>
            Not reading about interviews. Not watching someone else ace one on
            YouTube. Doing it yourself — out loud, imperfectly, then again,
            then again until the words stop feeling like someone else's.
          </p>

          <p>
            There's a fifty-year-old finding from cognitive psychology called
            the testing effect. Roediger and Karpicke, 2006. The short
            version: pulling a memory out of your head makes it stick harder
            than reading the same thing four more times. Deliberate practice
            — Ericsson's name for the same idea — says the same thing with a
            stopwatch.
          </p>

          <p>
            Which is to say: the boring part is the part that works.
          </p>

          <p>
            So we built a prompter that listens to you rehearse, flags the
            vague sentences, and makes you say it better. Then a mock
            interviewer that actually interrupts. Then a flashcard deck for
            the parts your body already knows but your mouth can't find on
            the day it counts. We killed a real-time coaching feature along
            the way — it turns out live whispers aren't practice, and
            practice is the whole point.
          </p>

          <p>
            This is for the new-grad nurse who will, in eight weeks, be asked
            to talk calmly about the first code she ran. It's for the
            career-switcher betting the next two years on one forty-minute
            conversation. For the engineer who knows the answer and still
            freezes.
          </p>
        </div>

        {/* Pull quote — serif italic, teal left border, left-indented */}
        <blockquote className="my-10 border-l-[3px] border-teal-500 pl-6">
          <p className="font-serif italic text-2xl lg:text-3xl leading-snug text-slate-900">
            You don't want to sound prepared. You want to be prepared. Those
            are different, and only one of them survives the follow-up
            question.
          </p>
        </blockquote>

        {/* Closing paragraph */}
        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
          <p>That's what we're building. Reps. Quiet ones. Yours.</p>
        </div>

        {/* Signature — small sans, muted, em-dash prefix */}
        <p className="mt-10 text-sm text-slate-500 leading-relaxed">
          — Alsh Campos, founder · Built with my co-founder, a
          clinical nurse working in infection prevention · April 2026
        </p>
      </div>
    </section>
  );
}
