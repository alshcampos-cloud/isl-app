import {
  // "Write great answers"
  PenTool,
  BookMarked,
  Sparkles,
  LayoutGrid,
  // "Practice them deeper"
  RefreshCcw,
  Target,
  Volume2,
  // "Research the interview"
  FileSearch,
  Building2,
  Mail,
  Briefcase,
  // "Stay on track"
  Lightbulb,
  ClipboardList,
  Radio,
  AlarmClock,
} from 'lucide-react';

// Sprint 9 follow-up — "Your full toolbox" grid showcase.
// Sits immediately after FeatureCarousel so the carousel keeps its marquee
// focus (6 headline features) while this section makes the depth of the
// product visible (15 more). Cards are intentionally non-clickable — this
// is a showcase, not navigation.

const CATEGORIES = [
  {
    title: 'Write great answers',
    features: [
      { icon: PenTool, name: 'Answer Assistant', desc: 'Craft polished answers with AI feedback' },
      { icon: BookMarked, name: 'Story Bank', desc: 'Save and organize your STAR stories' },
      { icon: Sparkles, name: 'AI Question Generator', desc: 'Custom questions for your role and JD' },
      { icon: LayoutGrid, name: 'Template Library', desc: 'Pre-built question sets for common roles' },
    ],
  },
  {
    title: 'Practice them deeper',
    features: [
      { icon: RefreshCcw, name: 'Active Recall Quiz', desc: 'Spaced-repetition drills on weak spots' },
      { icon: Target, name: 'Weak Point Drill', desc: 'AI identifies what you keep missing' },
      { icon: Volume2, name: 'Delivery Insights', desc: 'Filler words, pacing, clarity feedback' },
    ],
  },
  {
    title: 'Research the interview',
    features: [
      { icon: FileSearch, name: 'JD Decoder', desc: 'Paste a job posting, get likely questions' },
      { icon: Building2, name: 'Company Brief', desc: 'AI research on company + interview style' },
      { icon: Mail, name: 'Follow-up Email Generator', desc: 'Craft the thank-you that lands' },
      { icon: Briefcase, name: 'Portfolio', desc: 'Document wins as reference for answers' },
    ],
  },
  {
    title: 'Stay on track',
    features: [
      { icon: Lightbulb, name: 'AI Interview Coach', desc: 'Per-answer feedback, floating helper' },
      { icon: ClipboardList, name: 'Session Report', desc: 'Weekly summary of your progress' },
      { icon: Radio, name: 'Prep Radio', desc: 'Audio lessons for the commute' },
      { icon: AlarmClock, name: 'Interview Day Mode', desc: 'Last-minute warmup + nerve management' },
    ],
  },
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

export default function FeatureToolbox() {
  return (
    <section className="py-16 sm:py-20 bg-white relative paper-grain">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm uppercase tracking-widest text-teal-600 font-semibold mb-3">
            The full toolbox
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-gray-900 mb-4">
            15 more tools for the day you actually interview.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything above is included free at the limits shown. Upgrade for unlimited.
          </p>
        </div>

        {/* Category rows */}
        <div className="space-y-12">
          {CATEGORIES.map((category) => {
            const count = category.features.length;
            const gridCols =
              count === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            return (
              <div key={category.title}>
                <h3 className="font-serif text-xl text-gray-900 mb-5">{category.title}</h3>
                <div className={`grid ${gridCols} gap-4`}>
                  {category.features.map((feature) => (
                    <FeatureCard key={feature.name} feature={feature} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
