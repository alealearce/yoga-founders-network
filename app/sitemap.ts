import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config/site";
import { createAdminClient } from "@/lib/supabase/server";
import { getListingUrl } from "@/lib/utils/listingUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                                        changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/yogastudio`,                        changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/yogateacher`,                       changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/yogaschool`,                        changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/retreatcenter`,                     changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/yogaproducts`,                      changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/yogaworkshops`,                     changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/community`,                         changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/submit`,                            changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/resources`,                         changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/resources/class-theme-generator`,   changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/email-generator`,         changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/retreat-checklist`,       changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/profitability-calculator`,changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/studio-name-generator`,   changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/teacher-finder`,          changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/wellness-planner`,        changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`,                             changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`,                           changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,                             changeFrequency: "yearly",  priority: 0.3 },
  ];

  const supabase = createAdminClient();

  const [listingsRes, postsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("slug, type, updated_at")
      .eq("status", "approved"),
    supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("is_published", true),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = (listingsRes.data ?? []).map((l) => ({
    url: `${base}${getListingUrl(l.type, l.slug)}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = (postsRes.data ?? []).map((p) => ({
    url: `${base}/community/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...blogRoutes];
}
