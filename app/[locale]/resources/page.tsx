import type { Metadata } from "next";
import Link from "next/link";
import YogaSilhouette from "@/components/ui/YogaSilhouette";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Free Yoga Tools for Teachers & Studio Owners",
  description: "Free generators, planners, and guides built for yoga professionals. Create class themes, plan retreats, generate email sequences, calculate studio profitability, and more.",
  alternates: { canonical: `${SITE.url}/resources` },
};

const RESOURCES = [
  {
    href: "/resources/retreat-checklist",
    title: "Retreat Planning Checklist",
    desc: "Generate a comprehensive, personalized checklist for planning your next yoga retreat — from booking venues to post-retreat follow-up, with pro tips.",
    tag: "Retreat Leaders",
    time: "3 min",
    pose: "mountain" as const,
  },
  {
    href: "/resources/class-theme-generator",
    title: "Class Theme Generator",
    desc: "Never run out of creative class ideas. Get a complete theme with intentions, peak poses, music suggestions, opening and closing scripts, and teaching points.",
    tag: "Teachers",
    time: "1 min",
    pose: "warrior" as const,
  },
  {
    href: "/resources/wellness-planner",
    title: "Yoga & Wellness Planner",
    desc: "Build a personalized morning yoga routine and daily meal plan based on your experience level, goals, and available time.",
    tag: "Practitioners",
    time: "3 min",
    pose: "lotus" as const,
  },
  {
    href: "/resources/email-generator",
    title: "Re-Engagement Email Generator",
    desc: "Win back dormant students with a complete 7-email sequence tailored to your studio's voice, tone, and offer. Includes subject lines, preview text, and send timing.",
    tag: "Studio Owners",
    time: "2 min",
    pose: "seated" as const,
  },
  {
    href: "/resources/teacher-finder",
    title: "Find Your Perfect Teacher",
    desc: "Answer a few questions about your goals, style preferences, and priorities — and get matched with teachers whose approach aligns with your practice.",
    tag: "Students",
    time: "2 min",
    pose: "tree" as const,
  },
  {
    href: "/resources/studio-name-generator",
    title: "Studio Name Generator",
    desc: "Discover the perfect name for your studio with domain suggestions, taglines, and name meanings — generated based on your vibe, audience, and style.",
    tag: "Studio Owners",
    time: "2 min",
    pose: "child" as const,
  },
  {
    href: "/resources/profitability-calculator",
    title: "Profitability Calculator",
    desc: "Understand your studio's true financial health. Enter your costs and revenue streams, get an instant profit/loss summary and actionable improvement recommendations.",
    tag: "Studio Owners",
    time: "5 min",
    pose: "seated" as const,
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-bg">
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
      <section className="pb-24 bg-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {RESOURCES.map(resource => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group flex bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 border border-outline-variant/20"
              >
                {/* Silhouette panel */}
                <div className="flex-shrink-0 w-36 bg-on-surface flex items-center justify-center py-8">
                  <YogaSilhouette pose={resource.pose} size={72} color="#ffffff" />
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center px-7 py-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-sans text-xs font-bold text-on-surface-variant bg-surface-low px-2.5 py-1 rounded-full">
                      {resource.tag}
                    </span>
                    <span className="font-sans text-xs text-on-surface-variant/50">~{resource.time}</span>
                  </div>
                  <h2 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
                    {resource.title}
                  </h2>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-4">
                    {resource.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 font-sans text-xs font-bold text-primary uppercase tracking-wide">
                    Try it free
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </Link>
            ))}

            {/* Coming Soon */}
            <div className="flex bg-surface-card rounded-2xl overflow-hidden border border-outline-variant/20 border-dashed opacity-60">
              <div className="flex-shrink-0 w-36 bg-surface-low flex items-center justify-center py-8">
                <YogaSilhouette pose="mountain" size={72} color="#d0d0d0" />
              </div>
              <div className="flex flex-col justify-center px-7 py-6">
                <h2 className="font-serif text-lg text-on-surface-variant leading-snug mb-2">
                  More Coming Soon
                </h2>
                <p className="font-sans text-sm text-on-surface-variant/60 leading-relaxed">
                  New tools and guides are added regularly for the yoga community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
