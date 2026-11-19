import { useMemo, useState } from "react";
import {
  BedDouble,
  Bus,
  Check,
  LoaderCircle,
  MapPin,
  Plane,
  Sparkles,
  Train,
  Car,
  Wand2,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";
import { customizeTripExpenses } from "../../services/trip.service";

const CATS = [
  { id: "all", label: "All expenses", icon: Sparkles, color: "#6366f1" },
  { id: "hotel", label: "Hotel / stay", icon: BedDouble, color: "#4f86c6" },
  { id: "activities", label: "Places & activities", icon: MapPin, color: "#c6844f" },
  { id: "transport", label: "Transport", icon: Bus, color: "#6b9e5e" },
  { id: "food", label: "Food & dining", icon: UtensilsCrossed, color: "#c64f7a" },
  { id: "miscellaneous", label: "Miscellaneous", icon: ShoppingBag, color: "#7a4fc6" },
];

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function modeIcon(mode = "") {
  const m = String(mode).toLowerCase();
  if (m.includes("train")) return Train;
  if (m.includes("bus")) return Bus;
  if (m.includes("car") || m.includes("cab")) return Car;
  return Plane;
}

export default function ExpenseCustomizer({
  trip,
  meta,
  defaultCategory,
  onApplyHotel,
  onApplyTransportCost,
  onApplyActivities,
  onApplyBudgetAdjustments,
  onApplyFood,
  onApplyMisc,
}) {
  const [category, setCategory] = useState(defaultCategory || "all");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const context = useMemo(
    () => ({
      origin: trip?.origin || "",
      destination: trip?.destination || "",
      days: Number(meta?.days || trip?.days || 1),
      travelers: Number(meta?.travelers || trip?.travelers || 1),
      budgetLimit: Number(meta?.budgetLimit || trip?.budgetLimit || 0),
      interests: meta?.interests || trip?.interests || [],
      currentBudget: trip?.budget || {},
      selectedTransport: trip?.selectedTransport || trip?.selectedFlight || null,
      selectedHotel: trip?.selectedHotel || null,
    }),
    [trip, meta]
  );

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const data = await customizeTripExpenses({
        category,
        instruction,
        ...context,
      });
      setResult(data);
    } catch (e) {
      setError(e?.message || "Could not customize expenses.");
    } finally {
      setLoading(false);
    }
  }

  const hotels = result?.hotels || [];
  const activities = result?.activities || [];
  const transport = result?.transport || [];
  const adjustments = result?.budgetAdjustments || {};

  return (
    <div className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-base-100 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Wand2 size={14} />
            Gemini expense dashboard
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Customize every expense with AI
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/55">
            Get personalized options and estimates for hotel/stay, places to visit & activities, and transport — then apply them to your trip.
          </p>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {loading ? "Generating…" : "Customize with Gemini"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              category === id
                ? "bg-neutral text-neutral-content"
                : "border border-base-content/10 bg-base-100 text-base-content/60 hover:text-base-content"
            }`}
          >
            {/* Colored indicator dot */}
            {color && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
              />
            )}
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-base-content/45">
          What should Gemini optimize? (optional)
        </span>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={`e.g. "budget hotels near city center", "family-friendly places", "fastest transport"`}
          className="tp-input h-11 w-full px-4 text-sm"
        />
      </label>

      {error && (
        <div className="mt-4 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-5">
          {/* Summary header for the category */}
          <div className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
            <Sparkles size={14} className="text-primary" />
            Gemini&apos;s Recommendations
            {category !== "all" && (
              <span className="text-primary">
                for {CATS.find((c) => c.id === category)?.label || category}
              </span>
            )}
          </div>

          {result.summary ? (
            <div className="rounded-xl border border-base-content/8 bg-base-100/70 px-4 py-3 text-sm leading-6 text-base-content/60">
              <strong className="text-base-content/75">Suggestion:</strong> {result.summary}
            </div>
          ) : null}

          {hotels.length > 0 && (
            <Section title="Hotel / stay options" icon={BedDouble}>
              <div className="grid gap-3 sm:grid-cols-2">
                {hotels.map((h, i) => (
                  <div key={i} className="rounded-2xl border border-base-content/8 bg-base-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{h.name}</div>
                        <div className="mt-0.5 text-[11px] text-base-content/45">
                          {[h.area, h.amenities].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">{rupees(h.estimatedStayCost || h.nightlyRate)}</div>
                        <div className="text-[10px] text-base-content/40">{h.estimatedStayCost ? "stay" : "/night"}</div>
                      </div>
                    </div>
                    {h.reason ? <p className="mt-2 text-[11px] leading-5 text-base-content/50">{h.reason}</p> : null}
                    <button
                      type="button"
                      onClick={() => onApplyHotel(h)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/5 px-3 py-1.5 text-[11px] font-semibold text-secondary transition hover:bg-secondary/10"
                    >
                      <Check size={12} /> Apply this hotel
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {activities.length > 0 && (
            <Section title="Places to visit & activities" icon={MapPin}>
              <div className="space-y-2">
                {activities.map((a, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-xl border border-base-content/8 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {a.title} {a.day ? <span className="text-base-content/40 font-medium">· Day {a.day}</span> : null}
                      </div>
                      <div className="mt-0.5 text-[11px] text-base-content/45">
                        {[a.place, a.note].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-primary">{rupees(a.estimatedCost)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onApplyActivities(activities)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-2 text-xs font-semibold text-base-content transition hover:bg-accent/25"
                >
                  <Check size={13} /> Apply activities cost ({rupees(activities.reduce((s, a) => s + (Number(a.estimatedCost) || 0), 0))})
                </button>
              </div>
            </Section>
          )}

          {transport.length > 0 && (
            <Section title="Transport options" icon={Bus}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {transport.map((t, i) => {
                  const Icon = modeIcon(t.mode);
                  return (
                    <div key={i} className="rounded-2xl border border-base-content/8 bg-base-100 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200 text-base-content/60">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{t.mode}</div>
                          <div className="text-[11px] text-base-content/45">{t.provider || "Suggested option"}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-sm font-semibold">{rupees(t.estimatedCost)}</div>
                          <div className="text-[10px] text-base-content/40">{t.duration || "estimate"}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onApplyTransportCost(t)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                        >
                          <Check size={12} /> Apply
                        </button>
                      </div>
                      {t.reason ? <p className="mt-2 text-[11px] leading-5 text-base-content/50">{t.reason}</p> : null}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {(Object.keys(adjustments).length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3">
              <div className="text-sm text-base-content/65">
                Gemini can also balance your full budget breakdown.
              </div>
              <button
                type="button"
                onClick={() => onApplyBudgetAdjustments(adjustments)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-content"
              >
                <Check size={13} /> Apply suggested budget
              </button>
            </div>
          )}

          {/* Apply all suggestions button */}
          {(hotels.length > 0 || activities.length > 0 || transport.length > 0) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  if (hotels.length > 0 && onApplyHotel) onApplyHotel(hotels[0]);
                  if (activities.length > 0 && onApplyActivities) onApplyActivities(activities);
                  if (transport.length > 0 && onApplyTransportCost) onApplyTransportCost(transport[0]);
                  if (Object.keys(adjustments).length > 0 && onApplyBudgetAdjustments) onApplyBudgetAdjustments(adjustments);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-content transition hover:-translate-y-0.5"
              >
                <Check size={13} /> Apply all suggestions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-base-content/50">
        <Icon size={13} />
        {title}
      </div>
      {children}
    </div>
  );
}
