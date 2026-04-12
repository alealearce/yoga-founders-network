"use client";

import { useState } from "react";
import Link from "next/link";

const teachers = [
  {
    name: "Ryan Leier",
    tagline: "Co-Founder - Accessible Yoga for All Walks of Life",
    bio: "Ryan's name has become synonymous with Yoga in Canada. He has humbly dedicated his life to learning, practicing, and sharing yoga with as many people as possible. He is passionate about making it accessible to people from all walks of life. Ryan is a rare gem who studies with the greatest teachers on the planet and yet can simplify his wealth of knowledge and adapt the teachings to the people he is serving.",
    qualities: ["Accessible", "Experienced", "Adaptable", "Lineage-based"],
    styles: ["classical", "all"],
    goal_keys: ["traditional", "spiritual", "holistic"],
    priority_keys: ["lineage", "community"],
  },
  {
    name: "Dani Hébert",
    tagline: "Co-Owner & Classical Yoga Therapist - Nervous System Healing",
    bio: "Specializing in classical yoga therapy from the Krishnamacharya lineage, Dani integrates time-tested yogic wisdom with science-backed therapeutic application to support nervous system health, emotional resilience, and empowered personal growth. She teaches applied classical yoga for self-mastery through therapeutic breathwork, personal practice development, and intelligent sequencing.",
    qualities: ["Therapeutic", "Science-backed", "Breathwork Expert", "Trauma-informed"],
    styles: ["therapeutic", "breathwork", "classical"],
    goal_keys: ["therapeutic", "holistic"],
    priority_keys: ["transformation", "personalized"],
  },
  {
    name: "Clara Roberts-Oss",
    tagline: "20 Years Teaching - Vinyasa with Philosophy & Heart",
    bio: "With roots in Vinyasa (Jivamukti, Prana Flow, Laughing Lotus) and studies in Iyengar, Kundalini, Restorative and Forrest yoga, Clara creates holistic vinyasa-based classes that leave you feeling grounded and strong. A lover of philosophy who studies with tantric scholars, her intention is to nourish body, mind and spirit.",
    qualities: ["Vinyasa Flow", "Philosophy", "Holistic", "Nourishing"],
    styles: ["vinyasa", "mixed"],
    goal_keys: ["grounded", "holistic", "spiritual"],
    priority_keys: ["philosophy", "transformation"],
  },
  {
    name: "Malina Dawn",
    tagline: "Indigenous Wisdom Keeper - Ceremony, Breathwork & Healing",
    bio: "A queer métis and Cree Métis woman weaving together indigenous wisdom and yogic knowledge. Malina is a breath work therapist, drum carrier and song catcher who shares ceremony through indigenous traditional and futurism teachings. She creates healing spaces that guide people to reclaim their culture, identity, body and healing through a strength-based trauma-informed lens.",
    qualities: ["Indigenous Wisdom", "Ceremony", "Breathwork", "LGBTQ2S+ Affirming", "Trauma-informed"],
    styles: ["breathwork", "mixed", "therapeutic"],
    goal_keys: ["ceremony", "spiritual", "therapeutic"],
    priority_keys: ["community", "transformation"],
  },
  {
    name: "Peter Elmas",
    tagline: "20 Years on the Path - Krishnamacharya Lineage & Personal Practice",
    bio: "Walking the Yogi's Path for over 20 years, Peter is deeply passionate about sharing this transformative practice. His main goal is to deliver yoga teachings in a way that is personal and personalized. A student of Ram Dass and the Krishnamacharya lineage, Peter considers the practices of Yoga to be medicine.",
    qualities: ["Traditional", "Personal Approach", "Spiritual", "Medicine-based"],
    styles: ["classical", "mixed"],
    goal_keys: ["traditional", "spiritual", "holistic"],
    priority_keys: ["lineage", "personalized"],
  },
  {
    name: "Mara Branscombe",
    tagline: "Author, Ceremonialist & Mindfulness Leader - Ritual as Remedy",
    bio: 'Mother, writer, yogi, teacher, and spiritual coach dedicated to amplifying wellness and creativity. Author of "Ritual As Remedy" and "Sage, Huntress, Lover, Queen," Mara teaches internationally and is passionate about weaving mindfulness, self-care, creativity, and earth-based rituals into life and practice. Leading community ceremony since 2000.',
    qualities: ["Ritual", "Ceremony", "Mindfulness", "Creative", "Author"],
    styles: ["mixed", "breathwork"],
    goal_keys: ["ceremony", "spiritual", "holistic"],
    priority_keys: ["community", "philosophy"],
  },
  {
    name: "Kevin Yee-Chan",
    tagline: "Shadow Yoga, Qigong & Queer Joy - Integrative Healing",
    bio: "Kevin's practice is shaped through Shadow Yoga, qigong, Classical Chinese medicine, Taoism, and Tibetan/Non-Dual Tantric Shaivist viewpoints infused with queer joy. Equal parts traditionalist, anarchist, and creator, Kevin loves translating ancestral practices into present accessibility, integrating interdisciplinary healing approaches.",
    qualities: ["Shadow Yoga", "Qigong", "LGBTQ+ Affirming", "Acupuncture", "Integrative"],
    styles: ["classical", "mixed", "therapeutic"],
    goal_keys: ["traditional", "holistic", "grounded"],
    priority_keys: ["community", "transformation", "lineage"],
  },
  {
    name: "Brad Cierpicki",
    tagline: "Ashtanga Practitioner - 25 Years of Daily Practice",
    bio: "With 25 years of practice from Bryan Kest VHS tapes to Mysore, South India, Brad has learned that we must begin again every single day. His journey through skateboarding and music led to yoga, which not only complemented finding his way but seemed to define it. Inspired by the Jois tradition and dedicated to authentic practice.",
    qualities: ["Ashtanga", "Mysore-trained", "Daily Practice", "Authentic"],
    styles: ["classical", "vinyasa"],
    goal_keys: ["traditional", "grounded"],
    priority_keys: ["lineage", "transformation"],
  },
];

const goalOptions = [
  { label: "Spiritual Connection", key: "spiritual" },
  { label: "Healing & Therapeutic", key: "therapeutic" },
  { label: "Traditional Practice", key: "traditional" },
  { label: "Grounded & Strong", key: "grounded" },
  { label: "Ceremony & Ritual", key: "ceremony" },
  { label: "Holistic Balance", key: "holistic" },
];

const styleOptions = [
  { label: "Vinyasa Flow", key: "vinyasa" },
  { label: "Therapeutic & Adaptive", key: "therapeutic" },
  { label: "Breathwork-Focused", key: "breathwork" },
  { label: "Mixed Styles", key: "mixed" },
  { label: "Classical/Traditional", key: "classical" },
];

const levelOptions = [
  { label: "Complete Beginner", key: "beginner" },
  { label: "Some Experience", key: "some" },
  { label: "Intermediate", key: "intermediate" },
  { label: "Advanced Student", key: "advanced" },
];

const priorityOptions = [
  { label: "Philosophy & Wisdom", key: "philosophy" },
  { label: "Authentic Lineage", key: "lineage" },
  { label: "Personalized Approach", key: "personalized" },
  { label: "Community & Belonging", key: "community" },
  { label: "Deep Transformation", key: "transformation" },
];

interface TeacherResult {
  teacher: typeof teachers[0];
  score: number;
  reasons: string[];
}

function scoreTeachers(
  goal: string,
  style: string,
  level: string,
  priority: string
): TeacherResult[] {
  const goalLabels: Record<string, string> = {
    spiritual: "spiritual connection",
    therapeutic: "healing & therapeutic",
    traditional: "traditional practice",
    grounded: "grounded & strong",
    ceremony: "ceremony & ritual",
    holistic: "holistic balance",
  };
  const styleLabels: Record<string, string> = {
    vinyasa: "Vinyasa Flow",
    therapeutic: "Therapeutic & Adaptive",
    breathwork: "Breathwork-Focused",
    mixed: "Mixed Styles",
    classical: "Classical/Traditional",
  };
  const priorityLabels: Record<string, string> = {
    philosophy: "Philosophy & Wisdom",
    lineage: "Authentic Lineage",
    personalized: "Personalized Approach",
    community: "Community & Belonging",
    transformation: "Deep Transformation",
  };

  const results: TeacherResult[] = teachers.map((t) => {
    let score = 1;
    const reasons: string[] = [];

    // Goal match
    if (goal && t.goal_keys.includes(goal)) {
      score += 3;
      reasons.push(`Their teaching aligns with your ${goalLabels[goal] || goal} goals`);
    }

    // Style match
    if (style && (t.styles.includes(style) || t.styles.includes("mixed") || t.styles.includes("all"))) {
      score += 2;
      reasons.push(`They teach ${styleLabels[style] || style}`);
    }

    // Priority match
    if (priority && t.priority_keys.includes(priority)) {
      score += 3;
      reasons.push(`They prioritize ${priorityLabels[priority] || priority}`);
    }

    // Beginner bonus
    if (
      level === "beginner" &&
      (t.qualities.some((q) => q.toLowerCase().includes("accessible")) ||
        t.styles.includes("all"))
    ) {
      score += 2;
      reasons.push("They are known for welcoming beginners");
    }

    return { teacher: t, score, reasons };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

export default function TeacherFinderPage() {
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [level, setLevel] = useState("");
  const [priority, setPriority] = useState("");
  const [results, setResults] = useState<TeacherResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const canSubmit = goal && style && level && priority;

  function handleFind() {
    if (!canSubmit) return;
    const scored = scoreTeachers(goal, style, level, priority);
    setResults(scored);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleReset() {
    setShowResults(false);
    setGoal("");
    setStyle("");
    setLevel("");
    setPriority("");
    setResults([]);
  }

  const OptionButton = ({
    label,
    selected,
    onClick,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-sans font-medium transition-colors border ${
        selected
          ? "bg-primary text-white border-primary"
          : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );

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
            Teacher Matching Tool
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">
            Find Your Perfect Yoga Teacher
          </h1>
          <p className="font-sans text-on-surface-variant text-lg leading-relaxed">
            Answer four questions and we&apos;ll match you with the One Yoga Vancouver teachers best suited to your practice goals.
          </p>
        </div>
      </section>

      {/* Form */}
      {!showResults && (
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-6 space-y-6">
            {/* Goal */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                1. What is your primary goal?
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                Choose the intention that resonates most with where you are right now.
              </p>
              <div className="flex flex-wrap gap-3">
                {goalOptions.map((o) => (
                  <OptionButton
                    key={o.key}
                    label={o.label}
                    selected={goal === o.key}
                    onClick={() => setGoal(o.key)}
                  />
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                2. Preferred teaching style
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                What kind of yoga experience are you drawn to?
              </p>
              <div className="flex flex-wrap gap-3">
                {styleOptions.map((o) => (
                  <OptionButton
                    key={o.key}
                    label={o.label}
                    selected={style === o.key}
                    onClick={() => setStyle(o.key)}
                  />
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                3. Your experience level
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                Be honest — every level is welcome.
              </p>
              <div className="flex flex-wrap gap-3">
                {levelOptions.map((o) => (
                  <OptionButton
                    key={o.key}
                    label={o.label}
                    selected={level === o.key}
                    onClick={() => setLevel(o.key)}
                  />
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h2 className="font-serif text-xl text-on-surface mb-2">
                4. What matters most to you?
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                Pick the quality you value most in a teacher.
              </p>
              <div className="flex flex-wrap gap-3">
                {priorityOptions.map((o) => (
                  <OptionButton
                    key={o.key}
                    label={o.label}
                    selected={priority === o.key}
                    onClick={() => setPriority(o.key)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleFind}
              disabled={!canSubmit}
              className="w-full rounded-full py-4 text-white font-semibold font-sans text-base transition-opacity disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
              }}
            >
              Find My Teacher Match
            </button>
          </div>
        </section>
      )}

      {/* Results */}
      {showResults && (
        <section id="results-section" className="pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-on-surface mb-2">
                Your Top Matches
              </h2>
              <p className="font-sans text-on-surface-variant">
                Based on your answers, here are the One Yoga Vancouver teachers best aligned with your journey.
              </p>
            </div>

            <div className="space-y-6 mb-10">
              {results.map(({ teacher, score, reasons }, index) => {
                const matchPct = Math.min(98, Math.round((score / 9) * 100));
                const firstName = teacher.name.split(" ")[0];
                return (
                  <div key={teacher.name} className="bg-surface-card rounded-2xl p-8 relative">
                    {/* Rank badge */}
                    {index === 0 && (
                      <div className="absolute top-6 left-8">
                        <span className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
                          Best Match
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 mt-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-on-surface">
                          {teacher.name}
                        </h3>
                        <p className="font-sans text-sm italic text-on-surface-variant mt-1">
                          {teacher.tagline}
                        </p>
                      </div>
                      <span className="shrink-0 bg-green-100 text-green-800 rounded-full px-4 py-1.5 font-bold font-sans text-sm">
                        {matchPct}% match
                      </span>
                    </div>

                    {/* Why this teacher */}
                    {reasons.length > 0 && (
                      <div className="mt-5 bg-secondary-container/40 rounded-xl p-4">
                        <p className="font-sans text-sm font-semibold text-on-surface mb-3">
                          Why {firstName} is perfect for you:
                        </p>
                        <ul className="space-y-2">
                          {reasons.map((r) => (
                            <li
                              key={r}
                              className="flex items-start gap-2 font-sans text-sm text-on-surface-variant"
                            >
                              <span className="text-primary mt-0.5">✓</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="font-sans text-sm text-on-surface-variant leading-relaxed mt-5">
                      {teacher.bio}
                    </p>

                    {/* Qualities */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {teacher.qualities.map((q) => (
                        <span
                          key={q}
                          className="bg-surface-low rounded-full px-3 py-1 font-sans text-xs text-on-surface-variant border border-outline-variant/40"
                        >
                          {q}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6">
                      <Link
                        href="/teachers"
                        className="font-sans text-sm font-semibold text-primary hover:underline"
                      >
                        View {firstName}&apos;s Profile on Yoga Founders Network →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Book CTA */}
            <div className="bg-surface-card rounded-2xl p-8 text-center mb-8">
              <h3 className="font-serif text-2xl text-on-surface mb-3">
                Ready to take your first class?
              </h3>
              <p className="font-sans text-on-surface-variant mb-6 max-w-md mx-auto">
                One Yoga Vancouver offers classes with all of these teachers. Drop in, try a class pack, or start an unlimited membership.
              </p>
              <a
                href="https://oneyoga.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full px-8 py-4 text-white font-semibold font-sans text-base"
                style={{
                  background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                }}
              >
                Book at One Yoga Vancouver
              </a>
            </div>

            <button
              onClick={handleReset}
              className="w-full rounded-full py-4 font-semibold font-sans text-base border border-outline-variant/60 text-on-surface-variant hover:border-primary/40 transition-colors bg-surface-card"
            >
              Start Over
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
