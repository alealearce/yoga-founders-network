"use client";

import { useState } from "react";
import { LISTING_TYPES } from "@/lib/config/site";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

type FormState = "idle" | "loading" | "success" | "error";

const INITIAL = {
  name:        "",
  type:        "",
  email:       "",
  website:     "",
  city:        "",
  country:     "",
  description: "",
  yoga_styles: [] as string[],
  notes:       "",
};

export default function SubmitPage() {
  const [form,    setForm]    = useState(INITIAL);
  const [status,  setStatus]  = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const toggle = (style: string) => {
    setForm(f => ({
      ...f,
      yoga_styles: f.yoga_styles.includes(style)
        ? f.yoga_styles.filter(s => s !== style)
        : [...f.yoga_styles, style],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/business/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "Thank you! We'll review your listing within 2–3 business days.");
        setForm(INITIAL);
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
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6">
        <div className="max-w-md text-center py-20">
          <div className="flex justify-center mb-6"><YogaSilhouette pose="lotus" size={64} color="#536046" /></div>
          <h1 className="font-serif text-display-sm text-on-surface mb-4">
            You&apos;re in the queue!
          </h1>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed mb-8">
            {message}
          </p>
          <a
            href="/"
            className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-[#fafaf5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Join the Directory
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            Share your practice with the world
          </h1>
          <p className="font-sans text-lg text-on-surface-variant leading-relaxed">
            List your studio, school, retreat, or practice in our global yoga directory — free to apply, reviewed by our team.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 bg-[#fafaf5]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <h2 className="font-serif text-xl font-bold text-on-surface">
                Basic Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your studio or practice name"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Type <span className="text-primary">*</span>
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a type...</option>
                    {LISTING_TYPES.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="hello@yourstudio.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://yourstudio.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Bali"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="e.g. Indonesia"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <h2 className="font-serif text-xl font-bold text-on-surface">
                Tell Us About Your Practice
              </h2>

              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Description <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your studio, teaching style, what makes you unique, who your students are..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Yoga Styles */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl font-bold text-on-surface mb-2">
                Yoga Styles
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-6">
                Select all that apply.
              </p>
              <div className="flex flex-wrap gap-2">
                {YOGA_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className={`px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300 ${
                      form.yoga_styles.includes(cat.id)
                        ? "bg-primary text-white"
                        : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
                Anything else to share?
              </h2>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any questions, special context, or notes for our team..."
                className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
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
              className="w-full py-4 rounded-full font-sans text-base font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Your Listing"
              )}
            </button>

            <p className="font-sans text-xs text-on-surface-variant/60 text-center">
              By submitting, you agree to our{" "}
              <a href="/terms" className="underline hover:text-on-surface-variant">Terms of Use</a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-on-surface-variant">Privacy Policy</a>.
              We review all listings within 2–3 business days.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
