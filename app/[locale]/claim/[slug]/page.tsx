import { redirect, notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import ClaimForm from "./ClaimForm";

export const metadata = {
  title: "Claim your listing — Yoga Founders Network",
  robots: { index: false },
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/claim/${encodeURIComponent(slug)}`);

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, name, slug, type, city, country, owner_id, yoga_alliance_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!listing) notFound();

  return (
    <div className="min-h-screen bg-bg px-6 py-24">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
            Claim your listing
          </p>
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            {listing.name}
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            {[listing.city, listing.country].filter(Boolean).join(", ") || `${listing.type} listing`}
          </p>
        </div>

        {listing.owner_id ? (
          <div className="bg-surface-low rounded-2xl p-6 space-y-3">
            <p className="font-sans text-sm text-on-surface">
              This listing is already claimed. If it&apos;s yours and you&apos;ve lost
              access, email <a href="mailto:hello@yogafoundersnetwork.com" className="text-primary underline">hello@yogafoundersnetwork.com</a>.
            </p>
          </div>
        ) : (
          <ClaimForm slug={listing.slug} existingYaId={listing.yoga_alliance_id} userEmail={user.email ?? ""} />
        )}
      </div>
    </div>
  );
}
