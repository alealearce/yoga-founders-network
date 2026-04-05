"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
      return;
    }

    setState("success");
  };

  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🪷</div>
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            Reset your password
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>

        <div className="bg-surface-card rounded-2xl shadow-card p-8">

          {state === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h2 className="font-serif text-xl text-on-surface">
                Check your email
              </h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold text-on-surface">{email}</span>.
                Check your inbox and follow the link to create a new password.
              </p>
              <Link
                href="/login"
                className="inline-block font-sans text-sm text-primary font-semibold hover:underline mt-2"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {state === "error" && (
                <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full py-3.5 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                {state === "loading" ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>

              <p className="text-center font-sans text-sm text-on-surface-variant">
                Remembered it?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
