import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE, DEFAULT_OG_IMAGE } from "@/lib/config/site";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

export const metadata: Metadata = {
  title: "About Yoga Founders Network — Global Yoga Directory & Community",
  description: `${SITE.tagline}. Learn about the mission behind Yoga Founders Network — a global directory and community built to help yoga studios, teachers, schools, and founders grow.`,
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: "About Yoga Founders Network",
    description: `${SITE.tagline}. A global directory and community for yoga studios, teachers, schools, retreats, and founders.`,
    url: `${SITE.url}/about`,
    images: [DEFAULT_OG_IMAGE],
    type: "website",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Yoga Founders Network",
  url: `${SITE.url}/about`,
  description: `${SITE.tagline}. A global directory and community for yoga studios, teachers, schools, retreats, and founders.`,
  mainEntity: {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    logo: `${SITE.url}${SITE.logo}`,
    sameAs: [
      SITE.social.instagram,
      SITE.social.linkedin,
      SITE.social.facebook,
    ],
  },
};

const CORE_VALUES = [
  {
    icon: "I",
    title: "Integrity",
    description: "We curate with care. Every listing is reviewed so you can trust what you find here.",
  },
  {
    icon: "C",
    title: "Collaboration",
    description: "We believe the yoga community grows stronger together — sharing resources, referrals, and wisdom.",
  },
  {
    icon: "S",
    title: "Sustainability",
    description: "We support business models that allow yoga founders to thrive without burning out.",
  },
  {
    icon: "A",
    title: "Abundance",
    description: "There is enough space, students, and success for every yoga founder. We celebrate each other's growth.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {/* Hero — Mission Statement */}
      <section className="pt-32 pb-20 bg-white border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-8">
            Our Mission
          </p>
          <h1
            className="font-serif text-on-surface leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            Help Yoga Grow its<br />
            <em className="not-italic text-on-surface/40">Impact in Society.</em>
          </h1>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-20 lg:py-28 bg-[#ffffff]">
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
                Yet the founders behind these spaces — often operate on thin margins, wearing every hat, and struggling to be discovered in an algorithm-driven world.
              </p>
              <p>
                We built Yoga Founders Network to help with that. Our mission is to amplify the reach of yoga businesses so they can focus on what matters most: their students, their business, and their community.
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
                icon: "D",
                title: "Global Directory",
                description: "A curated, searchable directory of yoga studios, teachers, schools, retreats, products, and workshops — free to discover, easy to list.",
              },
              {
                icon: "N",
                title: "Founder Network",
                description: "Connect with other yoga business owners. Share resources, referrals, and collective wisdom from the global yoga founder community.",
              },
              {
                icon: "V",
                title: "Visibility Tools",
                description: "Verified listings, featured placements, SEO-optimized profiles, and newsletter spotlights — designed to help students find you.",
              },
            ].map(item => (
              <div key={item.title} className="bg-surface-card rounded-2xl p-8">
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
      <section className="py-20 lg:py-28 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              What We Stand For
            </p>
            <h2 className="font-serif text-display-sm text-on-surface">
              Core Values
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CORE_VALUES.map(value => (
              <div key={value.title} className="rounded-2xl p-8 border border-on-surface/20">
                <h3 className="font-serif text-xl font-bold text-on-surface mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {value.description}
                </p>
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
                  One of my past projects was an online yoga studio app, I wore all the hats — producing content, customer service, handling marketing, payments, and tech.
                </p>
                <p>
                  Most business owners in yoga face the same invisible ceiling: deep expertise in the craft, but limited time and resources to build the business side. Yoga Founders is working on providing you with visibility and a community that supports you.
                </p>
                <p>
                  Our vision is to amplify your visibility through automation tools and create a space where the community can easily find you.
                </p>
              </div>
            </div>
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: "16/9" }}
            >
              <Image
                src="/images/about-header.png"
                alt="Yoga Founders Network studio"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 lg:py-28"
        style={{ background: "#111111" }}
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
            className="inline-flex px-8 py-4 rounded-full font-sans text-base font-semibold bg-white text-[#111111] hover:bg-white/90 transition-all duration-400"
          >
            Submit Your Listing
          </Link>
        </div>
      </section>

    </>
  );
}
