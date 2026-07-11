import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import YogaSilhouette from "@/components/ui/YogaSilhouette";
import { getListingUrl } from "@/lib/utils/listingUrl";

const POSES = ["seated", "tree", "warrior", "lotus", "child", "mountain"] as const;
type Pose = (typeof POSES)[number];

function poseForId(id: string): Pose {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return POSES[h % POSES.length];
}

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
  distance_km?: number | null;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

/** The verification stamp — the one pill in the system. */
function VerifiedStamp() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-accent-text bg-bg text-accent-text font-sans text-[10px] font-extrabold tracking-[0.14em] uppercase">
      <BadgeCheck size={11} /> Verified
    </span>
  );
}

export default function ListingCard({
  id, slug, name, type, tagline, city, country,
  logo_url, images, yoga_styles,
  is_verified, is_featured, variant = "card",
  distance_km,
}: ListingCardProps) {
  const pose = poseForId(id);
  const coverImage = images?.[0] ?? logo_url ?? null;
  const location   = [city, country].filter(Boolean).join(", ");

  if (variant === "row") {
    return (
      <Link
        href={getListingUrl(type, slug)}
        className="group flex items-start gap-5 p-4 border border-outline-variant rounded-[2px] bg-bg hover:bg-surface-card transition-colors duration-300"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 rounded-[2px] overflow-hidden flex-shrink-0 bg-surface-low">
          {coverImage ? (
            <CoverImage src={coverImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary-container/50 flex items-center justify-center">
              <YogaSilhouette pose={pose} size={48} color="#8C7B60" />
            </div>
          )}
          {is_verified && (
            <div className="absolute top-1.5 left-1.5 bg-bg border border-accent-text text-accent-text rounded-full p-0.5">
              <BadgeCheck size={12} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[10px] font-extrabold tracking-[0.16em] text-on-surface-variant uppercase mb-1">
            {TYPE_LABELS[type] ?? type}
          </p>
          <h3 className="font-serif text-xl text-on-surface group-hover:text-accent-text transition-colors duration-300 truncate">
            {name}
          </h3>
          {location && (
            <p className="flex items-center gap-1 font-sans text-xs text-on-surface-variant mt-1">
              <MapPin size={11} /> {location}
            </p>
          )}
          {yoga_styles && yoga_styles.length > 0 && (
            <p className="font-serif italic text-[15px] text-on-surface-variant mt-1.5 truncate">
              {yoga_styles.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>

      </Link>
    );
  }

  return (
    <Link
      href={getListingUrl(type, slug)}
      className="group block border border-outline-variant rounded-[2px] overflow-hidden bg-bg hover:bg-surface-card transition-colors duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-52 bg-surface-low overflow-hidden">
        {coverImage ? (
          <CoverImage src={coverImage} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary-container/50 flex items-center justify-center">
            <YogaSilhouette pose={pose} size={96} color="#8C7B60" />
          </div>
        )}
        {/* Featured label — quiet, top-left */}
        {is_featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-[2px] bg-primary text-primary-on font-sans text-[10px] font-extrabold tracking-[0.14em] uppercase">
            Featured
          </span>
        )}
        {/* Verification stamp — top-right */}
        {is_verified && (
          <span className="absolute top-3 right-3">
            <VerifiedStamp />
          </span>
        )}
        {/* Distance — bottom-right of the image */}
        {typeof distance_km === "number" && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-[2px] bg-bg/95 text-on-surface font-sans text-xs font-bold">
            <MapPin size={11} /> {formatDistance(distance_km)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type label with trailing hairline */}
        <div className="flex items-center gap-3 mb-2.5">
          <p className="font-sans text-[10px] font-extrabold tracking-[0.16em] text-on-surface-variant uppercase">
            {TYPE_LABELS[type] ?? type}
          </p>
          <span className="h-px flex-1 bg-outline-variant" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-[1.625rem] text-on-surface group-hover:text-accent-text transition-colors duration-300 leading-tight mb-1">
          {name}
        </h3>
        {location && (
          <p className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-on-surface-variant mb-2">
            <MapPin size={12} /> {location}
          </p>
        )}
        {tagline && (
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-2">
            {tagline}
          </p>
        )}
        {yoga_styles && yoga_styles.length > 0 && (
          <p className="font-serif italic text-[15px] text-on-surface-variant">
            {yoga_styles.slice(0, 3).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio", teacher: "Teacher", school: "School",
  retreat: "Retreat", product: "Product", workshop: "Workshop",
};
