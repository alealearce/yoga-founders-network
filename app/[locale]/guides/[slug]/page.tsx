import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CityGuide from "@/components/guides/CityGuide";
import { getCityGuide, CITY_GUIDES } from "@/lib/cityGuides";
import { SITE } from "@/lib/config/site";
import { routing } from "@/routing";

const BASE = SITE.url;

interface Props {
  params: { locale: string; slug: string };
}

// Guides are files in the repo, so every page prerenders. The locale has to be
// named alongside the slug — this route sits under [locale], and without it
// Next has no parent params to pair the slugs with and prerenders nothing.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CITY_GUIDES.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getCityGuide(params.slug);
  if (!guide) return {};

  const canonical = `${BASE}/guides/${guide.slug}`;
  const styles = guide.topStyles.slice(0, 3).map((s) => s.style).join(", ");
  const description = `Every yoga studio in ${guide.city} — ${guide.studioCount} listed, ${guide.verifiedCount} verified by their founder, with the styles each one teaches${styles ? ` (${styles} and more)` : ""}. Addresses and websites included.`;

  return {
    title: guide.title,
    description,
    alternates: { canonical, languages: { en: canonical, "x-default": canonical } },
    openGraph: {
      title: `${guide.title} | ${SITE.name}`,
      description,
      url: canonical,
      siteName: SITE.name,
      type: "article",
      images: [{ url: `${BASE}/opengraph-image`, width: 1200, height: 630, alt: guide.title }],
    },
  };
}

export default function CityGuidePage({ params }: Props) {
  const guide = getCityGuide(params.slug);
  if (!guide) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: guide.title,
            description: `Yoga studios in ${guide.city}.`,
            numberOfItems: guide.entries.length,
            // Alphabetical, and the markup says so — an ItemList that claims a
            // descending order it does not have is a lie told to a crawler.
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: guide.entries.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: e.name,
              url: `${BASE}${e.url}`,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE },
              { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
              { "@type": "ListItem", position: 3, name: guide.title },
            ],
          }),
        }}
      />
      <CityGuide guide={guide} />
    </>
  );
}
