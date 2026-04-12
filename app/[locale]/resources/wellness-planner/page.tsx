"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";
type Goal =
  | "Flexibility"
  | "Strength"
  | "Stress Relief"
  | "Weight Management"
  | "Better Sleep"
  | "Energy Boost"
  | "Mindfulness"
  | "Injury Recovery";
type DietType = "Omnivore" | "Vegetarian" | "Vegan" | "Gluten-Free";

interface FormData {
  name: string;
  level: ExperienceLevel;
  goals: Goal[];
  wakeTime: string;
  diet: DietType;
}

interface YogaPose {
  name: string;
  duration: string;
  benefit: string;
  modification?: string;
}

interface MealEntry {
  time: string;
  label: string;
  meal: string;
  note?: string;
}

interface GeneratedPlan {
  yogaRoutine: YogaPose[];
  totalDuration: string;
  routineNote?: string;
  mealPlan: MealEntry[];
  hydrationTip: string;
  postWorkoutTip: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GOALS: Goal[] = [
  "Flexibility",
  "Strength",
  "Stress Relief",
  "Weight Management",
  "Better Sleep",
  "Energy Boost",
  "Mindfulness",
  "Injury Recovery",
];

const BASE_ROUTINES: Record<ExperienceLevel, YogaPose[]> = {
  Beginner: [
    {
      name: "Child's Pose",
      duration: "2 min",
      benefit: "Grounds the body and calms the nervous system to start the day.",
      modification: "Place a blanket under the knees or forehead for extra comfort.",
    },
    {
      name: "Cat-Cow",
      duration: "3 min",
      benefit: "Warms the spine and massages internal organs.",
      modification: "Keep movement small and gentle; pause in each shape.",
    },
    {
      name: "Downward Facing Dog",
      duration: "2 min",
      benefit: "Lengthens the hamstrings and opens the shoulders.",
      modification: "Bend the knees generously to keep the spine long.",
    },
    {
      name: "Mountain Pose",
      duration: "2 min",
      benefit: "Builds body awareness and upright posture.",
      modification: "Stand near a wall for balance support.",
    },
    {
      name: "Seated Meditation",
      duration: "3 min",
      benefit: "Settles the mind and sets a positive intention for the day.",
      modification: "Sit on a folded blanket or in a chair for comfort.",
    },
  ],
  Intermediate: [
    {
      name: "Sun Salutation A × 3 rounds",
      duration: "8 min",
      benefit: "Full-body warm-up connecting breath to movement.",
      modification: "Substitute Upward Dog with Baby Cobra if needed.",
    },
    {
      name: "Warrior II",
      duration: "3 min",
      benefit: "Builds leg strength, hip flexibility, and endurance.",
      modification: "Shorten the stance to reduce intensity.",
    },
    {
      name: "Tree Pose",
      duration: "2 min",
      benefit: "Improves balance, focus, and ankle stability.",
      modification: "Keep the raised foot low (ankle level) if balance is challenging.",
    },
    {
      name: "Pigeon Pose",
      duration: "5 min",
      benefit: "Deep hip flexor and piriformis release.",
      modification: "Use blocks or a blanket under the hip for support.",
    },
    {
      name: "Seated Forward Fold",
      duration: "4 min",
      benefit: "Lengthens the hamstrings and calms the nervous system.",
      modification: "Loop a strap around the feet and bend the knees if tight.",
    },
    {
      name: "Savasana",
      duration: "3 min",
      benefit: "Integrates the practice and restores the nervous system.",
      modification: "Place a bolster under the knees for lower-back relief.",
    },
  ],
  Advanced: [
    {
      name: "Sun Salutation A + B × 5 rounds",
      duration: "15 min",
      benefit: "Full-body activation, building heat and rhythm.",
    },
    {
      name: "Standing Balance Flow",
      duration: "8 min",
      benefit: "Warrior III, Half Moon, Standing Split sequence — builds focus and leg strength.",
    },
    {
      name: "Peak Pose (Inversion or Arm Balance)",
      duration: "10 min",
      benefit: "Challenges strength, core engagement, and mental courage.",
      modification: "Practice at the wall for safety when needed.",
    },
    {
      name: "Deep Hip Opening Sequence",
      duration: "7 min",
      benefit: "Pigeon, Lizard, and Figure-Four — releases deep hip tension.",
    },
    {
      name: "Pranayama (Kapalabhati + Nadi Shodhana)",
      duration: "3 min",
      benefit: "Cleanses and balances the energy channels.",
    },
    {
      name: "Seated Meditation",
      duration: "2 min",
      benefit: "Seals the practice with clarity and presence.",
    },
  ],
};

function applyGoalModifiers(
  poses: YogaPose[],
  goals: Goal[],
  level: ExperienceLevel
): { poses: YogaPose[]; note: string | undefined } {
  let modifiedPoses = [...poses];
  const notes: string[] = [];

  if (goals.includes("Stress Relief")) {
    // Extend savasana / meditation
    modifiedPoses = modifiedPoses.map((p) => {
      if (p.name.toLowerCase().includes("savasana")) {
        return { ...p, duration: "6 min", benefit: p.benefit + " Extended for deeper stress recovery." };
      }
      if (p.name.toLowerCase().includes("meditation")) {
        return { ...p, duration: "5 min", benefit: p.benefit + " Extended with guided body scan for stress relief." };
      }
      return p;
    });
    notes.push("Extra Pranayama and Savasana time added for stress relief.");
  }

  if (goals.includes("Flexibility")) {
    const yinNote =
      level === "Beginner"
        ? "Hold each pose for an extra 30 seconds for deeper stretch."
        : "Use yin-style holds (3–5 min) in floor poses to target deep connective tissue.";
    notes.push(yinNote);
  }

  if (goals.includes("Strength")) {
    const strengthNote =
      level === "Beginner"
        ? "Add 5 rounds of Chair Pose (30 sec holds) between poses."
        : "Include 3 sets of Plank → Side Plank transitions after Sun Salutations.";
    notes.push(strengthNote);
  }

  if (goals.includes("Better Sleep")) {
    notes.push(
      "Consider shifting this routine to the evening. Evening yoga (Yin + Restorative) is more effective for sleep quality than morning power practice."
    );
  }

  if (goals.includes("Weight Management")) {
    notes.push("Add brisk Sun Salutations (moving with each breath) to elevate the heart rate.");
  }

  if (goals.includes("Injury Recovery")) {
    notes.push(
      "Move mindfully. Use all available modifications and skip any pose that causes pain. Consult your physiotherapist before beginning."
    );
  }

  return {
    poses: modifiedPoses,
    note: notes.length > 0 ? notes.join(" · ") : undefined,
  };
}

function totalMinutes(poses: YogaPose[]): number {
  return poses.reduce((sum, p) => {
    const match = p.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
}

// ─── Meal Plan Data ───────────────────────────────────────────────────────────

type MealKey = `${DietType}-${Goal}` | DietType;

const MEALS: Partial<Record<string, Record<string, string>>> = {
  Omnivore: {
    breakfast: "Greek yogurt with fresh berries, granola, and a drizzle of honey",
    midMorning: "Apple slices with almond butter",
    lunch: "Grilled chicken and quinoa bowl with avocado, cherry tomatoes, and lemon tahini",
    afternoon: "Hard-boiled eggs with cucumber slices and hummus",
    dinner: "Baked salmon with roasted sweet potato and steamed broccoli",
    evening: "Chamomile tea with a small handful of walnuts",
  },
  "Omnivore-Energy Boost": {
    breakfast: "Scrambled eggs with spinach, whole-grain toast, and orange juice",
    midMorning: "Banana with peanut butter and a green tea",
    lunch: "Turkey and brown rice bowl with roasted vegetables and olive oil",
    afternoon: "Trail mix with dark chocolate chips, nuts, and dried mango",
    dinner: "Lean beef stir-fry with bell peppers, broccoli, and brown rice",
    evening: "Warm golden milk with turmeric and black pepper",
  },
  "Omnivore-Weight Management": {
    breakfast: "Veggie omelette (2 eggs, spinach, mushroom, feta) with black coffee",
    midMorning: "Celery sticks with hummus and a green tea",
    lunch: "Large mixed greens salad with grilled chicken, cucumber, chickpeas, and lemon vinaigrette",
    afternoon: "Small apple and 10 almonds",
    dinner: "Baked cod with zucchini noodles and marinara sauce",
    evening: "Herbal tea (no added sweetener)",
  },
  "Omnivore-Stress Relief": {
    breakfast: "Warm oatmeal with banana, flaxseeds, and cinnamon",
    midMorning: "Ashwagandha smoothie: banana, almond milk, cocoa, ashwagandha powder",
    lunch: "Lentil soup with whole-grain bread and a side salad",
    afternoon: "Dark chocolate (70%+) and green tea",
    dinner: "Baked turkey with mashed sweet potato and roasted asparagus",
    evening: "Warm chamomile or lavender tea",
  },
  "Omnivore-Better Sleep": {
    breakfast: "Oatmeal with cherries, almonds, and a teaspoon of honey",
    midMorning: "Kiwi (known to boost melatonin) with cottage cheese",
    lunch: "Tuna salad with whole grain crackers and mixed greens",
    afternoon: "Pumpkin seeds and a small banana",
    dinner: "Turkey and vegetable soup with whole-grain bread (tryptophan-rich)",
    evening: "Tart cherry juice with warm almond milk",
  },
  Vegetarian: {
    breakfast: "Overnight oats with chia seeds, almond milk, blueberries, and maple syrup",
    midMorning: "Carrot sticks with tzatziki dip",
    lunch: "Chickpea and spinach curry over brown basmati rice",
    afternoon: "Greek yogurt with a handful of walnuts and honey",
    dinner: "Caprese pasta with cherry tomatoes, fresh mozzarella, and basil",
    evening: "Warm turmeric golden milk",
  },
  "Vegetarian-Flexibility": {
    breakfast: "Anti-inflammatory smoothie: mango, pineapple, ginger, turmeric, coconut milk",
    midMorning: "Celery and apple slices with peanut butter",
    lunch: "Black bean and roasted sweet potato bowl with avocado and lime",
    afternoon: "Edamame with sea salt and green tea",
    dinner: "Baked tofu with sautéed bok choy and sesame brown rice",
    evening: "Tart cherry juice (reduces muscle inflammation)",
  },
  "Vegetarian-Strength": {
    breakfast: "Paneer scramble with bell peppers and whole-grain toast",
    midMorning: "Protein smoothie: Greek yogurt, banana, peanut butter, oat milk",
    lunch: "Lentil dal with brown rice, spinach salad, and raita",
    afternoon: "Cottage cheese with pineapple chunks",
    dinner: "Tempeh stir-fry with broccoli, snap peas, and quinoa",
    evening: "Warm milk with a pinch of turmeric",
  },
  Vegan: {
    breakfast: "Smoothie bowl: acai, banana, blueberries, topped with granola and hemp seeds",
    midMorning: "Rice cakes with almond butter and sliced strawberries",
    lunch: "Roasted vegetable and farro bowl with tahini lemon dressing",
    afternoon: "Edamame and a handful of mixed nuts",
    dinner: "Lentil bolognese with whole-grain pasta and a side salad",
    evening: "Warm oat milk with cinnamon and vanilla",
  },
  "Vegan-Flexibility": {
    breakfast: "Anti-inflammatory golden smoothie: turmeric, ginger, mango, coconut milk, black pepper",
    midMorning: "Pineapple slices (bromelain enzyme supports joint flexibility)",
    lunch: "White bean and kale stew with crusty sourdough",
    afternoon: "Celery juice and a handful of walnuts",
    dinner: "Baked tofu with roasted beets, sweet potato, and miso-tahini dressing",
    evening: "Tart cherry and ginger tea",
  },
  "Vegan-Energy Boost": {
    breakfast: "Maca banana smoothie: maca powder, banana, oat milk, dates, cacao",
    midMorning: "Apple with sunflower seed butter",
    lunch: "Quinoa power bowl: black beans, corn, avocado, salsa, lime",
    afternoon: "Medjool dates with almonds and green tea",
    dinner: "Tempeh and broccoli stir-fry with brown rice and sesame ginger sauce",
    evening: "Warm cacao with oat milk and a pinch of cayenne",
  },
  "Vegan-Stress Relief": {
    breakfast: "Overnight oats with banana, chia seeds, and lavender-infused almond milk",
    midMorning: "Ashwagandha smoothie: banana, cacao, coconut milk, ashwagandha",
    lunch: "Warming red lentil soup with crusty sourdough",
    afternoon: "Dark chocolate (vegan, 70%+) and chamomile tea",
    dinner: "Mushroom and wild rice pilaf with roasted carrots",
    evening: "Lavender oat milk tea",
  },
  "Gluten-Free": {
    breakfast: "Gluten-free oats with banana, almond butter, and hemp seeds",
    midMorning: "Rice cakes with avocado and sea salt",
    lunch: "Quinoa bowl with roasted chicken, spinach, cucumber, and lemon vinaigrette",
    afternoon: "Mixed nuts and fresh fruit",
    dinner: "Grilled salmon with roasted asparagus and cauliflower rice",
    evening: "Herbal tea and dark chocolate (GF certified)",
  },
  "Gluten-Free-Strength": {
    breakfast: "Sweet potato hash with eggs, spinach, and salsa",
    midMorning: "Protein smoothie: banana, GF protein powder, almond milk, chia",
    lunch: "Ground turkey and rice bowl with roasted vegetables and avocado",
    afternoon: "Hard-boiled eggs and rice cakes with hummus",
    dinner: "Baked chicken thighs with quinoa tabbouleh and tzatziki",
    evening: "Warm almond milk with cinnamon",
  },
};

function getMeals(diet: DietType, goals: Goal[]): Record<string, string> {
  // Try to find a goal-specific match first
  for (const goal of goals) {
    const key = `${diet}-${goal}`;
    if (MEALS[key]) return MEALS[key] as Record<string, string>;
  }
  // Fall back to base diet
  return (MEALS[diet] ?? MEALS.Omnivore) as Record<string, string>;
}

function buildMealPlan(diet: DietType, goals: Goal[], wakeTime: string): MealEntry[] {
  const meals = getMeals(diet, goals);

  // Parse wake time
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const wakeMinutes = wakeHour * 60 + (wakeMinute || 0);

  function formatTime(offsetMinutes: number): string {
    const total = wakeMinutes + offsetMinutes;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  const plan: MealEntry[] = [
    {
      time: formatTime(30),
      label: "Breakfast",
      meal: meals.breakfast ?? "Fresh fruit with nuts and seeds",
      note: "Eat within 30–60 min of waking to kickstart metabolism.",
    },
    {
      time: formatTime(150),
      label: "Mid-Morning Snack",
      meal: meals.midMorning ?? "Seasonal fruit with a handful of nuts",
    },
    {
      time: formatTime(270),
      label: "Lunch",
      meal: meals.lunch ?? "Balanced bowl with protein, greens, and whole grains",
      note: "Largest meal of the day — focus on quality protein and fiber.",
    },
    {
      time: formatTime(420),
      label: "Afternoon Snack",
      meal: meals.afternoon ?? "Nuts and fresh fruit",
    },
    {
      time: formatTime(600),
      label: "Dinner",
      meal: meals.dinner ?? "Light protein with roasted vegetables",
      note: "Eat at least 2–3 hours before bed for optimal digestion.",
    },
    {
      time: formatTime(720),
      label: "Evening",
      meal: meals.evening ?? "Herbal tea",
      note: "Optional — choose something light and calming.",
    },
  ];

  return plan;
}

// ─── Plan Generator ───────────────────────────────────────────────────────────

function generatePlan(formData: FormData): GeneratedPlan {
  const basePoses = BASE_ROUTINES[formData.level].map((p) => ({ ...p }));
  const { poses: modifiedPoses, note } = applyGoalModifiers(basePoses, formData.goals, formData.level);
  const total = totalMinutes(modifiedPoses);
  const mealPlan = buildMealPlan(formData.diet, formData.goals, formData.wakeTime);

  const hydrationTips: Record<DietType, string> = {
    Omnivore: "Aim for 8–10 glasses of water daily. Start with a large glass upon waking. Add lemon for a detox boost.",
    Vegetarian: "Aim for 8–10 glasses of water daily. Include hydrating foods like cucumber, celery, and watermelon.",
    Vegan: "Aim for 8–10 glasses of water daily. Coconut water is excellent for electrolyte replenishment post-practice.",
    "Gluten-Free": "Aim for 8–10 glasses of water daily. Herbal teas count! Ginger tea supports digestion.",
  };

  const postWorkoutTips: Record<ExperienceLevel, string> = {
    Beginner: "After practice, eat a light snack with protein and carbs within 30 minutes (e.g., banana with nut butter). Avoid heavy meals immediately after.",
    Intermediate: "Replenish within 45 minutes post-practice with a balanced meal. Protein (20–30g) supports muscle recovery. Stretch passively for 5 min.",
    Advanced: "Prioritize post-practice nutrition: 30–40g protein + complex carbs within 30 min. Include anti-inflammatory foods (turmeric, ginger, berries) in your next meal.",
  };

  return {
    yogaRoutine: modifiedPoses,
    totalDuration: `${total} min`,
    routineNote: note,
    mealPlan,
    hydrationTip: hydrationTips[formData.diet],
    postWorkoutTip: postWorkoutTips[formData.level],
  };
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["About You", "Review", "Your Plan"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = currentStep === step;
        const isDone = currentStep > step;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-sans font-bold text-sm transition-all duration-200 ${
                  isDone
                    ? "bg-primary text-white"
                    : isActive
                    ? "text-white"
                    : "bg-surface-low border-2 border-outline-variant text-on-surface-variant"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" } : {}}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={`mt-1 font-sans text-xs hidden sm:block ${
                  isActive ? "text-primary font-semibold" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 sm:mb-0 transition-all duration-300 ${
                  currentStep > step ? "bg-primary" : "bg-outline-variant"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 ${
        selected
          ? "bg-primary text-white border-primary"
          : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WellnessPlannerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    level: "Intermediate",
    goals: [],
    wakeTime: "06:30",
    diet: "Omnivore",
  });
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  function toggleGoal(goal: Goal) {
    setFormData((prev) => {
      const has = prev.goals.includes(goal);
      if (has) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goal) };
      }
      if (prev.goals.length >= 3) return prev; // max 3
      return { ...prev, goals: [...prev.goals, goal] };
    });
  }

  function handleNext() {
    if (step === 2) {
      const generated = generatePlan(formData);
      setPlan(generated);
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setStep(1);
    setFormData({
      name: "",
      level: "Intermediate",
      goals: [],
      wakeTime: "06:30",
      diet: "Omnivore",
    });
    setPlan(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePrint() {
    window.print();
  }

  const step1Valid = formData.goals.length > 0;

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
          >
            ← Back to Resources
          </Link>
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Wellness Tools
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">
            Yoga &amp; Wellness Planner
          </h1>
          <p className="font-sans text-lg text-on-surface-variant">
            Get a personalized morning yoga routine and daily meal plan tailored to your goals and lifestyle.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-2xl mx-auto px-4">
          <StepIndicator currentStep={step} />

          {/* ── Step 1: About You ── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Name */}
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
                  Your Name
                </p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Sarah"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 font-sans text-sm text-on-surface bg-[#fafaf5] placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Experience Level */}
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
                  Experience Level
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["Beginner", "Intermediate", "Advanced"] as ExperienceLevel[]).map((l) => (
                    <OptionBtn
                      key={l}
                      label={l}
                      selected={formData.level === l}
                      onClick={() => setFormData((prev) => ({ ...prev, level: l }))}
                    />
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-1">
                  Goals
                </p>
                <p className="font-sans text-xs text-on-surface-variant mb-3">
                  Select up to 3
                  {formData.goals.length > 0 && (
                    <span className="ml-1 font-medium text-primary">
                      ({formData.goals.length}/3 selected)
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <OptionBtn
                      key={g}
                      label={g}
                      selected={formData.goals.includes(g)}
                      onClick={() => toggleGoal(g)}
                    />
                  ))}
                </div>
              </div>

              {/* Wake-Up Time */}
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
                  Wake-Up Time
                </p>
                <input
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, wakeTime: e.target.value }))
                  }
                  className="border border-outline-variant rounded-xl px-4 py-3 font-sans text-sm text-on-surface bg-[#fafaf5] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Diet Type */}
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
                  Diet Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["Omnivore", "Vegetarian", "Vegan", "Gluten-Free"] as DietType[]).map(
                    (d) => (
                      <OptionBtn
                        key={d}
                        label={d}
                        selected={formData.diet === d}
                        onClick={() => setFormData((prev) => ({ ...prev, diet: d }))}
                      />
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!step1Valid}
                className="w-full py-4 rounded-full text-white font-semibold font-sans text-base transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                }}
              >
                Review My Info →
              </button>
              {!step1Valid && (
                <p className="text-center font-sans text-xs text-on-surface-variant">
                  Please select at least one goal to continue.
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-surface-card rounded-2xl p-8">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-6">
                  Review Your Details
                </p>

                <div className="space-y-4">
                  {formData.name && (
                    <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                      <span className="font-sans text-sm text-on-surface-variant">Name</span>
                      <span className="font-sans text-sm font-medium text-on-surface">
                        {formData.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                    <span className="font-sans text-sm text-on-surface-variant">Experience Level</span>
                    <span className="font-sans text-sm font-medium text-on-surface">
                      {formData.level}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-outline-variant/30 gap-2">
                    <span className="font-sans text-sm text-on-surface-variant">Goals</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {formData.goals.map((g) => (
                        <span
                          key={g}
                          className="font-sans text-xs font-medium bg-secondary-container text-primary px-3 py-1 rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                    <span className="font-sans text-sm text-on-surface-variant">Wake-Up Time</span>
                    <span className="font-sans text-sm font-medium text-on-surface">
                      {formData.wakeTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-sans text-sm text-on-surface-variant">Diet Type</span>
                    <span className="font-sans text-sm font-medium text-on-surface">
                      {formData.diet}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-container rounded-2xl p-6">
                <p className="font-sans text-sm text-on-surface leading-relaxed">
                  Your personalized yoga routine and meal plan will be generated based on these preferences. You can always create a new plan if you want to adjust.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-4 rounded-full font-semibold font-sans text-sm bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 transition-colors"
                >
                  ← Edit Info
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 rounded-full text-white font-semibold font-sans text-base transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                  }}
                >
                  Generate My Plan ✨
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Results ── */}
          {step === 3 && plan && (
            <div className="space-y-8">
              {/* Header */}
              <div
                className="rounded-2xl p-8 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #536046 0%, #6b795d 60%, #7a8f6d 100%)",
                }}
              >
                <p className="font-sans text-xs font-bold tracking-widest uppercase opacity-70 mb-2">
                  Your Personalized Plan
                </p>
                <h2 className="font-serif text-3xl mb-1">
                  {formData.name ? `${formData.name}'s Wellness Plan` : "Your Wellness Plan"}
                </h2>
                <p className="font-sans text-sm opacity-80">
                  {formData.level} · {formData.goals.join(", ")} · {formData.diet}
                </p>
              </div>

              {/* Yoga Routine */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-1">
                      Morning Yoga Routine
                    </p>
                    <p className="font-sans text-sm text-on-surface-variant">
                      Total: {plan.totalDuration}
                    </p>
                  </div>
                </div>

                {plan.routineNote && (
                  <div className="bg-secondary-container rounded-xl px-5 py-4 mb-4">
                    <p className="font-sans text-xs text-on-surface leading-relaxed">
                      💡 {plan.routineNote}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {plan.yogaRoutine.map((pose, i) => (
                    <div
                      key={i}
                      className="bg-surface-card rounded-2xl p-5 flex gap-4 items-start"
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold font-sans text-sm"
                        style={{ background: "#536046" }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-serif text-base text-on-surface">{pose.name}</h3>
                          <span className="font-sans text-xs font-medium bg-surface-low border border-outline-variant/40 text-on-surface-variant px-2 py-0.5 rounded-full">
                            {pose.duration}
                          </span>
                        </div>
                        <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                          {pose.benefit}
                        </p>
                        {pose.modification && (
                          <p className="font-sans text-xs text-primary mt-1.5">
                            Modification: {pose.modification}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Workout Tip */}
              <div className="bg-secondary-container rounded-2xl p-6">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-2">
                  Post-Practice Nutrition
                </p>
                <p className="font-sans text-sm text-on-surface leading-relaxed">
                  {plan.postWorkoutTip}
                </p>
              </div>

              {/* Meal Plan */}
              <div>
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
                  Daily Meal Plan
                </p>
                <div className="space-y-3">
                  {plan.mealPlan.map((entry, i) => (
                    <div key={i} className="bg-surface-card rounded-2xl p-5 flex gap-4">
                      <div className="shrink-0 w-24 text-right">
                        <span className="font-sans text-xs font-bold text-primary block">
                          {entry.time}
                        </span>
                        <span className="font-sans text-xs text-on-surface-variant">
                          {entry.label}
                        </span>
                      </div>
                      <div className="w-px bg-outline-variant/40 self-stretch" />
                      <div className="flex-1">
                        <p className="font-sans text-sm text-on-surface leading-relaxed">
                          {entry.meal}
                        </p>
                        {entry.note && (
                          <p className="font-sans text-xs text-on-surface-variant mt-1">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydration */}
              <div className="bg-surface-card rounded-2xl p-6 border border-outline-variant/30">
                <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-2">
                  Hydration
                </p>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  💧 {plan.hydrationTip}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-full text-white font-semibold font-sans text-base transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                  }}
                >
                  Create Another Plan
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-4 rounded-full font-semibold font-sans text-sm bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 transition-colors"
                >
                  Download / Print
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
