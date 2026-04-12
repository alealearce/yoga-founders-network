"use client";

import { useState } from "react";
import Link from "next/link";

type Tone = "friendly" | "professional" | "spiritual" | "fun";

interface FormData {
  studioName: string;
  studentName: string;
  offerDetails: string;
  offerExpiry: number;
  tone: Tone;
  uniqueQuality: string;
}

interface GeneratedEmail {
  number: number;
  day: number;
  title: string;
  goal: string;
  subjectLines: string[];
  previewText: string;
  body: string;
  ctaText: string;
  bestSendTime: string;
}

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "spiritual", label: "Spiritual" },
  { value: "fun", label: "Fun" },
];

const GREETING: Record<Tone, (name: string) => string> = {
  friendly: (name) => `Hey ${name}`,
  professional: (name) => `Hello ${name}`,
  spiritual: (name) => `Namaste ${name}`,
  fun: (name) => `Hey friend ${name}`,
};

const SIGNOFF: Record<Tone, string> = {
  friendly: "With love",
  professional: "Best regards",
  spiritual: "In light and gratitude",
  fun: "Sending good vibes",
};

function generateEmails(form: FormData): GeneratedEmail[] {
  const { studioName, studentName, offerDetails, offerExpiry, tone, uniqueQuality } = form;
  const greeting = GREETING[tone](studentName);
  const signoff = SIGNOFF[tone];
  const studio = studioName || "our studio";
  const quality = uniqueQuality || "our welcoming community";
  const offer = offerDetails || "a special welcome-back offer";
  const expiry = offerExpiry || 14;

  return [
    {
      number: 1,
      day: 1,
      title: "We've been thinking about you",
      goal: "Gentle reconnect — no pitch, just warmth and a human touch.",
      subjectLines: [
        `We've been thinking about you, ${studentName}`,
        `It's been a while — how are you doing?`,
        `${studio} misses you, ${studentName}`,
      ],
      previewText: `Just checking in — no agenda, we just wanted to say hi.`,
      body: `${greeting},\n\nWe noticed it's been a little while since we've seen you at ${studio}, and honestly — we've been thinking about you.\n\nNo agenda here. No big ask. We just wanted to reach out and say that your presence in our community has always meant something, and we hope life is treating you well.\n\nYoga will always be here for you when you're ready — and so will we.\n\nTake care of yourself,\n${signoff},\nThe ${studio} Team`,
      ctaText: "Visit Our Website",
      bestSendTime: "Tuesday or Thursday, 9–11am",
    },
    {
      number: 2,
      day: 2,
      title: "How are you doing?",
      goal: "Check in with genuine care and remind them of what makes your studio special.",
      subjectLines: [
        `A quick check-in from ${studio}`,
        `We thought you might like to know...`,
        `What we've been up to at ${studio}`,
      ],
      previewText: `Here's what's been happening — and why we think you'd love it.`,
      body: `${greeting},\n\nWe're always grateful for the people who've walked through our doors, and we think about our community often.\n\nWe wanted to share a little of what's been happening at ${studio} lately — and why we think you'd love being part of it again.\n\nWhat makes us a little different? ${quality}. It's something we're genuinely proud of and something we hear students mention time and again.\n\nLife gets busy. We get it. But when you're ready to return to your practice, we'll be right here.\n\n${signoff},\nThe ${studio} Team`,
      ctaText: "See What's On",
      bestSendTime: "Wednesday or Friday, 8–10am",
    },
    {
      number: 3,
      day: 3,
      title: "Your mat misses you",
      goal: "Emotional connection to the physical and mental benefits of their yoga practice.",
      subjectLines: [
        `Your mat is waiting, ${studentName}`,
        `Remember how good this felt?`,
        `The benefits you've been missing`,
      ],
      previewText: `That post-class feeling? It never gets old. Here's a reminder.`,
      body: `${greeting},\n\nDo you remember that feeling after a really good class? The quiet mind. The loose shoulders. That sense of calm that carries you through the rest of the day.\n\nYour body holds the memory of how good consistent practice feels — and it's ready to feel that way again.\n\nWhether it's stress, sleep, strength, or simply a moment of stillness — yoga has a way of giving you exactly what you need, when you need it.\n\nWe'd love to help you find that feeling again. No pressure. Just an open door.\n\n${signoff},\nThe ${studio} Team`,
      ctaText: "Book a Class",
      bestSendTime: "Monday or Sunday, 7–9am",
    },
    {
      number: 4,
      day: 5,
      title: "A special welcome back offer just for you",
      goal: "Introduce the offer clearly and make it feel exclusive and personal.",
      subjectLines: [
        `We have something for you, ${studentName}`,
        `Your welcome-back gift from ${studio}`,
        `A little something to make it easier to return`,
      ],
      previewText: `Because you're part of our community — here's something just for you.`,
      body: `${greeting},\n\nWe've been reaching out because we genuinely miss having you in class — and we want to make it as easy as possible for you to come back.\n\nSo we've put together something just for returning students like you:\n\n${offer}\n\nThis offer is our way of saying: no awkward re-entry, no catching up required. Just show up, unroll your mat, and remember why you fell in love with yoga in the first place.\n\nThis offer is available for the next ${expiry} days — just for you.\n\n${signoff},\nThe ${studio} Team`,
      ctaText: "Claim Your Offer",
      bestSendTime: "Tuesday or Thursday, 10am–12pm",
    },
    {
      number: 5,
      day: 6,
      title: "Let's remove the barriers",
      goal: "Address common objections — time, cost, intimidation, fitness level — with empathy.",
      subjectLines: [
        `"I've been meaning to get back..." — we hear you`,
        `Whatever's been holding you back, let's talk`,
        `The honest reason most people don't return (and how to fix it)`,
      ],
      previewText: `We know returning after a break can feel intimidating. Here's the truth.`,
      body: `${greeting},\n\nWe know that sometimes the hardest part isn't the yoga itself — it's just walking back through the door after a break.\n\nMaybe it's been a while and you're worried you've "lost it." (You haven't.)\nMaybe life has been full and you can't commit to a schedule. (You don't have to.)\nMaybe the cost feels like a stretch right now. (That's what the welcome-back offer is for.)\nOr maybe it just feels a bit daunting to start again. (Completely normal.)\n\nHere's the truth: every single person in our classes has taken a break at some point. There is no judgment here. Only ${quality} and a community that genuinely welcomes you back.\n\nOur offer — ${offer} — is still waiting for you. It's valid for ${expiry} days from when we first sent it.\n\n${signoff},\nThe ${studio} Team`,
      ctaText: "See Class Schedule",
      bestSendTime: "Wednesday, 12–2pm",
    },
    {
      number: 6,
      day: 7,
      title: "Your offer expires soon",
      goal: "Create urgency — remind them the offer is expiring and make the CTA unmistakable.",
      subjectLines: [
        `${studentName}, your offer expires in 48 hours`,
        `Last chance to claim your welcome-back gift`,
        `Don't let this one slip away`,
      ],
      previewText: `This is your nudge — the offer disappears soon.`,
      body: `${greeting},\n\nJust a quick heads-up — the special welcome-back offer we shared with you is expiring very soon.\n\n${offer}\n\nThis is just for you, and it won't be around much longer. We'd love to see you back on the mat before it's gone.\n\nOne click. One class. That's all it takes to remember why you started.\n\nWe hope to see you soon,\n${signoff},\nThe ${studio} Team`,
      ctaText: "Claim Before It Expires",
      bestSendTime: "Thursday or Friday, 9–11am",
    },
    {
      number: 7,
      day: 10,
      title: "The farewell email",
      goal: "Final email in the sequence — gracefully close the campaign, leave on a warm note, no pressure.",
      subjectLines: [
        `This is our last email, ${studentName}`,
        `Signing off — but the door's always open`,
        `No more emails from us — take care`,
      ],
      previewText: `We're removing you from this series. You'll always have a place here.`,
      body: `${greeting},\n\nThis is the last email in this series — we won't keep filling your inbox.\n\nWe tried to share some warmth, offer something useful, and let you know that ${studio} thinks of you as more than just a student — you're part of our story.\n\nIf the timing hasn't been right, that's okay. Life is full and sometimes yoga takes a back seat. We completely understand.\n\nBut whenever you're ready — whether it's next week or next year — our doors are open and there will always be a mat for you.\n\nWith deep gratitude for the time you spent with us,\n${signoff},\nThe ${studio} Team\n\nP.S. If you'd prefer not to hear from us again, just reply to this email and we'll make sure to respect that.`,
      ctaText: "Come Back Anytime",
      bestSendTime: "Monday or Tuesday, 8–10am",
    },
  ];
}

export default function EmailGeneratorPage() {
  const [formData, setFormData] = useState<FormData>({
    studioName: "",
    studentName: "",
    offerDetails: "",
    offerExpiry: 14,
    tone: "friendly",
    uniqueQuality: "",
  });

  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeEmail, setActiveEmail] = useState<number>(-1);
  const [copied, setCopied] = useState<{ emailIndex: number; field: string } | null>(null);

  const handleGenerate = () => {
    const emails = generateEmails(formData);
    setGeneratedEmails(emails);
    setShowResults(true);
    setActiveEmail(0);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const copyToClipboard = async (text: string, emailIndex: number, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ emailIndex, field });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const isCopied = (emailIndex: number, field: string) =>
    copied?.emailIndex === emailIndex && copied?.field === field;

  const handlePrint = () => {
    if (!generatedEmails.length) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Re-Engagement Email Sequence — ${formData.studioName}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1c19; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { color: #43483e; font-size: 14px; margin-bottom: 32px; }
    .email-card { border: 1px solid #c5c8bd; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .day-badge { display: inline-block; background: #dde5d4; color: #536046; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 0 0 6px; }
    .goal { color: #43483e; font-size: 13px; margin-bottom: 16px; }
    .section-label { font-family: sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #536046; margin: 12px 0 4px; }
    .subject { background: #f4f4ef; border-radius: 6px; padding: 8px 12px; font-size: 14px; margin-bottom: 4px; }
    .body-text { white-space: pre-wrap; font-size: 14px; line-height: 1.7; background: #f4f4ef; border-radius: 8px; padding: 16px; }
    .cta { display: inline-block; background: #536046; color: white; padding: 10px 20px; border-radius: 999px; font-size: 13px; font-family: sans-serif; margin-top: 12px; }
    @media print { .email-card { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Re-Engagement Email Sequence</h1>
  <p class="meta">Studio: ${formData.studioName} &bull; Tone: ${formData.tone} &bull; Offer: ${formData.offerDetails} (${formData.offerExpiry} days)</p>
  ${generatedEmails.map((e) => `
  <div class="email-card">
    <span class="day-badge">Day ${e.day}</span>
    <h2>Email ${e.number}: ${e.title}</h2>
    <p class="goal">${e.goal}</p>
    <div class="section-label">Subject Lines</div>
    ${e.subjectLines.map((s) => `<div class="subject">${s}</div>`).join("")}
    <div class="section-label">Preview Text</div>
    <div class="subject">${e.previewText}</div>
    <div class="section-label">Email Body</div>
    <div class="body-text">${e.body}</div>
    <div class="section-label">CTA &amp; Timing</div>
    <span class="cta">${e.ctaText}</span>
    <p style="font-size:13px; color:#43483e; margin-top:8px;">Best send time: ${e.bestSendTime}</p>
  </div>
  `).join("")}
</body>
</html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const isFormValid = formData.studioName.trim() && formData.studentName.trim();

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      {/* Hero */}
      <section className="pt-32 pb-12 bg-[#fafaf5]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
          >
            <span>←</span>
            <span>Back to Resources</span>
          </Link>
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Studio Owners · Free Tool
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            Re-Engagement Email<br />Sequence Generator
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Generate a complete 7-email sequence to win back dormant students — tailored to your studio's voice, tone, and welcome-back offer.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">

          {/* Studio Details */}
          <div className="bg-surface-card rounded-2xl p-8 mb-6 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Studio Details</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">Tell us about your studio and the student you're reaching out to.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Studio Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Lotus Studio"
                  value={formData.studioName}
                  onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Student First Name Placeholder <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <p className="font-sans text-xs text-on-surface-variant/60 mt-1.5">Used in email greetings — replace with your merge tag in your email tool</p>
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Unique Studio Quality
                </label>
                <input
                  type="text"
                  placeholder="e.g. our heated room and community"
                  value={formData.uniqueQuality}
                  onChange={(e) => setFormData({ ...formData, uniqueQuality: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="bg-surface-card rounded-2xl p-8 mb-6 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Welcome-Back Offer</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">What are you offering students to come back?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Offer Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% off first month back"
                  value={formData.offerDetails}
                  onChange={(e) => setFormData({ ...formData, offerDetails: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Offer Expiry (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={formData.offerExpiry}
                  onChange={(e) => setFormData({ ...formData, offerExpiry: parseInt(e.target.value) || 14 })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tone */}
          <div className="bg-surface-card rounded-2xl p-8 mb-8 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Email Tone</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">Choose the voice that best fits your studio's brand.</p>
            <div className="flex flex-wrap gap-3">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, tone: opt.value })}
                  className={`font-sans text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 ${
                    formData.tone === opt.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-secondary-container/30 rounded-xl">
              <p className="font-sans text-xs text-on-surface-variant">
                <span className="font-semibold text-primary">Greeting preview:</span>{" "}
                &quot;{GREETING[formData.tone](formData.studentName || "Sarah")}&quot; &nbsp;·&nbsp;{" "}
                <span className="font-semibold text-primary">Sign-off:</span>{" "}
                &quot;{SIGNOFF[formData.tone]}&quot;
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!isFormValid}
            className="w-full py-4 rounded-full font-sans font-semibold text-white text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
          >
            Generate My 7-Email Sequence
          </button>
          {!isFormValid && (
            <p className="font-sans text-xs text-on-surface-variant/60 text-center mt-3">
              Please fill in Studio Name and Student Name to generate.
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      {showResults && generatedEmails.length > 0 && (
        <section id="results-section" className="pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl text-on-surface">Your 7-Email Sequence</h2>
                <p className="font-sans text-sm text-on-surface-variant mt-1">
                  Click any email to expand it. Copy subject lines and body with one click.
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 font-sans text-sm font-semibold text-primary border border-primary/30 bg-secondary-container/30 hover:bg-secondary-container/60 px-4 py-2.5 rounded-full transition-colors"
              >
                Print / Export
              </button>
            </div>

            {/* Email Accordion Cards */}
            <div className="space-y-3">
              {generatedEmails.map((email, idx) => {
                const isOpen = activeEmail === idx;
                return (
                  <div
                    key={idx}
                    className="bg-surface-card rounded-2xl overflow-hidden border border-outline-variant/10 shadow-card"
                  >
                    {/* Card Header */}
                    <button
                      onClick={() => setActiveEmail(isOpen ? -1 : idx)}
                      className="w-full flex items-center gap-4 p-6 text-left hover:bg-surface-low/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary-container flex flex-col items-center justify-center">
                        <span className="font-sans text-xs font-bold text-primary/70 uppercase leading-none">Day</span>
                        <span className="font-serif text-xl font-bold text-primary leading-tight">{email.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-sans text-xs font-bold text-on-surface-variant/50 uppercase tracking-wider">
                            Email {email.number}
                          </span>
                        </div>
                        <p className="font-serif text-base font-bold text-on-surface truncate">{email.title}</p>
                        <p className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">{email.goal}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-on-surface-variant transition-transform duration-200 block ${isOpen ? "rotate-180" : ""}`}>
                          ▾
                        </span>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-outline-variant/10 pt-5">
                        <p className="font-sans text-sm text-on-surface-variant mb-5 italic">{email.goal}</p>

                        {/* Subject Lines */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest">
                              Subject Lines (pick one)
                            </p>
                            <button
                              onClick={() => copyToClipboard(email.subjectLines.join("\n"), idx, "subjects")}
                              className="font-sans text-xs text-on-surface-variant/60 hover:text-primary transition-colors"
                            >
                              {isCopied(idx, "subjects") ? "✓ Copied!" : "Copy all"}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {email.subjectLines.map((subj, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between bg-secondary-container/30 rounded-xl px-4 py-3 group"
                              >
                                <span className="font-sans text-sm text-on-surface">{subj}</span>
                                <button
                                  onClick={() => copyToClipboard(subj, idx, `subj-${sIdx}`)}
                                  className="flex-shrink-0 ml-3 font-sans text-xs text-on-surface-variant/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  {isCopied(idx, `subj-${sIdx}`) ? "✓" : "Copy"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Preview Text */}
                        <div className="mb-5">
                          <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-2">
                            Preview Text
                          </p>
                          <div className="flex items-center justify-between bg-secondary-container/30 rounded-xl px-4 py-3 group">
                            <span className="font-sans text-sm text-on-surface-variant italic">{email.previewText}</span>
                            <button
                              onClick={() => copyToClipboard(email.previewText, idx, "preview")}
                              className="flex-shrink-0 ml-3 font-sans text-xs text-on-surface-variant/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {isCopied(idx, "preview") ? "✓" : "Copy"}
                            </button>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest">
                              Email Body
                            </p>
                            <button
                              onClick={() => copyToClipboard(email.body, idx, "body")}
                              className="font-sans text-xs font-semibold text-primary/70 hover:text-primary transition-colors bg-secondary-container/50 hover:bg-secondary-container px-3 py-1 rounded-full"
                            >
                              {isCopied(idx, "body") ? "✓ Copied!" : "Copy Body"}
                            </button>
                          </div>
                          <div className="bg-surface-low rounded-xl p-5 font-sans text-sm text-on-surface leading-relaxed whitespace-pre-wrap border border-outline-variant/10">
                            {email.body}
                          </div>
                        </div>

                        {/* CTA + Timing */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-1">
                              CTA Button Text
                            </p>
                            <span className="inline-block font-sans text-sm font-semibold text-white px-5 py-2 rounded-full" style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}>
                              {email.ctaText}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-1">
                              Best Send Time
                            </p>
                            <p className="font-sans text-sm text-on-surface-variant">{email.bestSendTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pro Tips Footer */}
            <div className="mt-8 bg-secondary-container/30 rounded-2xl p-6 border border-secondary-container">
              <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-3">
                Pro Tips for This Sequence
              </p>
              <ul className="space-y-2">
                {[
                  "Add your student's first name as a merge tag in your email platform (e.g. {{first_name}}) to replace the placeholder.",
                  "Space Day 1–3 emails at 24-hour intervals, then Day 5, 6, 7, 10 as shown.",
                  "Track open rates per email — Days 1 and 4 typically have the highest open rates.",
                  "A/B test subject lines by sending version A to 50% and version B to 50% of your list.",
                  "Segment out any students who re-book — don't send the urgency or breakup emails to those who converted.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 font-sans text-sm text-on-surface-variant">
                    <span className="text-primary flex-shrink-0 mt-0.5">✦</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Regenerate */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowResults(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-2"
              >
                ← Edit inputs and regenerate
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
