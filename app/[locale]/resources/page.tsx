import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources",
  description: "Free tools and guides for yoga studio owners, teachers, and practitioners. Generate email sequences, plan retreats, discover class themes, and more.",
};

const RESOURCES = [
  {
    href: "/resources/email-generator",
    title: "Re-Engagement Email Generator",
    desc: "Win back dormant students with a complete 7-email sequence tailored to your studio's voice, tone, and offer. Includes subject lines, preview text, and send timing.",
    tag: "Studio Owners",
    time: "2 min",
  },
  {
    href: "/resources/retreat-checklist",
    title: "Retreat Planning Checklist",
    desc: "Generate a comprehensive, personalized checklist for planning your next yoga retreat — from booking venues to post-retreat follow-up, with pro tips.",
    tag: "Retreat Leaders",
    time: "3 min",
  },
  {
    href: "/resources/class-theme-generator",
    title: "Class Theme Generator",
    desc: "Never run out of creative class ideas. Get a complete theme with intentions, peak poses, music suggestions, opening and closing scripts, and teaching points.",
    tag: "Teachers",
    time: "1 min",
  },
  {
    href: "/resources/wellness-planner",
    title: "Yoga & Wellness Planner",
    desc: "Build a personalized morning yoga routine and daily meal plan based on your experience level, goals, and available time.",
    tag: "Practitioners",
    time: "3 min",
  },
  {
    href: "/resources/teacher-finder",
    title: "Find Your Perfect Teacher",
    desc: "Answer a few questions about your goals, style preferences, and priorities — and get matched with teachers whose approach aligns with your practice.",
    tag: "Students",
    time: "2 min",
  },
  {
    href: "/resources/studio-name-generator",
    title: "Studio Name Generator",
    desc: "Discover the perfect name for your studio with domain suggestions, taglines, and name meanings — generated based on your vibe, audience, and style.",
    tag: "Studio Owners",
    time: "2 min",
  },
  {
    href: "/resources/profitability-calculator",
    title: "Profitability Calculator",
    desc: "Understand your studio's true financial health. Enter your costs and revenue streams, get an instant profit/loss summary and actionable improvement recommendations.",
    tag: "Studio Owners",
    time: "5 min",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Tools &amp; Guides
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            Resources
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Free interactive tools built for yoga founders, teachers, and practitioners — to help you grow, plan, and practice with intention.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="pb-24 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESOURCES.map(resource => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group flex flex-col bg-surface-card rounded-2xl p-6 hover:shadow-card transition-all duration-400 hover:-translate-y-1 border border-outline-variant/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="font-sans text-xs font-bold text-primary/70 bg-secondary-container/60 px-2.5 py-1 rounded-full">
                    {resource.tag}
                  </span>
                </div>
                <h2 className="font-serif text-base font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
                  {resource.title}
                </h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed flex-1">
                  {resource.desc}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-sans text-xs text-on-surface-variant/60">
                    ~{resource.time}
                  </span>
                  <span className="flex items-center gap-1 font-sans text-xs font-semibold text-primary">
                    Try it free
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </Link>
            ))}

            {/* Coming Soon */}
            <div className="flex flex-col bg-surface-low rounded-2xl p-6 border border-dashed border-outline-variant/30">
              <h2 className="font-serif text-base font-bold text-on-surface-variant leading-snug mb-2">
                More Coming Soon
              </h2>
              <p className="font-sans text-sm text-on-surface-variant/60 leading-relaxed">
                New tools and guides are added regularly for the yoga community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
