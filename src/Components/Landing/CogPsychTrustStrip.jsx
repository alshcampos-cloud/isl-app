import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

/**
 * CogPsychTrustStrip
 *
 * Thin sub-strip intended to sit below the hero / social proof bar.
 * Surfaces the cognitive-psychology citations that back the product's
 * "practice, not cheat" positioning — a trust signal no competitor
 * in this space carries.
 *
 * Layout:
 * - Desktop: single-line horizontal strip
 * - Mobile (<=sm, ~640px): stacks into 2 lines so the strip stays
 *   readable at 375px wide
 */
export default function CogPsychTrustStrip() {
  return (
    <div className="w-full bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Brain className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-700">
              Built on cognitive-psychology research
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
          <span className="text-center sm:text-left text-slate-500">
            Roediger &amp; Karpicke · Ericsson · Godden &amp; Baddeley
          </span>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
          <Link
            to="/ethics"
            className="text-teal-600 hover:text-teal-700 font-semibold text-center sm:text-left"
          >
            Read the science &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
