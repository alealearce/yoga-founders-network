"use client";

import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { FOUNDER_QUESTIONS } from "@/lib/config/site";
import { compressImage } from "@/lib/utils/compressImage";

const MAX_IMAGES = 6;
const STORY_ANSWER_MAX = 600;

type FormState = "idle" | "loading" | "success" | "error";

export default function GetFeaturedForm({
  token,
  existingImages,
  existingStory,
}: {
  token: string;
  existingImages: string[];
  existingStory: Record<string, string>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(existingStory);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + newImages.length;
  const answeredCount = FOUNDER_QUESTIONS.filter(
    q => (answers[q.key] ?? "").trim().length > 0
  ).length;

  const handlePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");
    const room = MAX_IMAGES - totalImages;
    const batch = Array.from(files).slice(0, room);
    if (batch.length === 0) {
      setUploadError(`You can have up to ${MAX_IMAGES} photos in total.`);
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
        setNewImages(imgs => [...imgs, data.url]);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeNewPhoto = (url: string) => {
    setNewImages(imgs => imgs.filter(u => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < 3) {
      setStatus("error");
      setMessage("Please answer at least 3 of the 5 questions — your spotlight is built from your own words.");
      return;
    }
    if (totalImages < 1) {
      setStatus("error");
      setMessage("Please add at least one photo — every spotlight needs a face or a space.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/get-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, founder_story: answers, new_images: newImages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-surface-card rounded-2xl p-12 text-center">
        <h2 className="font-serif text-2xl text-on-surface mb-3">
          Thank you — your spotlight is on its way.
        </h2>
        <p className="font-sans text-base text-on-surface-variant leading-relaxed max-w-md mx-auto">
          We&apos;re shaping your answers into your Member Spotlight now.
          We&apos;ll email you the link the moment it&apos;s live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-surface-card rounded-2xl p-8 space-y-6">
        {FOUNDER_QUESTIONS.map(q => (
          <div key={q.key}>
            <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
              {q.label}
            </label>
            <textarea
              rows={3}
              maxLength={STORY_ANSWER_MAX}
              value={answers[q.key] ?? ""}
              onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
              placeholder="Answer in your own words..."
              className="w-full px-4 py-3 rounded-xl bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <p className="font-sans text-xs text-on-surface-variant/60 mt-1 text-right">
              {(answers[q.key]?.length ?? 0)}/{STORY_ANSWER_MAX}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface-card rounded-2xl p-8">
        <h2 className="font-serif text-xl text-on-surface mb-2">Photos</h2>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          {existingImages.length > 0
            ? "These photos are already on your listing and will be used in your feature. Add more if you like — a portrait of you works beautifully. The first photo you add will lead your feature."
            : "Add at least one photo of you and your space — a portrait works beautifully as the first one. The first photo you add will lead your feature."}
        </p>

        <div className="grid grid-cols-3 gap-3">
          {existingImages.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-[2px] overflow-hidden border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Listing photo ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-[2px] bg-surface-card/90 text-on-surface-variant font-sans text-[9px] font-extrabold tracking-[0.1em] uppercase">
                On your listing
              </span>
            </div>
          ))}

          {newImages.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-[2px] overflow-hidden border border-outline-variant group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`New photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewPhoto(url)}
                aria-label={`Remove new photo ${i + 1}`}
                className="absolute top-1 right-1 p-1 rounded-full bg-primary/80 text-white hover:bg-primary transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {totalImages < MAX_IMAGES && (
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

      {status === "error" && message && (
        <p className="font-sans text-sm text-red-700 text-center">{message}</p>
      )}

      <div className="text-center">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-[2px] bg-primary font-sans text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit My Spotlight"
          )}
        </button>
        <p className="font-sans text-xs text-on-surface-variant/60 mt-3">
          Answer at least 3 of the 5 questions. We&apos;ll shape your words into your feature.
        </p>
      </div>
    </form>
  );
}
