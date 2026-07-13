"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Sparkles } from "lucide-react";
import type { Listing } from "@/lib/supabase/types";
import { FOUNDER_QUESTIONS } from "@/lib/config/site";
import { isStoryEligible, storyPhotos } from "@/lib/social/eligibility";
import Badge from "@/components/ui/Badge";

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

interface Props {
  pending: AdminListing[];
  all: AdminListing[];
}

type ActionResult = {
  ok: boolean;
  storyStatus?: "published" | "skipped" | "failed" | "none";
  storyUrl?: string;
};

async function callAction(
  action: string,
  id: string,
  value?: boolean
): Promise<ActionResult> {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, value }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, storyStatus: data.storyStatus, storyUrl: data.storyUrl };
  } catch {
    return { ok: false };
  }
}

function describeStoryStatus(status?: ActionResult["storyStatus"]): string | null {
  switch (status) {
    case "published":
      return "Spotlight published in The Journal.";
    case "skipped":
      return "Spotlight skipped — not enough story data.";
    case "failed":
      return "Spotlight generation failed — retry below.";
    default:
      return null;
  }
}

// Founder Story detail — shown in the pending row's expanded view so the
// story content is reviewed as part of approving the listing (nothing
// publishes that the admin hasn't seen first).
function FounderStoryDetail({ listing }: { listing: AdminListing }) {
  if (listing.story_opt_out) {
    return (
      <div className="px-5 py-4 bg-surface-low font-sans text-sm text-on-surface-variant">
        Opted out of the founder spotlight — no story or social post will be generated.
      </div>
    );
  }

  const answers = FOUNDER_QUESTIONS.filter((q) => {
    const val = listing.founder_story?.[q.key];
    return typeof val === "string" && val.trim().length > 0;
  });

  const photos = storyPhotos(listing);

  if (answers.length === 0 && photos.length === 0) {
    return (
      <div className="px-5 py-4 bg-surface-low font-sans text-sm text-on-surface-variant">
        No story answers or photos submitted.
      </div>
    );
  }

  return (
    <div className="px-5 py-5 bg-surface-low space-y-4">
      {answers.map((q) => (
        <div key={q.key}>
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent-text mb-1">
            {q.label}
          </p>
          <p className="font-sans text-sm text-on-surface leading-relaxed">
            {listing.founder_story?.[q.key]}
          </p>
        </div>
      ))}
      {photos.length > 0 && (
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent-text mb-2">
            Spotlight Photos
          </p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Founder photo submitted with listing"
                className="w-20 h-20 object-cover rounded-[2px] border border-outline-variant"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Spotlight chip + retry button, used in the "All Listings" Flags/Spotlight
// column. Shows the current state and, for eligible approved listings with
// no published post yet, a manual "Generate spotlight" trigger.
function SpotlightCell({
  listing,
  busy,
  feedback,
  onGenerate,
}: {
  listing: AdminListing;
  busy: boolean;
  feedback?: string;
  onGenerate: () => void;
}) {
  const eligible = isStoryEligible(listing) && !listing.story_post_id;
  const isPublished = !!listing.story_post_id;

  let chipLabel: string | null = null;
  if (listing.story_opt_out) chipLabel = "Opted out";
  else if (isPublished) chipLabel = "Spotlight published";
  else if (eligible) chipLabel = "Story pending";

  const showGenerateButton = listing.status === "approved" && eligible;

  if (!chipLabel && !showGenerateButton && !feedback) return null;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {chipLabel && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-outline-variant font-sans text-xs text-accent-text">
          {chipLabel}
        </span>
      )}
      {showGenerateButton && (
        <button
          onClick={onGenerate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] font-sans text-xs font-semibold bg-surface-low text-on-surface-variant hover:bg-secondary-container transition-colors disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Generate spotlight
        </button>
      )}
      {feedback && (
        <p className="font-sans text-[11px] text-on-surface-variant max-w-[180px] leading-snug">
          {feedback}
        </p>
      )}
    </div>
  );
}

export default function AdminClient({ pending: initialPending, all: initialAll }: Props) {
  const [pending, setPending] = useState(initialPending);
  const [all, setAll] = useState(initialAll);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [storyFeedback, setStoryFeedback] = useState<Record<string, string>>({});

  const markStoryPublished = (id: string) => {
    setAll((prev) =>
      prev.map((l) => (l.id === id ? { ...l, story_post_id: l.story_post_id ?? "pending-refresh" } : l))
    );
  };

  const approve = async (id: string) => {
    setBusy(id);
    const result = await callAction("approve", id);
    if (result.ok) {
      const item = pending.find((l) => l.id === id);
      setPending((prev) => prev.filter((l) => l.id !== id));
      if (item) {
        setAll((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l))
        );
      }
      const message = describeStoryStatus(result.storyStatus);
      if (message) {
        setStoryFeedback((prev) => ({ ...prev, [id]: message }));
      }
      if (result.storyStatus === "published") {
        markStoryPublished(id);
      }
    }
    setBusy(null);
  };

  const generateSpotlight = async (id: string) => {
    setBusy(id + "-story");
    const result = await callAction("story", id);
    const message = describeStoryStatus(result.storyStatus) ?? (!result.ok ? "Spotlight generation failed — try again." : null);
    if (message) {
      setStoryFeedback((prev) => ({ ...prev, [id]: message }));
    }
    if (result.storyStatus === "published") {
      markStoryPublished(id);
    }
    setBusy(null);
  };

  const reject = async (id: string) => {
    setBusy(id);
    const result = await callAction("reject", id);
    if (result.ok) {
      setPending((prev) => prev.filter((l) => l.id !== id));
      setAll((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "rejected" } : l))
      );
    }
    setBusy(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy(id + "-featured");
    const result = await callAction("feature", id, !current);
    if (result.ok) {
      setAll((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_featured: !current } : l))
      );
    }
    setBusy(null);
  };

  const toggleVerified = async (id: string, current: boolean) => {
    setBusy(id + "-verified");
    const result = await callAction("verify", id, !current);
    if (result.ok) {
      setAll((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_verified: !current } : l))
      );
    }
    setBusy(null);
  };

  const removeListing = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Delete "${name}"?\n\nThis permanently removes the listing from the directory and cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(id + "-delete");
    const result = await callAction("delete", id);
    if (result.ok) {
      setPending((prev) => prev.filter((l) => l.id !== id));
      setAll((prev) => prev.filter((l) => l.id !== id));
    } else {
      window.alert("Delete failed. Please try again.");
    }
    setBusy(null);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(["pending", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-[2px] font-sans text-sm font-semibold transition-all duration-300 ${
              tab === t
                ? "text-white"
                : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
            }`}
            style={
              tab === t
                ? { background: "#231E17" }
                : undefined
            }
          >
            {t === "pending" ? `Pending (${pending.length})` : `All Listings (${all.length})`}
          </button>
        ))}
      </div>

      {/* Pending tab */}
      {tab === "pending" && (
        <div>
          {pending.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">✓</div>
              <p className="font-sans text-on-surface-variant">
                No pending listings — all clear.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl shadow-card bg-surface-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                      Listing
                    </th>
                    <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                      Type
                    </th>
                    <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                      Location
                    </th>
                    <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                      Submitted
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pending.map((listing) => {
                    const isExpanded = expandedId === listing.id;
                    const feedback = storyFeedback[listing.id];
                    return (
                      <Fragment key={listing.id}>
                        <tr className="hover:bg-surface-low transition-colors">
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                              className="flex items-center gap-1.5 font-sans font-semibold text-sm text-on-surface hover:text-accent-text transition-colors text-left"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-accent-text" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-on-surface-variant" />
                              )}
                              {listing.name}
                            </button>
                            <p className="font-sans text-xs text-on-surface-variant mt-0.5 pl-5">
                              {listing.slug}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-sans text-sm text-on-surface capitalize">
                              {listing.type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-sans text-sm text-on-surface-variant">
                              {[listing.city, listing.country].filter(Boolean).join(", ") || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-sans text-xs text-on-surface-variant">
                              {new Date(listing.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approve(listing.id)}
                                disabled={busy === listing.id}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[2px] font-sans text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                              >
                                {busy === listing.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                Approve
                              </button>
                              <button
                                onClick={() => reject(listing.id)}
                                disabled={busy === listing.id}
                                className="px-4 py-1.5 rounded-[2px] font-sans text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                {busy === listing.id ? "..." : "Reject"}
                              </button>
                              <button
                                onClick={() => removeListing(listing.id, listing.name)}
                                disabled={busy === listing.id + "-delete"}
                                className="px-4 py-1.5 rounded-[2px] font-sans text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {busy === listing.id + "-delete" ? "..." : "Delete"}
                              </button>
                            </div>
                            {feedback && (
                              <p className="font-sans text-[11px] text-on-surface-variant mt-2 max-w-[220px] leading-snug">
                                {feedback}
                              </p>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-surface-low">
                            <td colSpan={5} className="p-0 border-t border-outline-variant/20">
                              <FounderStoryDetail listing={listing} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All listings tab */}
      {tab === "all" && (
        <div className="overflow-x-auto rounded-2xl shadow-card bg-surface-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Listing
                </th>
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Type
                </th>
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Status
                </th>
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Plan
                </th>
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Flags
                </th>
                <th className="text-left font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                  Spotlight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {all.map((listing) => (
                <tr key={listing.id} className="hover:bg-surface-low transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-sans font-semibold text-sm text-on-surface">
                      {listing.name}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                      {[listing.city, listing.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-sans text-sm text-on-surface capitalize">
                      {listing.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        listing.status === "approved"
                          ? "approved"
                          : listing.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={listing.plan === "pro" ? "pro" : "free"}>
                      {listing.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(listing.id, listing.is_featured)}
                        disabled={busy === listing.id + "-featured"}
                        className={`px-3 py-1 rounded-[2px] font-sans text-xs font-semibold transition-colors disabled:opacity-50 ${
                          listing.is_featured
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
                        }`}
                      >
                        {listing.is_featured ? "★ Featured" : "Feature"}
                      </button>
                      <button
                        onClick={() => toggleVerified(listing.id, listing.is_verified)}
                        disabled={busy === listing.id + "-verified"}
                        className={`px-3 py-1 rounded-[2px] font-sans text-xs font-semibold transition-colors disabled:opacity-50 ${
                          listing.is_verified
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
                        }`}
                      >
                        {listing.is_verified ? "✓ Verified" : "Verify"}
                      </button>
                      <button
                        onClick={() => removeListing(listing.id, listing.name)}
                        disabled={busy === listing.id + "-delete"}
                        className="px-3 py-1 rounded-[2px] font-sans text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {busy === listing.id + "-delete" ? "..." : "🗑 Delete"}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <SpotlightCell
                      listing={listing}
                      busy={busy === listing.id + "-story"}
                      feedback={storyFeedback[listing.id]}
                      onGenerate={() => generateSpotlight(listing.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
