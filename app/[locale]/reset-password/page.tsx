"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success" | "error";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setState("error");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setState("error");
      return;
    }

    setState("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
      return;
    }

    setState("success");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🪷</div>
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            Create new password
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="bg-surface-card rounded-2xl shadow-card p-8">

          {state === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h2 className="font-serif text-xl text-on-surface">
                Password updated
              </h2>
              <p className="font-sans text-sm text-on-surface-variant">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Confirm new password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
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
                    Updating...
                  </span>
                ) : (
                  "Update password"
                )}
              </button>

              <p className="text-center font-sans text-sm text-on-surface-variant">
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
