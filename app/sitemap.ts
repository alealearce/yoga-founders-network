import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config/site";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                                        changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/studios`,                           changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/teachers`,                          changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/services/schools`,                  changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/services/retreats`,                 changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/services/products`,                 changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/services/workshops`,                changeFrequency: "daily",   priority: 0.8 },
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
      .select("slug, updated_at")
      .eq("status", "approved"),
    supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("is_published", true),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = (listingsRes.data ?? []).map((l) => ({
    url: `${base}/listing/${l.slug}`,
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
