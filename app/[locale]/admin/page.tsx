import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/config/site";
import type { Listing } from "@/lib/supabase/types";
import AdminClient from "./AdminClient";

export const metadata = {
  title: "Admin — Yoga Founders Network",
  robots: { index: false },
};

type AdminListing = Pick<
  Listing,
  | "id"
  | "name"
  | "slug"
  | "type"
  | "status"
  | "is_featured"
  | "is_verified"
  | "city"
  | "country"
  | "plan"
  | "created_at"
  | "founder_story"
  | "founder_images"
  | "images"
  | "story_opt_out"
  | "story_post_id"
>;

const LISTING_COLUMNS =
  "id, name, slug, type, status, is_featured, is_verified, city, country, plan, created_at, founder_story, founder_images, images, story_opt_out, story_post_id";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/");

  const adminSupabase = createAdminClient();

  const [
    { data: pendingData },
    { data: allData, count: allCount },
    { count: approvedCount },
  ] = await Promise.all([
    adminSupabase
      .from("listings")
      .select(LISTING_COLUMNS)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),

    adminSupabase
      .from("listings")
      .select(LISTING_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000),

    adminSupabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  const pending = (pendingData ?? []) as AdminListing[];
  const all = (allData ?? []) as AdminListing[];
  const totalListings = allCount ?? all.length;
  const totalApproved = approvedCount ?? all.filter((l) => l.status === "approved").length;

  return (
    <div className="min-h-screen bg-bg px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-display-sm text-on-surface">
              Admin Dashboard
            </h1>
          </div>
          <p className="font-sans text-sm text-on-surface-variant">
            Yoga Founders Network — Content moderation and directory management
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Pending Review", value: pending.length, color: "text-amber-600" },
            { label: "Total Listings", value: totalListings, color: "text-on-surface" },
            { label: "Approved", value: totalApproved, color: "text-green-600" },
            { label: "Featured", value: all.filter((l) => l.is_featured).length, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-card rounded-2xl shadow-card p-5 text-center">
              <p className={`font-serif text-3xl ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="font-sans text-xs text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Interactive tables */}
        <AdminClient pending={pending} all={all} />
      </div>
    </div>
  );
}
