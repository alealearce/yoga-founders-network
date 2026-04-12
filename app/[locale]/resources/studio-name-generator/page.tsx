"use client";

import { useState } from "react";
import Link from "next/link";

const KEYWORDS = [
  "Flow", "Peace", "Power", "Soul", "Zen", "Light",
  "Lotus", "Balance", "Breath", "Bloom", "Rise", "Root",
  "Sacred", "Union", "Still", "Ember",
];

const VIBE_NAMES: Record<string, string[]> = {
  modern: ["The Movement Lab", "Shift Yoga", "Form Studio", "Elevate Practice"],
  traditional: ["The Lineage", "Root & Rise", "Classical Yoga House", "The Shala"],
  spiritual: ["Sacred Ground Yoga", "The Temple Practice", "Soul Alchemy Studio", "Inner Light Yoga"],
  wellness: ["The Wellness Atrium", "Thrive Yoga", "Whole Life Studio", "Radiant Practice"],
  athletic: ["Power Yoga Collective", "The Strong Practice", "Peak Performance Yoga", "Athlete's Asana"],
  boutique: ["The Practice Room", "Curated Yoga", "Studio Lumière", "The Intimate Studio"],
};

const SANSKRIT_NAMES = [
  "Shakti Studio", "Prana Flow", "Ananda Yoga", "Vinyasa Krama", "Satya Studio",
];

const TAGLINES: Record<string, string> = {
  "The Movement Lab": "Where practice becomes precision",
  "Shift Yoga": "Transform your practice, transform your life",
  "Form Studio": "Alignment in body and mind",
  "Elevate Practice": "Rise into your fullest potential",
  "The Lineage": "Rooted in tradition, alive in practice",
  "Root & Rise": "Ground yourself. Grow yourself.",
  "Classical Yoga House": "Preserving the ancient art of yoga",
  "The Shala": "Your home for authentic practice",
  "Sacred Ground Yoga": "Where every breath is a prayer",
  "The Temple Practice": "Honor the divine within",
  "Soul Alchemy Studio": "Transform through practice",
  "Inner Light Yoga": "Illuminate your path",
  "The Wellness Atrium": "A sanctuary for whole-life health",
  "Thrive Yoga": "Move well. Live well. Be well.",
  "Whole Life Studio": "Yoga for every part of you",
  "Radiant Practice": "Shine from the inside out",
  "Power Yoga Collective": "Strength meets community",
  "The Strong Practice": "Build strength. Build resilience.",
  "Peak Performance Yoga": "Yoga for the dedicated athlete",
  "Athlete's Asana": "Where sport meets breath",
  "The Practice Room": "An intimate space for deep work",
  "Curated Yoga": "Thoughtfully crafted for you",
  "Studio Lumière": "Light, space, and intention",
  "The Intimate Studio": "Small class. Big transformation.",
  "Shakti Studio": "Awaken your divine energy",
  "Prana Flow": "Life force in motion",
  "Ananda Yoga": "The path of bliss",
  "Vinyasa Krama": "Intelligent sequencing for evolution",
  "Satya Studio": "Truth in every posture",
};

function getTagline(name: string): string {
  if (TAGLINES[name]) return TAGLINES[name];
  if (name.toLowerCase().includes("yoga")) return "Your journey begins here";
  if (name.toLowerCase().includes("studio")) return "Space for transformation";
  return "Where practice meets possibility";
}

function getWhyItWorks(name: string, vibe: string, city: string, ownerName: string): string {
  if (ownerName && name.startsWith(ownerName.split(" ")[0])) {
    return "Personal brand names build trust and are easy to market on social media.";
  }
  if (city && (name.includes(city) || name.toLowerCase().includes(city.toLowerCase()))) {
    return "Location-based names help with local SEO and community identity.";
  }
  if (SANSKRIT_NAMES.includes(name)) {
    return "Sanskrit names carry tradition and appeal to students seeking authentic lineage.";
  }
  const vibeReasons: Record<string, string> = {
    modern: "Clean and contemporary — appeals to a design-conscious urban audience.",
    traditional: "Signals authenticity and depth to students seeking serious practice.",
    spiritual: "Invites seekers and creates a sense of sacred space before they even arrive.",
    wellness: "Broad appeal for a health-focused clientele beyond traditional yoga students.",
    athletic: "Clear positioning for performance-oriented students who want challenge.",
    boutique: "Implies exclusivity and care — justifies premium pricing.",
  };
  return vibeReasons[vibe] || "Memorable, distinctive, and easy to build a brand around.";
}

function toDomainName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
}

function toHandle(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length === 1) return "@" + words[0] + "yoga";
  if (words[0] === "the") return "@" + words.slice(1).join("");
  return "@" + words.join("");
}

interface GeneratedName {
  name: string;
  tagline: string;
  whyItWorks: string;
  domain: string;
  handle: string;
}

function generateNames(
  vibe: string,
  city: string,
  ownerName: string,
  keywords: string[],
  nameStyle: string,
  audience: string
): GeneratedName[] {
  const names: string[] = [];

  // 1. Keyword-based names (up to 6)
  const keywordTemplates = [
    (kw: string) => `${kw} Yoga`,
    (kw: string) => `The ${kw} Space`,
    (kw: string) => `${kw} Studio`,
    (kw: string) => `${kw} Collective`,
  ];
  keywords.slice(0, 3).forEach((kw, i) => {
    const t1 = keywordTemplates[i % 4](kw);
    const t2 = keywordTemplates[(i + 2) % 4](kw);
    names.push(t1, t2);
  });

  // 2. Vibe-based names (up to 4)
  const vibePool = VIBE_NAMES[vibe] || VIBE_NAMES.modern;
  vibePool.forEach((n) => {
    if (!names.includes(n)) names.push(n);
  });

  // 3. Location-based names
  if (city) {
    const cityClean = city.trim();
    [`${cityClean} Yoga Collective`, `${cityClean} Practice`, `${cityClean} Shala`].forEach((n) => {
      if (!names.includes(n)) names.push(n);
    });
  }

  // 4. Owner name-based names
  if (ownerName) {
    const first = ownerName.trim().split(" ")[0];
    [`${first} Yoga`, `${first} & Co.`, `${first}'s Studio`].forEach((n) => {
      if (!names.includes(n)) names.push(n);
    });
  }

  // 5. Sanskrit options
  SANSKRIT_NAMES.forEach((n) => {
    if (!names.includes(n)) names.push(n);
  });

  // Deduplicate and take 12
  const unique = Array.from(new Set(names)).slice(0, 12);

  return unique.map((name) => ({
    name,
    tagline: getTagline(name),
    whyItWorks: getWhyItWorks(name, vibe, city, ownerName),
    domain: toDomainName(name),
    handle: toHandle(name),
  }));
}

export default function StudioNameGeneratorPage() {
  const [vibe, setVibe] = useState("");
  const [city, setCity] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [audience, setAudience] = useState("");
  const [nameStyle, setNameStyle] = useState("");
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = vibe !== "";

  function toggleKeyword(kw: string) {
    setKeywords((prev) => {
      if (prev.includes(kw)) return prev.filter((k) => k !== kw);
      if (prev.length >= 3) return prev;
      return [...prev, kw];
    });
  }

  function toggleFavorite(name: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleGenerate() {
    if (!canGenerate) return;
    const names = generateNames(vibe, city, ownerName, keywords, nameStyle, audience);
    setGeneratedNames(names);
    setFavorites(new Set());
    setShowResults(true);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function copyFavorites() {
    const favList = Array.from(favorites).join("\n");
    if (!favList) return;
    navigator.clipboard.writeText(favList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const OptionButton = ({
    label,
    selected,
    onClick,
    disabled,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`px-4 py-2.5 rounded-full text-sm font-sans font-medium transition-colors border ${
        selected
          ? "bg-primary text-white border-primary"
          : disabled
          ? "bg-surface-low border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed"
          : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );

  const vibeOptions = [
    { label: "Modern", key: "modern" },
    { label: "Traditional", key: "traditional" },
    { label: "Spiritual", key: "spiritual" },
    { label: "Wellness", key: "wellness" },
    { label: "Athletic", key: "athletic" },
    { label: "Boutique", key: "boutique" },
  ];

  const audienceOptions = [
    { label: "Beginners", key: "beginners" },
    { label: "Athletes", key: "athletes" },
    { label: "Wellness Seekers", key: "wellness" },
    { label: "All Levels", key: "all" },
    { label: "Women-Focused", key: "women" },
    { label: "Community-First", key: "community" },
  ];

  const styleOptions = [
    { label: "Short & Punchy", key: "short" },
    { label: "Descriptive", key: "descriptive" },
    { label: "Sanskrit-Inspired", key: "sanskrit" },
    { label: "Creative/Unique", key: "creative" },
    { label: "Location-Based", key: "location" },
    { label: "Personal Brand", key: "personal" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-on-surface-variant font-sans text-sm mb-8 hover:text-primary transition-colors"
          >
            ← Back to Resources
          </Link>
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Studio Name Generator
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">
            Yoga Studio Name Generator
          </h1>
          <p className="font-sans text-on-surface-variant text-lg leading-relaxed">
            Tell us about your vision and we&apos;ll generate 12 unique studio name ideas with taglines, domain suggestions, and social handles.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {/* Vibe */}
          <div className="bg-surface-card rounded-2xl p-8">
            <h2 className="font-serif text-xl text-on-surface mb-2">
              Studio Vibe <span className="text-primary">*</span>
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              What feeling should your studio name evoke?
            </p>
            <div className="flex flex-wrap gap-3">
              {vibeOptions.map((o) => (
                <OptionButton
                  key={o.key}
                  label={o.label}
                  selected={vibe === o.key}
                  onClick={() => setVibe(o.key)}
                />
              ))}
            </div>
          </div>

          {/* Text inputs */}
          <div className="bg-surface-card rounded-2xl p-8 grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                City / Neighborhood <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Brooklyn, Downtown"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60"
              />
            </div>
            <div>
              <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                Your Name <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="For personalized name options"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-surface-card rounded-2xl p-8">
            <h2 className="font-serif text-xl text-on-surface mb-2">
              Keywords You Love
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              Select up to 3 words to inspire name ideas.{" "}
              <span className="text-primary font-medium">
                {keywords.length}/3 selected
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {KEYWORDS.map((kw) => (
                <OptionButton
                  key={kw}
                  label={kw}
                  selected={keywords.includes(kw)}
                  onClick={() => toggleKeyword(kw)}
                  disabled={keywords.length >= 3 && !keywords.includes(kw)}
                />
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="bg-surface-card rounded-2xl p-8">
            <h2 className="font-serif text-xl text-on-surface mb-2">
              Target Audience
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              Who is your ideal student?
            </p>
            <div className="flex flex-wrap gap-3">
              {audienceOptions.map((o) => (
                <OptionButton
                  key={o.key}
                  label={o.label}
                  selected={audience === o.key}
                  onClick={() => setAudience(o.key)}
                />
              ))}
            </div>
          </div>

          {/* Name Style */}
          <div className="bg-surface-card rounded-2xl p-8">
            <h2 className="font-serif text-xl text-on-surface mb-2">
              Name Style
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              What kind of name are you leaning toward?
            </p>
            <div className="flex flex-wrap gap-3">
              {styleOptions.map((o) => (
                <OptionButton
                  key={o.key}
                  label={o.label}
                  selected={nameStyle === o.key}
                  onClick={() => setNameStyle(o.key)}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full rounded-full py-4 text-white font-semibold font-sans text-base transition-opacity disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
            }}
          >
            Generate Studio Names
          </button>
        </div>
      </section>

      {/* Results */}
      {showResults && (
        <section id="results-section" className="pb-24 bg-surface-low">
          <div className="max-w-3xl mx-auto px-6 pt-16">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="font-serif text-3xl text-on-surface mb-2">
                  Your Studio Names
                </h2>
                <p className="font-sans text-on-surface-variant text-sm">
                  Star your favorites, then copy them all at once.
                </p>
              </div>
              <div className="flex gap-3">
                {favorites.size > 0 && (
                  <button
                    onClick={copyFavorites}
                    className="shrink-0 rounded-full px-5 py-2.5 font-sans text-sm font-semibold border border-primary/60 text-primary hover:bg-secondary-container/40 transition-colors"
                  >
                    {copied ? "Copied!" : `Copy Favorites (${favorites.size})`}
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  className="shrink-0 rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                  }}
                >
                  Generate More
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {generatedNames.map((item) => (
                <div key={item.name} className="bg-surface-card rounded-2xl p-6 relative group">
                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(item.name)}
                    className="absolute top-5 right-5 text-xl transition-transform hover:scale-110"
                    title="Save to favorites"
                  >
                    {favorites.has(item.name) ? "★" : "☆"}
                  </button>

                  <h3 className="font-serif text-xl font-bold text-on-surface pr-8 mb-1">
                    {item.name}
                  </h3>
                  <p className="font-sans text-xs italic text-on-surface-variant mb-4">
                    {item.tagline}
                  </p>

                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4 bg-secondary-container/30 rounded-lg p-3">
                    {item.whyItWorks}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs text-on-surface-variant/60">Domain</span>
                      <span className="font-sans text-xs font-medium text-on-surface bg-surface-low rounded-full px-2.5 py-0.5">
                        {item.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs text-on-surface-variant/60">Handle</span>
                      <span className="font-sans text-xs font-medium text-on-surface bg-surface-low rounded-full px-2.5 py-0.5">
                        {item.handle}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Naming Tips */}
            <div className="bg-surface-card rounded-2xl p-8 mb-8">
              <h3 className="font-serif text-xl text-on-surface mb-5">
                Naming Tips Before You Decide
              </h3>
              <ul className="space-y-3">
                {[
                  "Check domain availability — use Namecheap or GoDaddy to verify .com is free before committing.",
                  "Say it out loud — does it roll off the tongue naturally? Would you feel proud introducing it?",
                  "Search Instagram and Google — make sure there&apos;s no existing studio with a very similar name.",
                  "Test it on your audience — share 3 finalists with trusted friends or potential students for honest feedback.",
                  "Keep it future-proof — avoid names that limit you to one style, demographic, or location.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-sm text-on-surface-variant">
                    <span className="text-primary font-bold shrink-0 mt-0.5">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: tip }} />
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-secondary-container/40 rounded-2xl p-8 text-center">
              <h3 className="font-serif text-xl text-on-surface mb-2">
                Ready to build your studio&apos;s online presence?
              </h3>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                List your studio on Yoga Founders Network and get found by students searching in your area.
              </p>
              <Link
                href="/list-your-studio"
                className="inline-block rounded-full px-8 py-3 text-white font-semibold font-sans text-sm"
                style={{
                  background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                }}
              >
                List Your Studio
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
