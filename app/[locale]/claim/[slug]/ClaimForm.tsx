"use client";

import { useState } from "react";

interface Props {
  slug: string;
  existingYaId: string | null;
  userEmail: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function ClaimForm({ slug, existingYaId, userEmail }: Props) {
  const [yaId, setYaId] = useState(existingYaId ?? "");
  const [relationship, setRelationship] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/listings/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, yoga_alliance_id: yaId, relationship }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again later.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-surface-card rounded-2xl shadow-card p-8 text-center space-y-4">
        <div className="text-4xl">🪷</div>
        <h2 className="font-serif text-xl text-on-surface">Claim received</h2>
        <p className="font-sans text-sm text-on-surface-variant">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-surface-card rounded-2xl shadow-card p-8 space-y-5">
      <p className="font-sans text-sm text-on-surface-variant">
        Signed in as <span className="font-semibold text-on-surface">{userEmail}</span>. We&apos;ll review your claim within 2–3 business days.
      </p>

      <div>
        <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
          Yoga Alliance ID <span className="text-on-surface-variant/60 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={yaId}
          onChange={e => setYaId(e.target.value)}
          placeholder="RYS 200, E-RYT 500, etc."
          className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <p className="font-sans text-xs text-on-surface-variant/60 mt-2">
          If you provide a valid YA designation, we&apos;ll add a verified badge to the listing.
        </p>
      </div>

      <div>
        <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
          How are you connected to this listing? <span className="text-primary">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={relationship}
          onChange={e => setRelationship(e.target.value)}
          placeholder="I'm the owner / founder / lead teacher of ..."
          className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {status === "error" && (
        <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "#111111" }}
      >
        {status === "loading" ? "Submitting..." : "Submit claim"}
      </button>
    </form>
  );
}
