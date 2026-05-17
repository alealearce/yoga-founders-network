"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

type FormState = "idle" | "loading" | "error" | "success";

export default function SignupPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [status,   setStatus]   = useState<FormState>("idle");
  const [message,  setMessage]  = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords don't match.");
      return;
    }

    setStatus("loading");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setStatus("success");
    setMessage("Check your email to confirm your account.");
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🪷</div>
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            Create your account
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Sign up to list and manage your space
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-card rounded-2xl shadow-card p-8 space-y-5">

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                Confirm password
              </label>
              <input
                type={showPw ? "text" : "password"}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Error / Success */}
            {status === "error" && (
              <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                {message}
              </p>
            )}
            {status === "success" && (
              <p className="font-sans text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full py-3.5 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#111111" }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-on-surface-variant mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
