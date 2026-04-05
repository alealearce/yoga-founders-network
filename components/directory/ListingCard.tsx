import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ListingCardProps {
  id:           string;
  slug:         string;
  name:         string;
  type:         string;
  tagline?:     string;
  city?:        string;
  country?:     string;
  logo_url?:    string | null;
  images?:      string[];
  yoga_styles?: string[];
  rating_avg?:  number | null;
  rating_count?:number | null;
  is_verified?: boolean;
  is_featured?: boolean;
  price_range?: string | null;
  variant?:     "card" | "row";
}

export default function ListingCard({
  slug, name, type, tagline, city, country,
  logo_url, images, yoga_styles, rating_avg, rating_count,
  is_verified, is_featured, price_range, variant = "card",
}: ListingCardProps) {
  const coverImage = images?.[0] ?? logo_url ?? null;
  const location   = [city, country].filter(Boolean).join(", ");

  if (variant === "row") {
    return (
      <Link
        href={`/listing/${slug}`}
        className="group flex items-start gap-5 p-4 rounded-2xl bg-surface-card hover:shadow-card transition-all duration-400"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-low">
          {coverImage ? (
            <Image src={coverImage} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-400" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {TYPE_ICONS[type] ?? "🧘"}
            </div>
          )}
          {is_verified && (
            <div className="absolute top-1.5 left-1.5 bg-primary text-white rounded-full p-0.5">
              <BadgeCheck size={12} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">
            {TYPE_LABELS[type] ?? type}
          </p>
          <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors duration-300 truncate">
            {name}
          </h3>
          {location && (
            <p className="flex items-center gap-1 font-sans text-xs text-on-surface-variant mt-1">
              <MapPin size={11} /> {location}
            </p>
          )}
          {yoga_styles && yoga_styles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {yoga_styles.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container font-sans text-xs text-primary font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        {rating_avg && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-sans text-sm font-semibold text-on-surface">{rating_avg.toFixed(1)}</span>
            {rating_count && <span className="font-sans text-xs text-on-surface-variant">({rating_count})</span>}
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/listing/${slug}`}
      className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-52 bg-surface-low overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[600ms]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-low">
            {TYPE_ICONS[type] ?? "🧘"}
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {is_featured && (
            <span className="px-2.5 py-1 rounded-full bg-primary text-white font-sans text-xs font-bold tracking-wide">
              Featured
            </span>
          )}
          {is_verified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-primary font-sans text-xs font-bold">
              <BadgeCheck size={11} /> Verified
            </span>
          )}
        </div>
        {price_range && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-white/90 font-sans text-xs font-semibold text-on-surface">
              {price_range}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">
          {TYPE_LABELS[type] ?? type}
        </p>
        <h3 className="font-serif text-xl font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight mb-1">
          {name}
        </h3>
        {tagline && (
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
            {tagline}
          </p>
        )}
        {location && (
          <p className="flex items-center gap-1.5 font-sans text-xs text-on-surface-variant mb-3">
            <MapPin size={12} /> {location}
          </p>
        )}
        {yoga_styles && yoga_styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {yoga_styles.slice(0, 3).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-secondary-container font-sans text-xs text-primary font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
        {rating_avg && (
          <div className="flex items-center gap-1.5 pt-4 border-t border-outline-variant/20">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-sans text-sm font-semibold text-on-surface">{rating_avg.toFixed(1)}</span>
            {rating_count && (
              <span className="font-sans text-xs text-on-surface-variant">({rating_count} reviews)</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

const TYPE_ICONS: Record<string, string> = {
  studio: "🧘", teacher: "👤", school: "🎓",
  retreat: "🌿", product: "🪷", workshop: "✨",
};

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio", teacher: "Teacher", school: "School",
  retreat: "Retreat", product: "Product", workshop: "Workshop",
};
