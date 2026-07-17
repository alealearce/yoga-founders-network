"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Share2, Sparkles } from "lucide-react";

interface Props {
  listingId: string;
  hasDraft: boolean;
  isPublished: boolean;
  liveUrl?: string;
}

type ActionResult = {
  ok: boolean;
  storyStatus?: "draft" | "published" | "skipped" | "failed" | "none";
  storyUrl?: string;
};

async function callAction(action: string, id: string): Promise<ActionResult> {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, storyStatus: data.storyStatus, storyUrl: data.storyUrl };
  } catch {
    return { ok: false };
  }
}

const BUTTON_DARK = "#231E17";

export default function SpotlightActions({ listingId, hasDraft, isPublished, liveUrl }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"generate" | "regenerate" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | undefined>(liveUrl);

  const generate = async () => {
    setBusy("generate");
    setMessage(null);
    const result = await callAction("story", listingId);
    if (result.ok && result.storyStatus === "draft") {
      router.refresh();
    } else if (result.storyStatus === "skipped") {
      setMessage(
        "Not eligible for a spotlight yet — needs at least 3 answered story questions and one photo."
      );
    } else {
      setMessage("Draft generation failed. Try again.");
    }
    setBusy(null);
  };

  const regenerate = async () => {
    if (!window.confirm("Discard this draft and write a new one?")) return;
    setBusy("regenerate");
    setMessage(null);
    const result = await callAction("story_regenerate", listingId);
    if (result.ok && result.storyStatus === "draft") {
      router.refresh();
    } else {
      setMessage("Regeneration failed. Try again.");
    }
    setBusy(null);
  };

  const publishNow = async () => {
    if (!window.confirm("Publish this spotlight and share it to social channels?")) return;
    setBusy("publish");
    setMessage(null);
    const result = await callAction("story_publish", listingId);
    if (result.ok && result.storyStatus === "published") {
      setPublishedUrl(result.storyUrl);
      setMessage("Published — the member has been emailed.");
      router.refresh();
    } else {
      setMessage("Publish failed. Try again.");
    }
    setBusy(null);
  };

  if (!hasDraft) {
    return (
      <div>
        <button
          onClick={generate}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] font-sans text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ background: BUTTON_DARK }}
        >
          {busy === "generate" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate draft
        </button>
        {busy === "generate" && (
          <p className="font-sans text-xs text-on-surface-variant mt-3">
            Writing the spotlight — this can take up to a minute.
          </p>
        )}
        {message && <p className="font-sans text-xs text-on-surface-variant mt-3">{message}</p>}
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-outline-variant/20">
      <div className="flex flex-wrap items-center gap-3">
        {!isPublished && (
          <button
            onClick={publishNow}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] font-sans text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: BUTTON_DARK }}
          >
            {busy === "publish" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            Publish &amp; Share
          </button>
        )}
        {!isPublished && (
          <button
            onClick={regenerate}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] font-sans text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-secondary-container transition-colors disabled:opacity-50"
          >
            {busy === "regenerate" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Regenerate draft
          </button>
        )}
        {isPublished && publishedUrl && (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-accent-text hover:underline"
          >
            View live post &rarr;
          </a>
        )}
      </div>
      {busy === "publish" && (
        <p className="font-sans text-xs text-on-surface-variant mt-3">
          Publishing and sharing to social channels — this can take up to a minute.
        </p>
      )}
      {message && <p className="font-sans text-xs text-on-surface-variant mt-3">{message}</p>}
    </div>
  );
}
