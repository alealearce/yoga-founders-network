import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing, Review } from "@/lib/supabase/types";
import { MapPin, Globe, Mail, Phone, BadgeCheck, Star, Instagram, Facebook, Youtube } from "lucide-react";
import { SITE } from "@/lib/config/site";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data } = await supabase
    .from("listings")
    .select("name, description, tagline, images, city, country")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Listing Not Found" };

  const location = [data.city, data.country].filter(Boolean).join(", ");

  return {
    title: data.name,
    description: data.tagline ?? data.description ?? `${data.name} — ${SITE.name}`,
    openGraph: {
      title: `${data.name}${location ? ` — ${location}` : ""}`,
      description: data.tagline ?? data.description ?? "",
      images: data.images?.[0] ? [{ url: data.images[0] }] : [],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const supabase  = await createClient();

  const [listingRes, reviewsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("slug", slug)
      .eq("status", "approved")
      .single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const listing: Listing | null = listingRes.data;
  if (!listing) notFound();

  // Filter reviews for this listing
  const allReviews: Review[] = reviewsRes.data ?? [];
  const reviews = allReviews.filter(r => r.listing_id === listing.id);

  const location   = [listing.city, listing.country].filter(Boolean).join(", ");
  const coverImage = listing.images?.[0] ?? listing.logo_url ?? null;

  const TYPE_LABELS: Record<string, string> = {
    studio: "Studio", teacher: "Teacher", school: "School",
    retreat: "Retreat", product: "Product", workshop: "Workshop",
  };

  return (
    <>
      {/* Hero — Aperture shape */}
      <div className="pt-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-0">
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: "clamp(240px, 40vw, 480px)",
              borderRadius: "1.5rem 1.5rem 1.5rem 0",
            }}
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={listing.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 90vw"
              />
            ) : (
              <div className="w-full h-full bg-surface-low flex items-center justify-center">
                <span className="text-7xl opacity-40">🧘</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-secondary-container font-sans text-xs font-bold text-primary tracking-wide uppercase">
                  {TYPE_LABELS[listing.type] ?? listing.type}
                </span>
                {listing.is_verified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 font-sans text-xs font-bold text-primary">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
                {listing.is_featured && (
                  <span className="px-3 py-1 rounded-full bg-primary text-white font-sans text-xs font-bold">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-serif text-display-sm text-on-surface mb-3">
                {listing.name}
              </h1>

              {listing.tagline && (
                <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-4">
                  {listing.tagline}
                </p>
              )}

              {location && (
                <p className="flex items-center gap-2 font-sans text-sm text-on-surface-variant">
                  <MapPin size={14} className="text-primary" />
                  {location}
                </p>
              )}

              {listing.rating_avg > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(listing.rating_avg)
                        ? "text-amber-500 fill-amber-500"
                        : "text-outline-variant"
                      }
                    />
                  ))}
                  <span className="font-sans text-sm font-semibold text-on-surface">
                    {listing.rating_avg.toFixed(1)}
                  </span>
                  <span className="font-sans text-sm text-on-surface-variant">
                    ({listing.rating_count} review{listing.rating_count !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Yoga Styles */}
            {listing.yoga_styles?.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
                  Yoga Styles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {listing.yoga_styles.map(style => (
                    <span
                      key={style}
                      className="px-4 py-1.5 rounded-full bg-secondary-container text-primary font-sans text-sm font-medium"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {(listing.long_description || listing.description) && (
              <div>
                <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
                  About
                </h2>
                <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed font-sans">
                  {(listing.long_description ?? listing.description ?? "")
                    .split("\n\n")
                    .map((para, i) => (
                      <p key={i} className="mb-4">
                        {para}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Experience & Languages */}
            <div className="grid sm:grid-cols-2 gap-8">
              {listing.experience_levels?.length > 0 && (
                <div>
                  <h3 className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Experience Levels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.experience_levels.map(level => (
                      <span key={level} className="px-3 py-1 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {listing.languages?.length > 0 && (
                <div>
                  <h3 className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-3">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-on-surface mb-6">
                  Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-surface-card rounded-2xl shadow-card p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Get in Touch
              </h3>

              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-5 py-3 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
                >
                  <Globe size={14} />
                  Visit Website
                </a>
              )}

              {listing.email && (
                <a
                  href={`mailto:${listing.email}`}
                  className="flex items-center gap-3 w-full px-5 py-3 rounded-full font-sans text-sm font-semibold text-primary bg-secondary-container hover:bg-secondary-container/80 transition-all duration-400"
                >
                  <Mail size={14} />
                  Send Email
                </a>
              )}

              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="flex items-center gap-3 w-full px-5 py-3 rounded-full font-sans text-sm font-medium text-on-surface-variant bg-surface-low hover:bg-secondary-container hover:text-primary transition-all duration-400"
                >
                  <Phone size={14} />
                  {listing.phone}
                </a>
              )}
            </div>

            {/* Details */}
            <div className="bg-surface-card rounded-2xl shadow-card p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Details
              </h3>

              {listing.address && (
                <div>
                  <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider mb-1">Address</p>
                  <p className="font-sans text-sm text-on-surface">{listing.address}</p>
                </div>
              )}

              {location && (
                <div>
                  <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
                  <p className="font-sans text-sm text-on-surface">{location}</p>
                </div>
              )}

              {listing.price_range && (
                <div>
                  <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider mb-1">Price Range</p>
                  <p className="font-sans text-sm text-on-surface">{listing.price_range}</p>
                </div>
              )}
            </div>

            {/* Social */}
            {(listing.social_instagram || listing.social_facebook || listing.social_youtube) && (
              <div className="bg-surface-card rounded-2xl shadow-card p-6">
                <h3 className="font-serif text-lg font-bold text-on-surface mb-4">
                  Follow Along
                </h3>
                <div className="flex gap-3">
                  {listing.social_instagram && (
                    <a
                      href={listing.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-low text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-all duration-300"
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  {listing.social_facebook && (
                    <a
                      href={listing.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-low text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-all duration-300"
                    >
                      <Facebook size={16} />
                    </a>
                  )}
                  {listing.social_youtube && (
                    <a
                      href={listing.social_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-low text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-all duration-300"
                    >
                      <Youtube size={16} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Back link */}
            <Link
              href="/studios"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans text-sm text-on-surface-variant hover:text-on-surface bg-surface-low hover:bg-secondary-container transition-all duration-300"
            >
              ← Back to Directory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-surface-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-sans text-sm font-semibold text-on-surface">
            {review.user_name}
          </p>
          <p className="font-sans text-xs text-on-surface-variant">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < review.rating
                ? "text-amber-500 fill-amber-500"
                : "text-outline-variant"
              }
            />
          ))}
        </div>
      </div>
      <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
        {review.body}
      </p>
    </div>
  );
}
