/**
 * ManifestoSection
 *
 * Founder-voiced editorial section: "We deleted our best-performing feature."
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
 * Copy is Researcher-drafted + Auditor-corrected. Erin's first name is
 * intentionally omitted; co-founder is referenced by role only per binding
 * legal/consent direction.
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
          We deleted our best-performing feature.
        </h2>

        {/* Body — sans, readable, not serif (accessibility) */}
        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
          <p>
            The Live Prompter fed you answers in real time. It worked — users
            closed jobs, we tracked it. And then we killed it.
          </p>

          <p>
            We built it because the market wanted it. We killed it because it
            was the wrong lesson. A candidate who reads an AI's words in their
            ear doesn't walk out of that interview any better than they walked
            in. The job offer is a lottery ticket, not a skill.
          </p>

          <p>
            The research on this is not ambiguous. Retrieval practice — the
            actual cognitive-psychology term — is how humans encode anything
            worth keeping. You rehearse under pressure. You fail small. You
            try again. The brain rewrites itself around the attempt, not
            around the answer.
          </p>
        </div>

        {/* Pull quote — serif italic, teal left border, left-indented */}
        <blockquote className="my-10 border-l-[3px] border-teal-500 pl-6">
          <p className="font-serif italic text-2xl lg:text-3xl leading-snug text-slate-900">
            You don't cheat your way into being the person who handles the 2 AM
            page. You rehearse into it.
          </p>
        </blockquote>

        {/* Closing paragraphs */}
        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
          <p>
            So we rebuilt the whole product around rehearsal. The AI
            interviewer pushes back. The coach flags vague answers. The
            scorecard is honest when you earned a 6. It's slower. It's harder.
            It's the thing that actually works.
          </p>

          <p>
            We know this isn't the easier sell. "Practice more" loses to "get
            the answer" every time in a landing-page A/B test. But the people
            we're building for — the new grad nurse who'll hold someone's hand
            through a code, the career-switcher betting the next two years —
            deserve a tool that makes them better, not a tool that fakes it
            for them.
          </p>

          <p>That's the line. Everything we ship has to sit on this side of it.</p>
        </div>

        {/* Signature — small sans, muted, em-dash prefix */}
        <p className="mt-10 text-sm text-slate-500 leading-relaxed">
          — Alsh Campos, founder · Built with my co-founder, a
          Stanford-affiliated infection prevention nurse · April 2026
        </p>
      </div>
    </section>
  );
}
