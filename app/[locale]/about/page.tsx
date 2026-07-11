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

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {/* Hero — Mission Statement */}
      <section className="pt-32 pb-20 bg-surface-card border-b border-outline-variant/20">
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
      <section className="py-20 lg:py-28 bg-bg">
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
                We live in an era of rapid digital transformation — a world that increasingly pulls us away from our bodies. Yoga studios and communities have become sanctuaries of human connection.
              </p>
              <p>
                We built Yoga Founders Network to help yoga communities be found. Our mission is to amplify the reach of yoga in society.
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
                <h3 className="font-serif text-xl text-on-surface mb-3">
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

      {/* Our Founder */}
      <section className="py-20 lg:py-28 bg-surface-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
                The Story Behind It
              </p>
              <div className="space-y-4 font-sans text-base text-on-surface-variant leading-relaxed">
                <p>
                  I ran an online yoga studio in the past — content production, customer service, marketing, payments, the tech stack. Building something good and getting it found are two completely different problems. That’s why we’re building Yoga Founders.
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
        style={{ background: "#231E17" }}
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
            className="inline-flex px-8 py-4 rounded-[2px] font-sans text-base font-semibold bg-surface-card text-primary hover:bg-surface-card/90 transition-all duration-400"
          >
            Submit Your Listing
          </Link>
        </div>
      </section>

    </>
  );
}
