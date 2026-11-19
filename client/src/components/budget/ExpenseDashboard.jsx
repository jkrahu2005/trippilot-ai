import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BedDouble,
  Bus,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Check,
  Wand2,
  ArrowRight,
  Ticket,
  IndianRupee,
} from "lucide-react";
import ExpenseCustomizer from "./ExpenseCustomizer";

/* =========================================================
   EXPENSE DASHBOARD
   Full-featured AI expense dashboard with pie chart,
   per-category customization, and Finalize CTA.
   ========================================================= */

const CATEGORIES = [
  {
    id: "hotel",
    label: "Hotel / Stay",
    icon: BedDouble,
    color: "#4f86c6",
    budgetKey: "accommodation",
    emoji: "🏨",
  },
  {
    id: "transport",
    label: "Inter-city Transport",
    icon: Bus,
    color: "#6b9e5e",
    budgetKey: "_intercity",
    emoji: "✈️",
  },
  {
    id: "activities",
    label: "Places & Activities",
    icon: MapPin,
    color: "#c6844f",
    budgetKey: "activities",
    emoji: "🎭",
  },
  {
    id: "food",
    label: "Food & Dining",
    icon: UtensilsCrossed,
    color: "#c64f7a",
    budgetKey: "food",
    emoji: "🍽️",
  },
  {
    id: "misc",
    label: "Local Transport",
    icon: ShoppingBag,
    color: "#7a4fc6",
    budgetKey: "localTransport",
    emoji: "🚌",
  },
];

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="rounded-xl border border-base-content/10 bg-base-100 px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold">{name}</p>
        <p className="text-primary">{rupees(value)}</p>
      </div>
    );
  }
  return null;
}

export default function ExpenseDashboard({
  trip,
  meta,
  budget,
  intercityCost,
  onApplyHotel,
  onApplyTransportCost,
  onApplyActivities,
  onApplyBudgetAdjustments,
  onFinalize,
}) {
  const [activeCategory, setActiveCategory] = useState(null);

  const getBudgetValue = (cat) => {
    if (cat.id === "transport") return intercityCost || 0;
    return Number(budget[cat.budgetKey]) || 0;
  };

  const chartData = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: getBudgetValue(cat),
    color: cat.color,
    emoji: cat.emoji,
  })).filter((d) => d.value > 0);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const toggleCategory = (catId) => {
    setActiveCategory((current) => (current === catId ? null : catId));
  };

  /* Translate category id → ExpenseCustomizer category */
  const customizerCategory = (catId) => {
    const map = {
      hotel: "hotel",
      transport: "transport",
      activities: "activities",
      food: "all",
      misc: "all",
    };
    return map[catId] || "all";
  };

  return (
    <div className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/[0.03] to-base-100 p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Wand2 size={14} />
            Gemini Expense Dashboard
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Customize every expense with AI
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/55">
            Get Gemini-powered suggestions for hotel, places, transport and
            food — apply any option directly to your trip budget.
          </p>
        </div>

        {onFinalize && (
          <button
            type="button"
            onClick={onFinalize}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content transition hover:-translate-y-0.5"
          >
            <Ticket size={15} />
            Finalize &amp; Book
          </button>
        )}
      </div>

      {/* Chart + category cards */}
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Pie chart */}
        {chartData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/40 mb-3">
              Budget distribution
            </div>
            <div className="h-[220px] w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 w-full space-y-1.5">
              {chartData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-base-content/60">{d.name}</span>
                  </span>
                  <span className="font-semibold">{rupees(d.value)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-base-content/10 pt-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <IndianRupee size={12} className="text-primary" />
                  Total
                </span>
                <span className="text-primary">{rupees(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-base-content/15 text-sm text-base-content/40">
            Budget will appear here
          </div>
        )}

        {/* Category cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const value = getBudgetValue(cat);
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-primary/30 bg-primary/[0.05] shadow-sm"
                    : "border-base-content/8 bg-base-100 hover:border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${cat.color}20` }}
                  >
                    <Icon
                      size={16}
                      style={{ color: cat.color }}
                    />
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-base-content/40">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    {rupees(value)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-base-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: cat.color,
                    }}
                  />
                </div>

                <p className="mt-1.5 text-[11px] text-base-content/40">
                  {pct}% of total ·{" "}
                  <span className="text-primary font-medium">
                    {isActive ? "Close" : "Customize with Gemini →"}
                  </span>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Gemini Customizer for active category */}
      {activeCategory && (
        <div className="rounded-2xl border border-primary/15 bg-base-100 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Sparkles size={13} />
            Gemini suggestions for{" "}
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </div>
          <ExpenseCustomizer
            trip={trip}
            meta={meta}
            defaultCategory={customizerCategory(activeCategory)}
            onApplyHotel={onApplyHotel}
            onApplyTransportCost={onApplyTransportCost}
            onApplyActivities={onApplyActivities}
            onApplyBudgetAdjustments={onApplyBudgetAdjustments}
          />
        </div>
      )}

      {/* Finalize CTA bottom */}
      <div className="flex flex-col gap-3 rounded-2xl border border-success/20 bg-success/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            Happy with your expense plan?
          </p>
          <p className="mt-0.5 text-xs text-base-content/50">
            Lock in your itinerary, transport, and stay selections.
          </p>
        </div>
        {onFinalize && (
          <button
            type="button"
            onClick={onFinalize}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-success-content transition hover:-translate-y-0.5"
          >
            <Check size={15} />
            Confirm &amp; Book
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
