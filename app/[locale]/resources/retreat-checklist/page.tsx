"use client";

import { useState } from "react";
import Link from "next/link";

type RetreatType = "domestic" | "international";
type BudgetLevel = "budget" | "midrange" | "luxury" | "ultraluxury";
type PlanningExperience = "first" | "some" | "experienced";
type YogaStyle = "vinyasa" | "hatha" | "yin" | "mixed";
type FocusArea = "yoga" | "meditation" | "adventure" | "wellness" | "cultural" | "nutrition";

interface FormData {
  retreatName: string;
  organizerName: string;
  retreatType: RetreatType;
  budgetLevel: BudgetLevel;
  durationDays: number;
  attendeeCount: number;
  planningExperience: PlanningExperience;
  monthsUntilRetreat: number;
  focusAreas: FocusArea[];
  yogaStyle: YogaStyle;
}

interface ChecklistTask {
  id: string;
  text: string;
  priority?: string;
  note?: string;
}

interface ChecklistCategory {
  name: string;
  icon: string;
  tasks: ChecklistTask[];
}

interface ChecklistPhase {
  phase: string;
  timeframe: string;
  color: string;
  categories: ChecklistCategory[];
}

const FOCUS_AREA_OPTIONS: { value: FocusArea; label: string; icon: string }[] = [
  { value: "yoga", label: "Yoga", icon: "Y" },
  { value: "meditation", label: "Meditation", icon: "M" },
  { value: "adventure", label: "Adventure", icon: "A" },
  { value: "wellness", label: "Wellness / Spa", icon: "W" },
  { value: "cultural", label: "Cultural", icon: "C" },
  { value: "nutrition", label: "Nutrition", icon: "N" },
];

const YOGA_STYLE_OPTIONS: { value: YogaStyle; label: string }[] = [
  { value: "vinyasa", label: "Vinyasa" },
  { value: "hatha", label: "Hatha" },
  { value: "yin", label: "Yin" },
  { value: "mixed", label: "Mixed" },
];

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; desc: string }[] = [
  { value: "budget", label: "Budget-Friendly", desc: "Under $1,500/person" },
  { value: "midrange", label: "Mid-Range", desc: "$1,500–3,500/person" },
  { value: "luxury", label: "Luxury", desc: "$3,500–7,000/person" },
  { value: "ultraluxury", label: "Ultra-Luxury", desc: "$7,000+/person" },
];

const EXPERIENCE_OPTIONS: { value: PlanningExperience; label: string }[] = [
  { value: "first", label: "First Retreat" },
  { value: "some", label: "1–3 Retreats" },
  { value: "experienced", label: "Experienced" },
];

function generateChecklist(form: FormData): { phases: ChecklistPhase[]; proTips: string[] } {
  const isIntl = form.retreatType === "international";
  const isFirst = form.planningExperience === "first";
  const isLuxury = form.budgetLevel === "luxury" || form.budgetLevel === "ultraluxury";
  const isBudget = form.budgetLevel === "budget";
  const isAdventure = form.focusAreas.includes("adventure");
  const isWellness = form.focusAreas.includes("wellness");
  const isCultural = form.focusAreas.includes("cultural");
  const isNutrition = form.focusAreas.includes("nutrition");
  const isMeditation = form.focusAreas.includes("meditation");
  const months = form.monthsUntilRetreat;
  const attendees = form.attendeeCount;
  const organizer = form.organizerName || "Organizer";

  const phase1: ChecklistPhase = {
    phase: "Phase 1",
    timeframe: "12+ Months Before",
    color: "#7c9a6e",
    categories: [
      {
        name: "Vision & Concept",
        icon: "V",
        tasks: [
          { id: "v1", text: "Define your retreat's core theme, intention, and transformation promise", priority: "high" },
          { id: "v2", text: "Identify your target audience (beginners, advanced, women-only, etc.)", priority: "high" },
          { id: "v3", text: `Choose your yoga style focus: ${form.yogaStyle.charAt(0).toUpperCase() + form.yogaStyle.slice(1)}`, priority: "high" },
          ...(isFirst ? [{ id: "v4", text: "Research 2–3 other retreat leaders in your niche and study their offerings", note: "First-timer tip: build your price confidence from the market" }] : []),
          ...(isMeditation ? [{ id: "v5", text: "Plan the integration of meditation: daily sits, silent meals, or full silent days" }] : []),
          ...(isAdventure ? [{ id: "v6", text: "Scope adventure activities: hike, surf, kayak, climb — research operators now", priority: "high" }] : []),
        ],
      },
      {
        name: "Financials",
        icon: "F",
        tasks: [
          { id: "f1", text: "Create a detailed budget spreadsheet: venue, food, transport, marketing, gear, teacher fees", priority: "high" },
          { id: "f2", text: `Calculate break-even price per person (minimum ${attendees} attendees)`, priority: "high" },
          ...(isBudget ? [
            { id: "f3", text: "Research group discounts with airlines, hostels, and off-season venue rates" },
            { id: "f4", text: "Identify 2–3 cost-sharing options (shared dorms, group transport, self-catering)" },
          ] : []),
          ...(isLuxury ? [
            { id: "f5", text: "Budget for luxury touches: welcome gifts, private transfers, spa treatments", priority: "high" },
            { id: "f6", text: "Research luxury retreat insurance and refund policy standards" },
          ] : []),
          { id: "f7", text: "Set up a dedicated retreat bank account or payment tracking method" },
          { id: "f8", text: "Decide on deposit and payment schedule structure" },
          { id: "f9", text: "Research retreat cancellation insurance options" },
        ],
      },
      {
        name: "Venue Search",
        icon: "S",
        tasks: [
          { id: "vs1", text: "Research and shortlist 3–5 venues that match your vision and budget", priority: "high" },
          ...(isIntl ? [
            { id: "vs2", text: "Research destination entry requirements, safety advisories, and health requirements", priority: "high" },
            { id: "vs3", text: "Confirm venue can accommodate group booking with dedicated yoga space" },
            { id: "vs4", text: "Research local currency, tipping customs, and payment methods accepted" },
          ] : []),
          { id: "vs5", text: "Confirm yoga space dimensions can fit all mats with room to spare" },
          { id: "vs6", text: "Request venue references from other retreat organizers" },
          ...(isWellness ? [{ id: "vs7", text: "Verify on-site spa, sauna, or wellness facilities are available and bookable" }] : []),
          ...(isCultural ? [{ id: "vs8", text: "Research nearby cultural sites, experiences, and local guides" }] : []),
        ],
      },
    ],
  };

  const phase2: ChecklistPhase = {
    phase: "Phase 2",
    timeframe: "6–12 Months Before",
    color: "#536046",
    categories: [
      {
        name: "Booking & Contracts",
        icon: "B",
        tasks: [
          { id: "b1", text: "Sign venue contract — confirm deposit amount, cancellation terms, and included services", priority: "high" },
          { id: "b2", text: "Book guest teachers or facilitators and sign contracts", priority: "high" },
          { id: "b3", text: "Arrange group travel insurance policy for all attendees" },
          ...(isIntl ? [
            { id: "b4", text: "Book group flights or research best airlines and routes for group travel", priority: "high" },
            { id: "b5", text: "Arrange airport transfer options (group van, private car, local bus)" },
          ] : [
            { id: "b6", text: "Research group transport options (minivan, carpool, coach)", priority: "medium" },
          ]),
          ...(isLuxury ? [
            { id: "b7", text: "Book private transfers and any VIP arrangements", priority: "high" },
            { id: "b8", text: "Reserve spa treatment slots for all attendees" },
          ] : []),
        ],
      },
      {
        name: "Marketing Launch",
        icon: "Mk",
        tasks: [
          { id: "m1", text: "Create retreat sales page with full details, pricing, photos, and FAQ", priority: "high" },
          { id: "m2", text: "Set up online booking and payment system (deposit + balance)", priority: "high" },
          { id: "m3", text: "Launch email announcement to your existing audience" },
          { id: "m4", text: "Create and schedule social media content calendar for the next 3 months" },
          { id: "m5", text: "Set up a Facebook or WhatsApp group for confirmed attendees" },
          ...(isFirst ? [
            { id: "m6", text: "Ask 2–3 trusted students for testimonials to build credibility on your sales page" },
            { id: "m7", text: "Offer an early-bird pricing window to create urgency and initial bookings" },
          ] : []),
          { id: "m8", text: "Create a referral incentive for past retreat attendees" },
        ],
      },
      {
        name: "Logistics Planning",
        icon: "L",
        tasks: [
          { id: "l1", text: "Draft a detailed day-by-day schedule including yoga, meals, free time, and excursions", priority: "high" },
          { id: "l2", text: "Confirm food and dietary accommodation approach with venue (vegan, gluten-free, etc.)" },
          ...(isNutrition ? [
            { id: "l3", text: "Hire a nutritionist or wellness chef, or plan a nutrition-focused menu", priority: "high" },
            { id: "l4", text: "Plan cooking demos, nutrition workshops, or farm-to-table experiences" },
          ] : []),
          ...(isAdventure ? [
            { id: "l5", text: "Book adventure activity operators and get liability/waiver information", priority: "high" },
            { id: "l6", text: "Research fitness level requirements and create screening process for adventurous activities" },
          ] : []),
          ...(isCultural ? [
            { id: "l7", text: "Book cultural excursions, local guides, and ceremonial or historical experiences" },
          ] : []),
          { id: "l8", text: "Research and plan first aid / medical access at venue location" },
        ],
      },
    ],
  };

  const phase3: ChecklistPhase = {
    phase: "Phase 3",
    timeframe: "3–6 Months Before",
    color: "#6b795d",
    categories: [
      {
        name: "Marketing Push",
        icon: "G",
        tasks: [
          { id: "mp1", text: "Follow up with waitlist and anyone who showed interest" },
          { id: "mp2", text: "Run paid ads on Instagram or Facebook targeting your ideal attendee" },
          { id: "mp3", text: "Publish a detailed blog post or reel about the retreat destination and theme" },
          { id: "mp4", text: "Partner with complementary teachers or brands for cross-promotion" },
          { id: "mp5", text: "Create a final scarcity push once you reach 80% capacity" },
        ],
      },
      {
        name: "Programming",
        icon: "P",
        tasks: [
          { id: "pr1", text: `Build ${form.durationDays}-day yoga sequence progression: opening, peak, integration, closing`, priority: "high" },
          { id: "pr2", text: "Prepare workshop curriculum, themes, journaling prompts, and integration exercises" },
          { id: "pr3", text: `Create ${form.yogaStyle} class plans for each morning and evening session` },
          ...(isMeditation ? [
            { id: "pr4", text: "Script guided meditations for each day (morning awakening, evening integration)" },
            { id: "pr5", text: "Plan progressive meditation techniques: breath awareness → body scan → open awareness" },
          ] : []),
          { id: "pr6", text: "Prepare music playlists for all yoga sessions" },
          { id: "pr7", text: "Draft welcome speech, opening ceremony, and closing ceremony" },
        ],
      },
      {
        name: "Food & Nutrition",
        icon: "N",
        tasks: [
          { id: "fn1", text: "Collect all dietary restrictions and allergies from confirmed attendees", priority: "high" },
          { id: "fn2", text: "Finalize menu with venue chef — confirm all dietary needs are covered" },
          ...(isNutrition ? [
            { id: "fn3", text: "Plan nutrition education sessions: macros, Ayurvedic principles, or intuitive eating" },
            { id: "fn4", text: "Source local, seasonal, and organic ingredients with venue if possible" },
          ] : []),
          { id: "fn5", text: "Confirm snacks and hydration stations throughout the day" },
          { id: "fn6", text: "Plan a celebration meal or special dinner experience" },
        ],
      },
    ],
  };

  const phase4: ChecklistPhase = {
    phase: "Phase 4",
    timeframe: "1–3 Months Before",
    color: "#536046",
    categories: [
      {
        name: "Attendee Communications",
        icon: "Cm",
        tasks: [
          { id: "ac1", text: "Send pre-retreat welcome email with full itinerary, packing list, and what to expect", priority: "high" },
          { id: "ac2", text: "Send physical waiver and liability forms to all attendees", priority: "high" },
          { id: "ac3", text: "Collect emergency contact information from all attendees" },
          ...(isIntl ? [
            { id: "ac4", text: "Send international travel briefing: visa requirements, currency, health advisories, vaccines", priority: "high" },
            { id: "ac5", text: "Confirm all attendees have valid passports (at least 6 months validity)" },
          ] : []),
          { id: "ac6", text: "Share packing list specific to destination, climate, and activities planned" },
          { id: "ac7", text: "Send pre-retreat survey: goals, experience level, health considerations" },
          { id: "ac8", text: "Welcome all attendees to the group chat and share community guidelines" },
        ],
      },
      {
        name: "Final Details",
        icon: "D",
        tasks: [
          { id: "fd1", text: "Confirm final headcount with venue and update catering numbers" },
          { id: "fd2", text: "Collect all final balance payments" },
          { id: "fd3", text: "Pack and ship any props, materials, or gifts if sending ahead" },
          ...(isLuxury ? [
            { id: "fd4", text: "Arrange welcome gift bags: items sourced, branded, and packaged" },
            { id: "fd5", text: "Confirm VIP experiences: private sessions, personalized welcome notes, room upgrades" },
          ] : []),
          { id: "fd6", text: "Confirm all bookings: venue, transport, activities, teachers, speakers" },
          { id: "fd7", text: "Print or prepare all handouts, workbooks, journals, or printed schedules" },
        ],
      },
    ],
  };

  const phase5: ChecklistPhase = {
    phase: "Phase 5",
    timeframe: "1 Month → 1 Week Before",
    color: "#7c9a6e",
    categories: [
      {
        name: "Final Preparations",
        icon: "Fp",
        tasks: [
          { id: "fp1", text: "Pack yoga props and teaching equipment (blocks, straps, music speaker, microphone)", priority: "high" },
          { id: "fp2", text: "Download all music playlists offline in case of no internet at venue" },
          { id: "fp3", text: "Prepare printed or digital welcome packets for each attendee" },
          { id: "fp4", text: "Confirm transport pickup times and share with all attendees" },
          ...(isIntl ? [
            { id: "fp5", text: "Exchange currency or load a travel card — inform your bank of travel dates" },
            { id: "fp6", text: "Download offline maps of the destination (Google Maps offline area)" },
          ] : []),
          { id: "fp7", text: "Back up all digital files (playlists, presentations, schedules) to cloud and device" },
          { id: "fp8", text: "Prepare a contingency plan for key scenarios: illness, injury, weather, cancellation" },
          { id: "fp9", text: "Do a personal wellness check — rest, nourish, and prepare mentally for holding space" },
        ],
      },
      {
        name: "Venue & Logistics Checks",
        icon: "Vl",
        tasks: [
          { id: "vl1", text: "Call or email venue to reconfirm all details: headcount, arrival time, special requests" },
          { id: "vl2", text: "Reconfirm all activity bookings and send final attendee list to operators" },
          { id: "vl3", text: "Test any tech you're bringing: projector, Bluetooth speaker, microphone" },
          ...(isWellness ? [
            { id: "vl4", text: "Confirm spa appointment schedule and share with attendees" },
          ] : []),
          { id: "vl5", text: "Prepare a detailed run sheet for Day 1 with times, names, and responsibilities" },
        ],
      },
    ],
  };

  const phase6: ChecklistPhase = {
    phase: "Phase 6",
    timeframe: "Day Before & During",
    color: "#536046",
    categories: [
      {
        name: "Arrival & Setup",
        icon: "Ar",
        tasks: [
          { id: "ds1", text: "Arrive early to set up the yoga space before attendees arrive", priority: "high" },
          { id: "ds2", text: "Set up welcome area: name tags, welcome packets, refreshments" },
          { id: "ds3", text: "Do a sound, lighting, and space check in the yoga room" },
          { id: "ds4", text: "Brief all team members or co-teachers on their roles and the day's schedule" },
          { id: "ds5", text: "Set out mats, props, and any materials for the opening session" },
        ],
      },
      {
        name: "During the Retreat",
        icon: "Dr",
        tasks: [
          { id: "dr1", text: "Hold a proper opening ceremony to set intentions and create safety" },
          { id: "dr2", text: "Check in daily with attendees (brief informal pulse check each morning or evening)" },
          { id: "dr3", text: "Document the experience: photos and videos (with consent) for future marketing" },
          { id: "dr4", text: "Collect a mid-retreat check-in feedback (anonymous optional form)" },
          ...(isAdventure ? [
            { id: "dr5", text: "Conduct safety briefings before each adventure activity — confirm consent" },
          ] : []),
          { id: "dr6", text: "Monitor energy levels and be willing to adjust schedule if group needs rest" },
          { id: "dr7", text: "Hold a meaningful closing ceremony with integration practices and sharing circle" },
        ],
      },
      {
        name: "Closing",
        icon: "Cl",
        tasks: [
          { id: "cl1", text: "Distribute end-of-retreat feedback forms before departing", priority: "high" },
          { id: "cl2", text: "Share the group photo and any media (with consent) in the group chat" },
          { id: "cl3", text: "Thank all vendors, venue staff, and co-teachers personally" },
          { id: "cl4", text: "Leave the venue in excellent condition — review check-out procedures" },
          { id: "cl5", text: "Collect any outstanding feedback forms and testimonials while memories are fresh" },
        ],
      },
    ],
  };

  const phase7: ChecklistPhase = {
    phase: "Phase 7",
    timeframe: "After the Retreat",
    color: "#43483e",
    categories: [
      {
        name: "Follow-Up",
        icon: "Fu",
        tasks: [
          { id: "au1", text: "Send a heartfelt thank-you email to all attendees within 48 hours", priority: "high" },
          { id: "au2", text: "Share a photo gallery or highlight reel from the retreat" },
          { id: "au3", text: "Send a post-retreat integration guide (practices, journaling prompts, community links)" },
          { id: "au4", text: "Ask happy attendees for written or video testimonials" },
          { id: "au5", text: "Invite attendees to join your mailing list or community if not already on it" },
          { id: "au6", text: "Announce your next retreat to this warm audience — offer an alumni discount" },
        ],
      },
      {
        name: "Business Review",
        icon: "Rv",
        tasks: [
          { id: "br1", text: "Calculate final profit/loss against your original budget" },
          { id: "br2", text: "Write a personal post-retreat reflection: what worked, what to improve" },
          { id: "br3", text: "Review all feedback forms and identify 3 specific improvements for next time" },
          { id: "br4", text: "Update your retreat template, packing list, and run sheet based on learnings" },
          ...(isFirst ? [
            { id: "br5", text: "Celebrate! You ran your first retreat — document your journey for future attendees to inspire them" },
          ] : []),
          { id: "br6", text: "File all contracts, receipts, and vendor details for future reference" },
          { id: "br7", text: "Set a date and start planning your next retreat" },
        ],
      },
    ],
  };

  // Filter phases based on timeline
  const allPhases = [phase1, phase2, phase3, phase4, phase5, phase6, phase7];
  const relevantPhases = allPhases.filter((_, idx) => {
    if (idx === 0) return months >= 12;
    if (idx === 1) return months >= 6;
    if (idx === 2) return months >= 3;
    return true;
  });

  // Pro Tips
  const proTips: string[] = [];

  if (isFirst) {
    proTips.push(`${organizer}, as a first-time retreat leader, start with a small group (8–12 people). It's easier to manage logistics and deliver a deeply personal experience.`);
  }

  if (isIntl) {
    proTips.push("For international retreats, always factor in 10–15% buffer on all cost estimates to account for currency fluctuation and unexpected expenses.");
    proTips.push("Require attendees to purchase travel insurance as a condition of booking — not just recommend it.");
  }

  if (isBudget) {
    proTips.push("Budget retreats succeed on experience, not luxury. Focus on exceptional teaching, genuine community, and a beautiful natural setting — these cost nothing extra.");
  }

  if (isLuxury) {
    proTips.push("Luxury attendees pay for seamlessness. Eliminate every friction point: pre-arrival communication, zero wait times, personalized touches, and flawless transitions between activities.");
  }

  if (form.durationDays <= 3) {
    proTips.push("For short retreats (2–3 days), keep the schedule tightly curated — 2 yoga sessions per day max. People need white space to integrate and connect socially.");
  } else if (form.durationDays >= 7) {
    proTips.push(`For ${form.durationDays}-day retreats, plan a mid-retreat 'rest day' or half-day of unstructured time. Extended schedules require recovery time to prevent burnout.`);
  }

  if (attendees > 20) {
    proTips.push(`With ${attendees} attendees, consider hiring a retreat assistant or co-facilitator. Managing logistics and holding space for a large group is a two-person job.`);
  }

  if (isAdventure && isMeditation) {
    proTips.push("Adventure + meditation is a powerful combination. Schedule adventure in the morning, use afternoon meditation to integrate the experience — adrenaline naturally deepens introspective states.");
  }

  if (form.yogaStyle === "yin") {
    proTips.push("Yin yoga retreats attract introspective, inward-focused attendees. Design your evening schedule for early, quiet nights — this demographic typically dislikes late social events.");
  }

  // Ensure we always have at least 4 tips
  if (proTips.length < 4) {
    proTips.push("Take photos and video every day of the retreat (with consent). This content will be worth more than any paid ad for your next launch.");
    proTips.push("Create a WhatsApp or Telegram group for attendees before they arrive — the community you build before the retreat dramatically improves the on-the-ground experience.");
  }

  return { phases: relevantPhases, proTips: proTips.slice(0, 6) };
}

export default function RetreatChecklistPage() {
  const [formData, setFormData] = useState<FormData>({
    retreatName: "",
    organizerName: "",
    retreatType: "domestic",
    budgetLevel: "midrange",
    durationDays: 5,
    attendeeCount: 15,
    planningExperience: "first",
    monthsUntilRetreat: 6,
    focusAreas: ["yoga", "meditation"],
    yogaStyle: "vinyasa",
  });

  const [checklist, setChecklist] = useState<ChecklistPhase[]>([]);
  const [proTips, setProTips] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));

  const toggleFocusArea = (area: FocusArea) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleGenerate = () => {
    const { phases, proTips: tips } = generateChecklist(formData);
    setChecklist(phases);
    setProTips(tips);
    setCheckedTasks(new Set());
    setShowResults(true);
    setExpandedPhases(new Set([0]));
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const togglePhase = (idx: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getPhaseProgress = (phase: ChecklistPhase) => {
    const allTasks = phase.categories.flatMap((c) => c.tasks);
    const done = allTasks.filter((t) => checkedTasks.has(t.id)).length;
    return { done, total: allTasks.length };
  };

  const getTotalProgress = () => {
    const allTasks = checklist.flatMap((p) => p.categories.flatMap((c) => c.tasks));
    const done = allTasks.filter((t) => checkedTasks.has(t.id)).length;
    return { done, total: allTasks.length };
  };

  const handlePrint = () => {
    if (!checklist.length) return;
    const { done, total } = getTotalProgress();
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Retreat Planning Checklist — ${formData.retreatName || "My Retreat"}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1c19; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { color: #43483e; font-size: 14px; margin-bottom: 8px; }
    .progress { font-size: 13px; color: #536046; font-weight: bold; margin-bottom: 32px; }
    .phase { margin-bottom: 32px; }
    .phase-header { background: #dde5d4; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; }
    .phase-title { font-size: 16px; font-weight: bold; margin: 0; }
    .phase-time { font-size: 12px; color: #536046; font-family: sans-serif; margin: 0; }
    .category { margin-bottom: 16px; }
    .cat-title { font-family: sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #536046; margin-bottom: 6px; }
    .task { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .checkbox { width: 14px; height: 14px; border: 1.5px solid #c5c8bd; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
    .checkbox.checked { background: #536046; border-color: #536046; }
    .task-text { font-size: 13px; line-height: 1.5; }
    .task-note { font-size: 11px; color: #43483e; font-style: italic; margin-top: 2px; }
    .tips { background: #f4f4ef; border-left: 3px solid #536046; padding: 16px 20px; border-radius: 4px; margin-top: 32px; }
    .tips h2 { font-size: 14px; margin: 0 0 10px; }
    .tip { font-size: 13px; margin-bottom: 6px; color: #43483e; }
    @media print { .phase { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${formData.retreatName || "Retreat"} — Planning Checklist</h1>
  <p class="meta">Organizer: ${formData.organizerName || "—"} &bull; ${formData.durationDays} days &bull; ${formData.attendeeCount} attendees &bull; ${formData.retreatType === "international" ? "International" : "Domestic"} &bull; ${formData.budgetLevel.charAt(0).toUpperCase() + formData.budgetLevel.slice(1)}</p>
  <p class="progress">Progress: ${done}/${total} tasks completed</p>
  ${checklist.map((phase) => `
  <div class="phase">
    <div class="phase-header">
      <p class="phase-title">${phase.phase}: ${phase.timeframe}</p>
    </div>
    ${phase.categories.map((cat) => `
    <div class="category">
      <div class="cat-title">${cat.icon} ${cat.name}</div>
      ${cat.tasks.map((task) => `
      <div class="task">
        <div class="checkbox ${checkedTasks.has(task.id) ? "checked" : ""}"></div>
        <div>
          <div class="task-text">${task.text}</div>
          ${task.note ? `<div class="task-note">${task.note}</div>` : ""}
        </div>
      </div>
      `).join("")}
    </div>
    `).join("")}
  </div>
  `).join("")}
  ${proTips.length ? `
  <div class="tips">
    <h2>Pro Tips for Your Retreat</h2>
    ${proTips.map((tip, i) => `<p class="tip">${i + 1}. ${tip}</p>`).join("")}
  </div>
  ` : ""}
</body>
</html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const isFormValid = formData.focusAreas.length > 0;
  const totalProgress = showResults ? getTotalProgress() : { done: 0, total: 0 };

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
            Retreat Leaders · Free Tool
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            Retreat Planning<br />Checklist Generator
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Generate a comprehensive, personalized checklist for your next yoga retreat — from venue search to post-retreat follow-up, with pro tips tailored to your situation.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">

          {/* Retreat Overview */}
          <div className="bg-surface-card rounded-2xl p-8 mb-6 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Retreat Overview</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">Tell us the basics about your retreat.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Retreat Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bali Reawakening Retreat 2026"
                  value={formData.retreatName}
                  onChange={(e) => setFormData({ ...formData, retreatName: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 5 })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  min={2}
                  max={200}
                  value={formData.attendeeCount}
                  onChange={(e) => setFormData({ ...formData, attendeeCount: parseInt(e.target.value) || 15 })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Months Until Retreat
                </label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={formData.monthsUntilRetreat}
                  onChange={(e) => setFormData({ ...formData, monthsUntilRetreat: parseInt(e.target.value) || 6 })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
                />
                <p className="font-sans text-xs text-on-surface-variant/60 mt-1.5">Used to show only relevant planning phases</p>
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-2">
                  Yoga Style
                </label>
                <select
                  value={formData.yogaStyle}
                  onChange={(e) => setFormData({ ...formData, yogaStyle: e.target.value as YogaStyle })}
                  className="w-full font-sans text-sm bg-surface-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 transition-colors"
                >
                  {YOGA_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Retreat Type */}
          <div className="bg-surface-card rounded-2xl p-8 mb-6 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Retreat Type & Budget</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">These choices shape your checklist tasks significantly.</p>

            <div className="mb-6">
              <p className="font-sans text-sm font-semibold text-on-surface mb-3">Destination Type</p>
              <div className="flex gap-3">
                {(["domestic", "international"] as RetreatType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, retreatType: type })}
                    className={`font-sans text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 ${
                      formData.retreatType === type
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    {type === "domestic" ? "Domestic" : "International"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-sans text-sm font-semibold text-on-surface mb-3">Budget Level</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, budgetLevel: opt.value })}
                    className={`font-sans text-left px-4 py-3.5 rounded-xl transition-all duration-200 border ${
                      formData.budgetLevel === opt.value
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    <p className={`text-sm font-semibold leading-tight ${formData.budgetLevel === opt.value ? "text-white" : "text-on-surface"}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${formData.budgetLevel === opt.value ? "text-white/70" : "text-on-surface-variant/60"}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Experience & Focus */}
          <div className="bg-surface-card rounded-2xl p-8 mb-6 shadow-card">
            <h2 className="font-serif text-xl text-on-surface mb-1">Experience & Focus Areas</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-6">We'll personalize tasks based on your experience level and retreat focus.</p>

            <div className="mb-6">
              <p className="font-sans text-sm font-semibold text-on-surface mb-3">Your Planning Experience</p>
              <div className="flex flex-wrap gap-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, planningExperience: opt.value })}
                    className={`font-sans text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 ${
                      formData.planningExperience === opt.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-sans text-sm font-semibold text-on-surface mb-3">
                Focus Areas <span className="font-normal text-on-surface-variant/60">(select all that apply)</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FOCUS_AREA_OPTIONS.map((opt) => {
                  const isSelected = formData.focusAreas.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleFocusArea(opt.value)}
                      className={`flex items-center gap-2.5 font-sans text-sm font-semibold px-4 py-3 rounded-xl transition-all duration-200 border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {formData.focusAreas.length === 0 && (
                <p className="font-sans text-xs text-red-500/70 mt-2">Please select at least one focus area.</p>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!isFormValid}
            className="w-full py-4 rounded-full font-sans font-semibold text-white text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
          >
            Generate My Personalized Checklist
          </button>
        </div>
      </section>

      {/* Results */}
      {showResults && checklist.length > 0 && (
        <section id="results-section" className="pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
              <div>
                <h2 className="font-serif text-2xl text-on-surface">
                  {formData.retreatName || "Your Retreat"} Checklist
                </h2>
                <p className="font-sans text-sm text-on-surface-variant mt-1">
                  {checklist.length} planning phases · {totalProgress.total} tasks
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Overall Progress */}
                <div className="text-right">
                  <p className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Progress</p>
                  <p className="font-sans text-lg font-bold text-on-surface leading-tight">
                    {totalProgress.done}
                    <span className="text-sm font-normal text-on-surface-variant">/{totalProgress.total}</span>
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 font-sans text-sm font-semibold text-primary border border-primary/30 bg-secondary-container/30 hover:bg-secondary-container/60 px-4 py-2.5 rounded-full transition-colors"
                >
                  Print
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-surface-low rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: totalProgress.total > 0 ? `${(totalProgress.done / totalProgress.total) * 100}%` : "0%",
                    background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                  }}
                />
              </div>
              {totalProgress.done > 0 && (
                <p className="font-sans text-xs text-on-surface-variant mt-1.5">
                  {Math.round((totalProgress.done / totalProgress.total) * 100)}% complete
                  {totalProgress.done === totalProgress.total ? " — You're ready!" : ""}
                </p>
              )}
            </div>

            {/* Phase Accordion */}
            <div className="space-y-3 mb-8">
              {checklist.map((phase, phaseIdx) => {
                const isOpen = expandedPhases.has(phaseIdx);
                const { done, total } = getPhaseProgress(phase);
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isComplete = done === total && total > 0;
                return (
                  <div
                    key={phaseIdx}
                    className="bg-surface-card rounded-2xl overflow-hidden border border-outline-variant/10 shadow-card"
                  >
                    {/* Phase Header */}
                    <button
                      onClick={() => togglePhase(phaseIdx)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-low/50 transition-colors"
                    >
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: isComplete ? "#536046" : "#dde5d4" }}
                      >
                        {isComplete ? (
                          <span className="text-white text-lg">✓</span>
                        ) : (
                          <span className="font-serif text-base font-bold text-primary">{phaseIdx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-bold text-primary/70 uppercase tracking-wider">{phase.phase}</p>
                        <p className="font-serif text-base font-bold text-on-surface">{phase.timeframe}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[120px] bg-outline-variant/20 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, background: phase.color }}
                            />
                          </div>
                          <span className="font-sans text-xs text-on-surface-variant">
                            {done}/{total}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-on-surface-variant transition-transform duration-200 block ${isOpen ? "rotate-180" : ""}`}>
                          ▾
                        </span>
                      </div>
                    </button>

                    {/* Phase Content */}
                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-outline-variant/10 pt-5 space-y-6">
                        {phase.categories.map((cat, catIdx) => (
                          <div key={catIdx}>
                            <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-3">
                              {cat.name}
                            </p>
                            <div className="space-y-2">
                              {cat.tasks.map((task) => {
                                const isChecked = checkedTasks.has(task.id);
                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                                      isChecked
                                        ? "bg-secondary-container/40 opacity-70"
                                        : "bg-surface-low hover:bg-secondary-container/20"
                                    }`}
                                  >
                                    {/* Checkbox */}
                                    <div
                                      className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
                                        isChecked
                                          ? "border-primary bg-primary"
                                          : "border-outline-variant/50 group-hover:border-primary/50"
                                      }`}
                                    >
                                      {isChecked && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-sans text-sm leading-relaxed ${isChecked ? "line-through text-on-surface-variant/50" : "text-on-surface"}`}>
                                        {task.text}
                                        {task.priority === "high" && !isChecked && (
                                          <span className="ml-2 inline-block font-sans text-xs font-bold text-primary bg-secondary-container px-2 py-0.5 rounded-full align-middle">
                                            Priority
                                          </span>
                                        )}
                                      </p>
                                      {task.note && !isChecked && (
                                        <p className="font-sans text-xs text-primary/70 mt-0.5 italic">{task.note}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pro Tips */}
            {proTips.length > 0 && (
              <div className="bg-secondary-container/30 rounded-2xl p-6 border border-secondary-container mb-8">
                <p className="font-sans text-xs font-bold text-primary uppercase tracking-widest mb-4">
                  Pro Tips for Your Retreat
                </p>
                <div className="space-y-3">
                  {proTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center mt-0.5">
                        <span className="font-sans text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            <div className="text-center">
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
