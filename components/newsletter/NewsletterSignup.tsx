"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  variant?: "footer" | "inline" | "hero";
}

export default function NewsletterSignup({ variant = "inline" }: Props) {
  const [email,     setEmail]     = useState("");
  const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message,   setMessage]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "Thank you! Please check your inbox to confirm.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={cn(
        "rounded-2xl p-4 text-center",
        variant === "footer" ? "bg-white/10" : "bg-secondary-container"
      )}>
        <p className={cn(
          "font-sans text-sm font-medium",
          variant === "footer" ? "text-white" : "text-primary"
        )}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className={cn(
          "flex-1 px-4 py-3 rounded-full font-sans text-sm outline-none transition-all duration-300",
          "placeholder:text-on-surface-variant/50",
          variant === "footer"
            ? "bg-white/15 text-white placeholder:text-white/50 focus:bg-white/20 border border-white/20"
            : "bg-surface-input text-on-surface focus:bg-surface-card border border-outline-variant/30"
        )}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "flex items-center gap-2 px-5 py-3 rounded-full font-sans text-sm font-semibold transition-all duration-300",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          variant === "footer"
            ? "bg-white text-[#536046] hover:bg-white/90"
            : "bg-primary text-white hover:bg-primary-container"
        )}
      >
        <Send size={14} />
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
