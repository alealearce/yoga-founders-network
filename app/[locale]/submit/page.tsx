"use client";

import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { LISTING_TYPES, FOUNDER_QUESTIONS } from "@/lib/config/site";
import { YOGA_CATEGORIES, SCHOOL_CERTIFICATIONS, PRODUCT_CATEGORIES, LISTING_LANGUAGES } from "@/lib/config/categories";
import YogaSilhouette from "@/components/ui/YogaSilhouette";
import CountrySelect from "@/components/ui/CountrySelect";
import { compressImage } from "@/lib/utils/compressImage";

type FormState = "idle" | "loading" | "success" | "error";

const MAX_PHOTOS = 6;
const STORY_ANSWER_MAX = 600;

const PRICE_RANGES = [
  { value: "$",   label: "$ — budget-friendly" },
  { value: "$$",  label: "$$ — mid-range" },
  { value: "$$$", label: "$$$ — premium" },
];

const INITIAL = {
  name:              "",
  type:              "",
  email:             "",
  website:           "",
  phone:             "",
  address:           "",
  city:              "",
  country:           "",
  description:       "",
  yoga_styles:       [] as string[],
  experience_levels: [] as string[],
  languages:         [] as string[],
  yoga_alliance_id:  "",
  images:            [] as string[],
  price_range:       "",
  social_instagram:  "",
  social_facebook:   "",
  social_youtube:    "",
  social_tiktok:     "",
  notes:             "",
  founder_story:     {} as Record<string, string>,
  story_opt_out:     false,
};

export default function SubmitPage() {
  const [form,    setForm]    = useState(INITIAL);
  const [status,  setStatus]  = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");
    const room = MAX_PHOTOS - form.images.length;
    const batch = Array.from(files).slice(0, room);
    if (batch.length === 0) {
      setUploadError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploading(true);
    try {
      for (let file of batch) {
        if (file.size > 3.5 * 1024 * 1024) file = await compressImage(file);
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/business/upload-photo", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error ?? "Upload failed. Please try again.");
          continue;
        }
        setForm(f => ({ ...f, images: [...f.images, data.url].slice(0, MAX_PHOTOS) }));
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (url: string) => {
    setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }));
  };

  const toggle = (style: string) => {
    setForm(f => ({
      ...f,
      yoga_styles: f.yoga_styles.includes(style)
        ? f.yoga_styles.filter(s => s !== style)
        : [...f.yoga_styles, style],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
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
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="max-w-md text-center py-20">
          <div className="flex justify-center mb-6"><YogaSilhouette pose="lotus" size={64} color="#231E17" /></div>
          <h1 className="font-serif text-display-sm text-on-surface mb-4">
            You&apos;re in the queue!
          </h1>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed mb-8">
            {message}
          </p>
          <a
            href="/"
            className="inline-flex px-6 py-3 rounded-[2px] font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#231E17" }}
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
      <section className="pt-32 pb-12 bg-bg">
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
      <section className="pb-24 bg-bg">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <h2 className="font-serif text-xl text-on-surface">
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
                    City <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Bali"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Country <span className="text-primary">*</span>
                  </label>
                  <CountrySelect
                    required
                    value={form.country}
                    onChange={country => setForm(f => ({ ...f, country }))}
                    placeholder="Select a country…"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Yoga Alliance ID <span className="text-on-surface-variant/60 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.yoga_alliance_id}
                  onChange={e => setForm(f => ({ ...f, yoga_alliance_id: e.target.value }))}
                  placeholder="RYS 200, E-RYT 500, etc."
                  className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="font-sans text-xs text-on-surface-variant/60 mt-2">
                  If you&apos;re registered with Yoga Alliance (RYS / RYT / E-RYT), include your designation — we&apos;ll add a verified badge to your listing.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <h2 className="font-serif text-xl text-on-surface">
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

            {/* Your Story */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl text-on-surface mb-2">
                  Your Story
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  Every founder who joins the network gets their story published in The Journal and featured across our channels. Answer in your own words — two or three sentences each is plenty. We&apos;ll shape it into your introduction.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.story_opt_out}
                  onChange={e => setForm(f => ({ ...f, story_opt_out: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded-[2px] border border-outline-variant accent-primary"
                />
                <span className="font-sans text-sm text-on-surface-variant">
                  Prefer not to be featured? If you&apos;d rather we simply list your business — no welcome post, no spotlight — check this box and we won&apos;t.
                </span>
              </label>

              {!form.story_opt_out && (
                <div className="space-y-6">
                  {FOUNDER_QUESTIONS.map(q => (
                    <div key={q.key}>
                      <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                        {q.label}
                      </label>
                      <textarea
                        rows={3}
                        maxLength={STORY_ANSWER_MAX}
                        value={form.founder_story[q.key] ?? ""}
                        onChange={e => setForm(f => ({ ...f, founder_story: { ...f.founder_story, [q.key]: e.target.value } }))}
                        placeholder="Answer in your own words..."
                        className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      />
                      <p className="font-sans text-xs text-on-surface-variant/60 mt-1 text-right">
                        {(form.founder_story[q.key]?.length ?? 0)}/{STORY_ANSWER_MAX}
                      </p>
                    </div>
                  ))}

                  <p className="font-sans text-sm text-on-surface-variant border-t border-outline-variant/40 pt-4">
                    Your feature will use the photos you add in the Photos section below — a portrait of you or your space works beautifully.
                  </p>
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                Photos
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-6">
                Add up to {MAX_PHOTOS} photos of your space, classes, or work — the first one becomes your cover image. Listings with photos get far more attention.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {form.images.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-[2px] overflow-hidden border border-outline-variant group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-[2px] bg-primary text-primary-on font-sans text-[9px] font-extrabold tracking-[0.1em] uppercase">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute top-1 right-1 p-1 rounded-full bg-primary/80 text-primary-on hover:bg-primary transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {form.images.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-[2px] border border-dashed border-outline-variant flex flex-col items-center justify-center gap-1.5 text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors disabled:opacity-60"
                  >
                    {uploading ? (
                      <span className="w-5 h-5 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ImagePlus size={20} />
                        <span className="font-sans text-[11px] font-semibold">Add photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={e => handlePhotos(e.target.files)}
              />

              {uploadError && (
                <p className="font-sans text-sm text-red-700 mt-4">{uploadError}</p>
              )}
              <p className="font-sans text-xs text-on-surface-variant/60 mt-4">
                JPEG, PNG, or WebP — up to 5 MB each.
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl text-on-surface mb-2">
                  Social Media
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  Where can students follow you? Paste a link or just your handle — these appear on your listing.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={form.social_instagram}
                    onChange={e => setForm(f => ({ ...f, social_instagram: e.target.value }))}
                    placeholder="@yourstudio"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={form.social_facebook}
                    onChange={e => setForm(f => ({ ...f, social_facebook: e.target.value }))}
                    placeholder="facebook.com/yourstudio"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={form.social_youtube}
                    onChange={e => setForm(f => ({ ...f, social_youtube: e.target.value }))}
                    placeholder="@yourchannel"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={form.social_tiktok}
                    onChange={e => setForm(f => ({ ...f, social_tiktok: e.target.value }))}
                    placeholder="@yourstudio"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Helpful Details */}
            <div className="bg-surface-card rounded-2xl p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl text-on-surface mb-2">
                  Helpful Details
                </h2>
                <p className="font-sans text-sm text-on-surface-variant">
                  Optional, but they help students choose — all of this shows on your listing.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 604 555 0123"
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                    Price Range
                  </label>
                  <select
                    value={form.price_range}
                    onChange={e => setForm(f => ({ ...f, price_range: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Prefer not to say</option>
                    {PRICE_RANGES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main Street, Suite 4"
                  className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="font-sans text-xs text-on-surface-variant/60 mt-2">
                  Shown on your listing so students can find you. Leave blank if you teach online or prefer not to share it.
                </p>
              </div>
            </div>

            {/* Yoga Styles */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
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
                    onClick={() => toggle(cat.label)}
                    className={`px-4 py-2 rounded-[2px] font-sans text-sm font-medium transition-all duration-300 ${
                      form.yoga_styles.includes(cat.label)
                        ? "bg-primary text-white"
                        : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                Languages
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-6">
                Which languages are classes taught in? Select all that apply — this helps international students find you.
              </p>
              <div className="flex flex-wrap gap-2">
                {LISTING_LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-[2px] font-sans text-sm font-medium transition-all duration-300 ${
                      form.languages.includes(lang)
                        ? "bg-primary text-white"
                        : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* School — Certification Hours */}
            {form.type === "school" && (
              <div className="bg-surface-card rounded-2xl p-8">
                <h2 className="font-serif text-xl text-on-surface mb-2">
                  Certification Hours
                </h2>
                <p className="font-sans text-sm text-on-surface-variant mb-6">
                  What certification levels do you offer?
                </p>
                <div className="flex flex-wrap gap-2">
                  {SCHOOL_CERTIFICATIONS.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        experience_levels: f.experience_levels.includes(cert)
                          ? f.experience_levels.filter(v => v !== cert)
                          : [...f.experience_levels, cert],
                      }))}
                      className={`px-4 py-2 rounded-[2px] font-sans text-sm font-medium transition-all duration-300 ${
                        form.experience_levels.includes(cert)
                          ? "bg-primary text-white"
                          : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product — Categories */}
            {form.type === "product" && (
              <div className="bg-surface-card rounded-2xl p-8">
                <h2 className="font-serif text-xl text-on-surface mb-2">
                  Product Category
                </h2>
                <p className="font-sans text-sm text-on-surface-variant mb-6">
                  What type of product are you listing?
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        experience_levels: f.experience_levels.includes(cat)
                          ? f.experience_levels.filter(v => v !== cat)
                          : [...f.experience_levels, cat],
                      }))}
                      className={`px-4 py-2 rounded-[2px] font-sans text-sm font-medium transition-all duration-300 ${
                        form.experience_levels.includes(cat)
                          ? "bg-primary text-white"
                          : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-4">
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
              className="w-full py-4 rounded-[2px] font-sans text-base font-semibold text-white transition-all duration-400 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#231E17" }}
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
