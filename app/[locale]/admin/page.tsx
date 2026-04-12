import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN } from "@/lib/config/site";
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
>;

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ secret?: string }>;
}) {
  const { locale } = await params;
  const { secret: secretParam } = await searchParams;

  // Check secret from URL param or cookie
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_secret")?.value;
  const secret = secretParam ?? cookieSecret ?? "";

  if (!ADMIN.secret || secret !== ADMIN.secret) {
    redirect(`/${locale}/`);
  }

  const adminSupabase = createAdminClient();

  const [{ data: pendingData }, { data: allData }] = await Promise.all([
    adminSupabase
      .from("listings")
      .select("id, name, slug, type, status, is_featured, is_verified, city, country, plan, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),

    adminSupabase
      .from("listings")
      .select("id, name, slug, type, status, is_featured, is_verified, city, country, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const pending = (pendingData ?? []) as AdminListing[];
  const all = (allData ?? []) as AdminListing[];

  return (
    <div className="min-h-screen bg-[#fafaf5] px-6 py-16">
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
            { label: "Total Listings", value: all.length, color: "text-on-surface" },
            { label: "Approved", value: all.filter((l) => l.status === "approved").length, color: "text-green-600" },
            { label: "Featured", value: all.filter((l) => l.is_featured).length, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-card rounded-2xl shadow-card p-5 text-center">
              <p className={`font-serif text-3xl font-bold ${stat.color} mb-1`}>
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
