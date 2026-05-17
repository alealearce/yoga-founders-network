import { SITE } from "@/lib/config/site";
import type { Listing } from "@/lib/supabase/types";

const TYPE_PREFIXES: Record<string, string> = {
  studio:   "/yogastudio",
  teacher:  "/yogateacher",
  school:   "/yogaschool",
  retreat:  "/retreatcenter",
  product:  "/yogaproducts",
  workshop: "/yogaworkshops",
};

const SCHEMA_TYPE: Record<string, string> = {
  studio:   "HealthAndBeautyBusiness",
  teacher:  "Person",
  school:   "EducationalOrganization",
  retreat:  "LodgingBusiness",
  product:  "LocalBusiness",
  workshop: "Event",
};

interface Props {
  /** Title for the ItemList (e.g. "Yoga Studios Near You"). */
  name: string;
  /** Short description of the list. */
  description: string;
  /** Canonical URL of the category page. */
  url: string;
  /** Listings to include — capped to first 50 to keep payload reasonable. */
  listings: Listing[];
  /** Total number of approved listings on this category (drives numberOfItems). */
  total: number;
}

export default function CategoryJsonLd({ name, description, url, listings, total }: Props) {
  const items = listings.slice(0, 50).map((l, i) => {
    const item: Record<string, unknown> = {
      "@type": SCHEMA_TYPE[l.type] ?? "LocalBusiness",
      name: l.name,
      url: `${SITE.url}${TYPE_PREFIXES[l.type] ?? "/listing"}/${l.slug}`,
    };
    if (l.address || l.city || l.country) {
      item.address = {
        "@type": "PostalAddress",
        ...(l.address ? { streetAddress: l.address } : {}),
        ...(l.city ? { addressLocality: l.city } : {}),
        ...(l.country ? { addressCountry: l.country } : {}),
      };
    }
    if (typeof l.latitude === "number" && typeof l.longitude === "number") {
      item.geo = { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude };
    }
    if (l.website) item.sameAs = l.website;
    if (l.phone) item.telephone = l.phone;
    if (l.description) item.description = l.description.slice(0, 240);
    return { "@type": "ListItem", position: i + 1, item };
  });

  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url,
    numberOfItems: total,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
