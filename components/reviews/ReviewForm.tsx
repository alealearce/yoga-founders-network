"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface ReviewFormProps {
  listingId: string;
  listingName: string;
}

export default function ReviewForm({ listingId, listingName }: ReviewFormProps) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [name,      setName]      = useState("");
  const [body,      setBody]      = useState("");
  const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message,   setMessage]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setStatus("error"); setMessage("Please select a star rating."); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ listing_id: listingId, user_name: name, rating, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setRating(0); setName(""); setBody("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl p-8 border border-outline-variant/20">
      {/* CTA header */}
      <div className="mb-6">
        <p className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">
          Leave a Review
        </p>
        <h2 className="font-serif text-xl font-bold text-on-surface mb-1">
          Do you know {listingName}?
        </h2>
        <p className="font-sans text-sm text-on-surface-variant">
          Tell us what you think — your review helps others in the community find the right practice.
        </p>
      </div>

      {status === "success" ? (
        <div className="py-6 text-center">
          <div className="text-3xl mb-3">🙏</div>
          <p className="font-serif text-lg font-bold text-on-surface mb-1">Thank you!</p>
          <p className="font-sans text-sm text-on-surface-variant">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div>
            <label className="block font-sans text-sm font-semibold text-on-surface mb-3">
              Your Rating <span className="text-primary">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 transition-transform duration-150 hover:scale-110"
                >
                  <Star
                    size={28}
                    className={
                      star <= (hovered || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-outline-variant"
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center font-sans text-sm text-on-surface-variant">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
              Your Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane D."
              className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Review body */}
          <div>
            <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
              Your Review <span className="text-primary">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your experience — what did you love? What would you tell a friend?"
              className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {status === "error" && (
            <p className="font-sans text-sm text-red-500">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 rounded-full font-sans text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50"
            style={{ background: "#111111" }}
          >
            {status === "loading" ? "Submitting…" : "Submit Review"}
          </button>

          <p className="font-sans text-xs text-on-surface-variant/60 text-center">
            Reviews are moderated before appearing publicly.
          </p>
        </form>
      )}
    </div>
  );
}
