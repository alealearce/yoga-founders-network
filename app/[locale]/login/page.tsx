"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

type FormState = "idle" | "loading" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [status,   setStatus]   = useState<FormState>("idle");
  const [message,  setMessage]  = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🪷</div>
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            Welcome back
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Sign in to manage your listing
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-card rounded-2xl shadow-card p-8 space-y-5">

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-full font-sans text-sm font-semibold text-on-surface bg-surface-low hover:bg-secondary-container transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-sans text-xs text-on-surface-variant/60">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-sm font-semibold text-on-surface">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-sans text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
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

            {/* Error */}
            {status === "error" && (
              <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-on-surface-variant mt-6">
          Don&apos;t have a listing yet?{" "}
          <Link href="/submit" className="text-primary font-semibold hover:underline">
            Submit yours
          </Link>
        </p>
      </div>
    </div>
  );
}
