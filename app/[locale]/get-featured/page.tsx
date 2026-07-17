import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/config/site";
import GetFeaturedForm from "./GetFeaturedForm";

export const metadata: Metadata = {
  title: "Get Featured — Yoga Founders Network",
  robots: { index: false },
};

interface InviteListing {
  name: string;
  images: string[];
  founder_story: Record<string, string> | null;
  story_post_id: string | null;
}

export default async function GetFeaturedPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  let listing: InviteListing | null = null;
  if (token) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("listings")
      .select("name, images, founder_story, story_post_id")
      .eq("invite_token", token)
      .maybeSingle();
    listing = data as InviteListing | null;
  }

  if (!token || !listing) {
    return (
      <InfoCard title="This link isn&apos;t valid">
        We couldn&apos;t find an invitation for this link. It may have expired or been copied incorrectly. If you think this is a mistake, email us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-primary underline">
          {SITE.email}
        </a>{" "}
        and we&apos;ll sort it out.
      </InfoCard>
    );
  }

  if (listing.story_post_id) {
    return (
      <InfoCard title="Your spotlight is already live" cta={{ label: "Visit The Journal", href: "/community" }}>
        Your Member Spotlight has already been published — thank you for sharing your story with the network.
      </InfoCard>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
            Member Spotlight
          </p>
          <h1 className="font-serif text-display-sm text-on-surface mb-4">
            Get Featured, {listing.name}
          </h1>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            Answer five short questions in your own words, add a photo or two, and we&apos;ll publish your Member Spotlight in The Journal and across our channels.
          </p>
        </div>

        <GetFeaturedForm
          token={token}
          existingImages={listing.images ?? []}
          existingStory={listing.founder_story ?? {}}
        />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
  cta,
}: {
  title: string;
  children: React.ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center py-20">
        <h1 className="font-serif text-display-sm text-on-surface mb-4">{title}</h1>
        <p className="font-sans text-base text-on-surface-variant leading-relaxed mb-8">{children}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex px-6 py-3 rounded-[2px] font-sans text-sm font-semibold bg-primary text-white transition-opacity hover:opacity-90"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
