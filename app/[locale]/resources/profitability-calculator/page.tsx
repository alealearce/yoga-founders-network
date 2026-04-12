"use client";

import { useState } from "react";
import Link from "next/link";

interface FormData {
  studioName: string;
  location: string;
  // Fixed costs
  rent: number;
  utilities: number;
  insurance: number;
  software: number;
  marketing: number;
  otherFixed: number;
  // Instructor costs
  numInstructors: number;
  avgPay: number;
  classesPerWeek: number;
  ownerSalary: number;
  // Revenue
  unlimitedMembers: number;
  unlimitedPrice: number;
  classPackSales: number;
  classPackPrice: number;
  dropIns: number;
  dropInPrice: number;
  workshops: number;
  retail: number;
  privates: number;
  otherRevenue: number;
}

interface Results {
  fixedCosts: number;
  instructorCosts: number;
  totalExpenses: number;
  unlimitedRev: number;
  packRev: number;
  dropInRev: number;
  otherRev: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  revenuePerClass: number;
  recommendations: string[];
}

const DEFAULT: FormData = {
  studioName: "",
  location: "",
  rent: 3000,
  utilities: 300,
  insurance: 200,
  software: 150,
  marketing: 500,
  otherFixed: 200,
  numInstructors: 3,
  avgPay: 40,
  classesPerWeek: 30,
  ownerSalary: 2000,
  unlimitedMembers: 50,
  unlimitedPrice: 120,
  classPackSales: 20,
  classPackPrice: 100,
  dropIns: 40,
  dropInPrice: 20,
  workshops: 500,
  retail: 300,
  privates: 800,
  otherRevenue: 0,
};

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtMoney(n: number): string {
  return (n < 0 ? "-$" : "$") + fmt(Math.abs(n));
}

function calcResults(f: FormData): Results {
  const fixedCosts = f.rent + f.utilities + f.insurance + f.software + f.marketing + f.otherFixed;
  const instructorCosts = f.avgPay * f.classesPerWeek * 4.33;
  const totalExpenses = fixedCosts + instructorCosts + f.ownerSalary;

  const unlimitedRev = f.unlimitedMembers * f.unlimitedPrice;
  const packRev = f.classPackSales * f.classPackPrice;
  const dropInRev = f.dropIns * f.dropInPrice;
  const otherRev = f.workshops + f.retail + f.privates + f.otherRevenue;
  const totalRevenue = unlimitedRev + packRev + dropInRev + otherRev;

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const revenuePerClass = f.classesPerWeek > 0 ? totalRevenue / (f.classesPerWeek * 4.33) : 0;

  const recommendations: string[] = [];

  if (netProfit < 0) {
    recommendations.push("Your studio is operating at a loss. Priority: increase revenue or cut costs.");
  }
  if (profitMargin < 10 && netProfit >= 0) {
    recommendations.push("Profit margin under 10% is concerning. Industry benchmark is 20–30%.");
  }
  if (profitMargin >= 20 && profitMargin < 30) {
    recommendations.push("Good progress! You're in a healthy range. Focus on scaling memberships.");
  }
  if (profitMargin >= 30) {
    recommendations.push("Excellent! You're above the industry benchmark of 20–30%.");
  }
  if (f.unlimitedMembers < 30) {
    recommendations.push("Memberships under 30 means unstable recurring revenue. Run a conversion campaign.");
  }
  if (f.unlimitedMembers >= 50) {
    recommendations.push("Great membership base. Focus on retention with community events.");
  }
  if (revenuePerClass < 150) {
    recommendations.push("Low revenue per class. Consider increasing class sizes or prices.");
  }
  if (f.ownerSalary === 0) {
    recommendations.push("You're not paying yourself! Set a target owner salary, even if small.");
  }
  if (totalRevenue > 0 && instructorCosts / totalRevenue > 0.35) {
    recommendations.push("Instructor costs are above 35% of revenue. Review scheduling efficiency.");
  }
  if (totalRevenue > 0 && dropInRev / totalRevenue > 0.4) {
    recommendations.push("Over 40% of revenue from drop-ins is risky. Convert them to memberships.");
  }

  return {
    fixedCosts,
    instructorCosts,
    totalExpenses,
    unlimitedRev,
    packRev,
    dropInRev,
    otherRev,
    totalRevenue,
    netProfit,
    profitMargin,
    revenuePerClass,
    recommendations: recommendations.slice(0, 5),
  };
}

const NumberInput = ({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helpText?: string;
}) => (
  <div>
    <label className="block font-sans text-sm font-semibold text-on-surface mb-1">
      {label}
    </label>
    {helpText && (
      <p className="font-sans text-xs text-on-surface-variant/70 mb-1.5">{helpText}</p>
    )}
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-on-surface-variant pointer-events-none">
        $
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        min={0}
        className="w-full pl-7 pr-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface focus:outline-none focus:border-primary/60"
      />
    </div>
  </div>
);

const PlainNumberInput = ({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helpText?: string;
}) => (
  <div>
    <label className="block font-sans text-sm font-semibold text-on-surface mb-1">
      {label}
    </label>
    {helpText && (
      <p className="font-sans text-xs text-on-surface-variant/70 mb-1.5">{helpText}</p>
    )}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      min={0}
      className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface focus:outline-none focus:border-primary/60"
    />
  </div>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-serif text-xl text-on-surface mb-5">{children}</h2>
);

export default function ProfitabilityCalculatorPage() {
  const [form, setForm] = useState<FormData>(DEFAULT);
  const [results, setResults] = useState<Results | null>(null);
  const [showResults, setShowResults] = useState(false);

  const set = (key: keyof FormData) => (v: number | string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  function handleCalculate() {
    const r = calcResults(form);
    setResults(r);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleRecalculate() {
    setShowResults(false);
    setResults(null);
    setTimeout(() => {
      document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

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
            Business Calculator
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">
            Studio Profitability Calculator
          </h1>
          <p className="font-sans text-on-surface-variant text-lg leading-relaxed">
            Enter your studio&apos;s numbers to see your monthly profit, margin, and personalized recommendations.
          </p>
        </div>
      </section>

      {/* Form */}
      <section id="form-section" className="pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {/* Studio Info */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionHeader>Studio Info</SectionHeader>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-1">
                  Studio Name <span className="text-on-surface-variant font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.studioName}
                  onChange={(e) => set("studioName")(e.target.value)}
                  placeholder="e.g. Sacred Ground Yoga"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-on-surface mb-1">
                  Location <span className="text-on-surface-variant font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set("location")(e.target.value)}
                  placeholder="e.g. Vancouver, BC"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-low font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>
          </div>

          {/* Fixed Costs */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionHeader>Fixed Monthly Costs</SectionHeader>
            <div className="grid sm:grid-cols-2 gap-5">
              <NumberInput label="Rent / Mortgage" value={form.rent} onChange={set("rent") as (v: number) => void} />
              <NumberInput label="Utilities" value={form.utilities} onChange={set("utilities") as (v: number) => void} />
              <NumberInput label="Insurance" value={form.insurance} onChange={set("insurance") as (v: number) => void} />
              <NumberInput label="Software / Tech" value={form.software} onChange={set("software") as (v: number) => void} />
              <NumberInput label="Marketing Budget" value={form.marketing} onChange={set("marketing") as (v: number) => void} />
              <NumberInput label="Other Fixed Costs" value={form.otherFixed} onChange={set("otherFixed") as (v: number) => void} />
            </div>
          </div>

          {/* Instructor Costs */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionHeader>Instructor Costs</SectionHeader>
            <div className="grid sm:grid-cols-2 gap-5">
              <PlainNumberInput
                label="Number of Instructors"
                value={form.numInstructors}
                onChange={set("numInstructors") as (v: number) => void}
              />
              <NumberInput
                label="Average Pay Per Class"
                value={form.avgPay}
                onChange={set("avgPay") as (v: number) => void}
              />
              <PlainNumberInput
                label="Total Classes Per Week"
                value={form.classesPerWeek}
                onChange={set("classesPerWeek") as (v: number) => void}
              />
              <NumberInput
                label="Owner Salary"
                value={form.ownerSalary}
                onChange={set("ownerSalary") as (v: number) => void}
                helpText="Enter 0 if not paying yourself yet"
              />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionHeader>Monthly Revenue</SectionHeader>
            <div className="grid sm:grid-cols-2 gap-5">
              <PlainNumberInput
                label="Unlimited Membership Members"
                value={form.unlimitedMembers}
                onChange={set("unlimitedMembers") as (v: number) => void}
              />
              <NumberInput
                label="Monthly Unlimited Price"
                value={form.unlimitedPrice}
                onChange={set("unlimitedPrice") as (v: number) => void}
              />
              <PlainNumberInput
                label="Class Pack Sales / Month"
                value={form.classPackSales}
                onChange={set("classPackSales") as (v: number) => void}
              />
              <NumberInput
                label="Average Class Pack Price"
                value={form.classPackPrice}
                onChange={set("classPackPrice") as (v: number) => void}
              />
              <PlainNumberInput
                label="Drop-ins Per Month"
                value={form.dropIns}
                onChange={set("dropIns") as (v: number) => void}
              />
              <NumberInput
                label="Drop-in Price"
                value={form.dropInPrice}
                onChange={set("dropInPrice") as (v: number) => void}
              />
              <NumberInput
                label="Workshop Revenue"
                value={form.workshops}
                onChange={set("workshops") as (v: number) => void}
              />
              <NumberInput
                label="Retail Sales"
                value={form.retail}
                onChange={set("retail") as (v: number) => void}
              />
              <NumberInput
                label="Private Sessions Revenue"
                value={form.privates}
                onChange={set("privates") as (v: number) => void}
              />
              <NumberInput
                label="Other Revenue"
                value={form.otherRevenue}
                onChange={set("otherRevenue") as (v: number) => void}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full rounded-full py-4 text-white font-semibold font-sans text-base"
            style={{
              background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
            }}
          >
            Calculate Profitability
          </button>
        </div>
      </section>

      {/* Results */}
      {showResults && results && (
        <section id="results-section" className="pb-24 bg-surface-low">
          <div className="max-w-3xl mx-auto px-6 pt-16 space-y-6">
            <div className="mb-2">
              <h2 className="font-serif text-3xl text-on-surface mb-1">
                {form.studioName ? `${form.studioName} — ` : ""}Monthly Results
              </h2>
              {form.location && (
                <p className="font-sans text-sm text-on-surface-variant">{form.location}</p>
              )}
            </div>

            {/* Net Profit headline */}
            <div className="bg-surface-card rounded-2xl p-8 text-center">
              <p className="font-sans text-sm font-bold tracking-widest uppercase text-on-surface-variant mb-2">
                Net Monthly {results.netProfit >= 0 ? "Profit" : "Loss"}
              </p>
              <p
                className={`font-serif text-5xl font-bold ${
                  results.netProfit >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {fmtMoney(results.netProfit)}
              </p>
              <p className="font-sans text-sm text-on-surface-variant mt-2">per month</p>
            </div>

            {/* 4-metric grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: fmtMoney(results.totalRevenue) },
                { label: "Total Expenses", value: fmtMoney(results.totalExpenses) },
                {
                  label: "Profit Margin",
                  value: `${results.profitMargin.toFixed(1)}%`,
                },
                {
                  label: "Revenue / Class",
                  value: fmtMoney(results.revenuePerClass),
                },
              ].map((m) => (
                <div key={m.label} className="bg-surface-card rounded-2xl p-5 text-center">
                  <p className="font-sans text-xs text-on-surface-variant mb-2">{m.label}</p>
                  <p className="font-serif text-xl font-bold text-on-surface">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue breakdown */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h3 className="font-serif text-xl text-on-surface mb-5">Revenue Breakdown</h3>

              {/* Visual bar */}
              {results.totalRevenue > 0 && (
                <div className="mb-6">
                  <div className="flex rounded-full overflow-hidden h-4 mb-3">
                    {[
                      { value: results.unlimitedRev, color: "bg-[#536046]" },
                      { value: results.packRev, color: "bg-[#7a9b6a]" },
                      { value: results.dropInRev, color: "bg-[#a8c498]" },
                      { value: results.otherRev, color: "bg-[#dde5d4]" },
                    ]
                      .filter((s) => s.value > 0)
                      .map((s, i) => (
                        <div
                          key={i}
                          className={`${s.color} h-full`}
                          style={{ width: `${(s.value / results.totalRevenue) * 100}%` }}
                        />
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {[
                      { label: "Unlimited", color: "bg-[#536046]" },
                      { label: "Class Packs", color: "bg-[#7a9b6a]" },
                      { label: "Drop-ins", color: "bg-[#a8c498]" },
                      { label: "Other", color: "bg-[#dde5d4] border border-outline-variant/40" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${l.color} shrink-0`} />
                        <span className="font-sans text-xs text-on-surface-variant">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/40">
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-left pb-3">
                      Category
                    </th>
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-right pb-3">
                      Amount
                    </th>
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-right pb-3">
                      % of Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { label: "Unlimited Memberships", value: results.unlimitedRev },
                    { label: "Class Packs", value: results.packRev },
                    { label: "Drop-ins", value: results.dropInRev },
                    {
                      label: "Workshops, Retail & Other",
                      value: results.otherRev,
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="font-sans text-sm text-on-surface py-3">{row.label}</td>
                      <td className="font-sans text-sm text-on-surface text-right py-3 font-medium">
                        {fmtMoney(row.value)}
                      </td>
                      <td className="font-sans text-sm text-on-surface-variant text-right py-3">
                        {results.totalRevenue > 0
                          ? `${((row.value / results.totalRevenue) * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-outline-variant/60">
                    <td className="font-sans text-sm font-bold text-on-surface py-3">
                      Total Revenue
                    </td>
                    <td className="font-sans text-sm font-bold text-on-surface text-right py-3">
                      {fmtMoney(results.totalRevenue)}
                    </td>
                    <td className="font-sans text-sm text-on-surface-variant text-right py-3">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expense breakdown */}
            <div className="bg-surface-card rounded-2xl p-8">
              <h3 className="font-serif text-xl text-on-surface mb-5">Expense Breakdown</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/40">
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-left pb-3">
                      Category
                    </th>
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-right pb-3">
                      Amount
                    </th>
                    <th className="font-sans text-xs font-semibold text-on-surface-variant text-right pb-3">
                      % of Expenses
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { label: "Fixed Costs", value: results.fixedCosts },
                    { label: "Instructor Pay", value: results.instructorCosts },
                    { label: "Owner Salary", value: form.ownerSalary },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="font-sans text-sm text-on-surface py-3">{row.label}</td>
                      <td className="font-sans text-sm text-on-surface text-right py-3 font-medium">
                        {fmtMoney(row.value)}
                      </td>
                      <td className="font-sans text-sm text-on-surface-variant text-right py-3">
                        {results.totalExpenses > 0
                          ? `${((row.value / results.totalExpenses) * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-outline-variant/60">
                    <td className="font-sans text-sm font-bold text-on-surface py-3">
                      Total Expenses
                    </td>
                    <td className="font-sans text-sm font-bold text-on-surface text-right py-3">
                      {fmtMoney(results.totalExpenses)}
                    </td>
                    <td className="font-sans text-sm text-on-surface-variant text-right py-3">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-surface-card rounded-2xl p-8">
                <h3 className="font-serif text-xl text-on-surface mb-5">
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-secondary-container/30 rounded-xl p-4"
                    >
                      <span className="text-primary font-bold font-sans text-base shrink-0 mt-0.5">
                        →
                      </span>
                      <p className="font-sans text-sm text-on-surface leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recalculate */}
            <button
              onClick={handleRecalculate}
              className="w-full rounded-full py-4 font-semibold font-sans text-base border border-outline-variant/60 text-on-surface-variant hover:border-primary/40 transition-colors bg-surface-card"
            >
              Recalculate with Different Numbers
            </button>

            {/* CTA */}
            <div className="bg-secondary-container/40 rounded-2xl p-8 text-center">
              <h3 className="font-serif text-xl text-on-surface mb-2">
                Want help growing your studio&apos;s revenue?
              </h3>
              <p className="font-sans text-sm text-on-surface-variant mb-5">
                List your studio on Yoga Founders Network and reach thousands of students looking for their next practice.
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
