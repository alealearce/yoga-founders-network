import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/config/site";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

export const metadata: Metadata = {
  title: "About Us",
  description: `${SITE.tagline}. Learn about the mission behind Yoga Founders Network — a global directory and community built to help yoga studios and founders grow.`,
};

const CORE_VALUES = [
  {
    icon: "🌿",
    title: "Integrity",
    description: "We curate with care. Every listing is reviewed so you can trust what you find here.",
  },
  {
    icon: "🤝",
    title: "Collaboration",
    description: "We believe the yoga community grows stronger together — sharing resources, referrals, and wisdom.",
  },
  {
    icon: "♻️",
    title: "Sustainability",
    description: "We support business models that allow yoga founders to thrive without burning out.",
  },
  {
    icon: "✨",
    title: "Abundance",
    description: "There is enough space, students, and success for every yoga founder. We celebrate each other's growth.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero with Aperture image */}
      <section className="pt-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: "clamp(280px, 40vw, 520px)",
              borderRadius: "1.5rem 1.5rem 1.5rem 0",
            }}
          >
            <Image
              src="/images/about-header.png"
              alt="Yoga Founders Network — our mission"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="font-sans text-xs font-bold tracking-widest text-white/80 uppercase mb-2">
                Our Mission
              </p>
              <h1 className="font-serif text-display-sm text-white leading-tight max-w-2xl">
                {SITE.tagline}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-20 lg:py-28 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
                Why We Exist
              </p>
              <h2 className="font-serif text-display-sm text-on-surface mb-6">
                Yoga communities are vital — now more than ever.
              </h2>
            </div>
            <div className="space-y-4 font-sans text-base text-on-surface-variant leading-relaxed">
              <p>
                We live in an era of rapid digital transformation and artificial intelligence — a world that increasingly pulls us away from our bodies, our breath, and each other. Yoga studios and communities have become sanctuaries of human connection in this shifting landscape.
              </p>
              <p>
                Yet the founders behind these spaces — the teachers, studio owners, and retreat hosts — often operate on thin margins, wearing every hat, and struggling to be discovered in an algorithm-driven world.
              </p>
              <p>
                We built Yoga Founders Network to change that. Our mission is to amplify the reach of yoga businesses so they can focus on what matters most: their students, their craft, and their community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 lg:py-28 bg-surface-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              What We Do
            </p>
            <h2 className="font-serif text-display-sm text-on-surface mb-4">
              Tools, directory &amp; community
            </h2>
            <p className="font-sans text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              We provide everything yoga founders need to grow their visibility, connect with students, and build sustainable practices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "Global Directory",
                description: "A curated, searchable directory of yoga studios, teachers, schools, retreats, products, and workshops — free to discover, easy to list.",
              },
              {
                icon: "🤝",
                title: "Founder Network",
                description: "Connect with other yoga business owners. Share resources, referrals, and collective wisdom from the global yoga founder community.",
              },
              {
                icon: "📣",
                title: "Visibility Tools",
                description: "Verified listings, featured placements, SEO-optimized profiles, and newsletter spotlights — designed to help students find you.",
              },
            ].map(item => (
              <div key={item.title} className="bg-surface-card rounded-2xl p-8">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl font-bold text-on-surface mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-28 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              What We Stand For
            </p>
            <h2 className="font-serif text-display-sm text-on-surface">
              Core Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {CORE_VALUES.map(value => (
              <div key={value.title} className="bg-surface-card rounded-2xl p-8 flex gap-5">
                <div className="text-3xl flex-shrink-0">{value.icon}</div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-on-surface mb-2">
                    {value.title}
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Founder */}
      <section className="py-20 lg:py-28 bg-surface-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
                The Story Behind It
              </p>
              <h2 className="font-serif text-display-sm text-on-surface mb-6">
                Built by a yoga founder, for yoga founders.
              </h2>
              <div className="space-y-4 font-sans text-base text-on-surface-variant leading-relaxed">
                <p>
                  Our founder built an online yoga studio from scratch — creating content, managing students, handling marketing, payments, and tech. The experience was humbling.
                </p>
                <p>
                  What became clear was that most yoga founders face the same invisible ceiling: deep expertise in their craft, but limited time and resources to build the business side. They deserve better tools, better visibility, and a community that has their back.
                </p>
                <p>
                  That insight became Yoga Founders Network — a directory and community designed from the ground up to serve the people who dedicate their lives to sharing yoga with the world.
                </p>
              </div>
            </div>
            <div className="bg-surface-card rounded-2xl p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center text-4xl mx-auto mb-6">
                🧘
              </div>
              <p className="font-serif text-lg font-bold text-on-surface mb-2">
                The YFN Team
              </p>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                A small team of yoga practitioners and technologists dedicated to helping the global yoga community flourish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 lg:py-28"
        style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-serif text-display-sm text-white mb-4">
            Join the Network
          </h2>
          <p className="font-sans text-lg text-white/75 max-w-xl mx-auto mb-10">
            Whether you are a studio owner, teacher, school, or retreat host — your practice belongs in our global community.
          </p>
          <Link
            href="/submit"
            className="inline-flex px-8 py-4 rounded-full font-sans text-base font-semibold bg-white text-[#536046] hover:bg-white/90 transition-all duration-400"
          >
            Submit Your Listing
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
            Stay Connected
          </p>
          <h2 className="font-serif text-display-sm text-on-surface mb-3">
            Weekly Sanctuary Dispatches
          </h2>
          <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
            Curated yoga wisdom and community stories — delivered every week.
          </p>
          <NewsletterSignup variant="inline" />
        </div>
      </section>
    </>
  );
}
