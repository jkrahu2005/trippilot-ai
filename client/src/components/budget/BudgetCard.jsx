import {
  BedDouble,
  Car,
  Coffee,
  IndianRupee,
  Ticket,
  Wallet,
} from "lucide-react";

const categories = [
  {
    key: "accommodation",
    label: "Accommodation",
    icon: BedDouble,
  },
  {
    key: "food",
    label: "Food",
    icon: Coffee,
  },
  {
    key: "localTransport",
    label: "Local transport",
    icon: Car,
  },
  {
    key: "activities",
    label: "Activities",
    icon: Ticket,
  },
];

function BudgetCard({ budget }) {
  const total = Number(budget.total) || 0;

  return (
    <div className="tp-card overflow-hidden rounded-[1.75rem]">
      <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
        {/* Main total */}
        <div className="relative overflow-hidden bg-neutral p-7 text-neutral-content sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-content/8">
              <Wallet size={19} />
            </div>

            <div className="tp-eyebrow mt-8 text-accent">
              Estimated total
            </div>

            <div className="mt-3 flex items-center gap-1 text-4xl font-semibold tracking-[-0.04em]">
              <IndianRupee size={27} />
              {total.toLocaleString("en-IN")}
            </div>

            <p className="mt-4 max-w-xs text-xs leading-5 text-neutral-content/50">
              Includes destination spending and estimated
              inter-city transport.
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const amount =
                Number(budget[category.key]) || 0;

              const percentage =
                total > 0
                  ? Math.round((amount / total) * 100)
                  : 0;

              return (
                <div
                  key={category.key}
                  className="rounded-2xl border border-base-content/8 bg-base-200/35 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <Icon size={16} />
                    </div>

                    <span className="text-xs font-medium text-base-content/35">
                      {percentage}%
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-base-content/40">
                    {category.label}
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    ₹{amount.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetCard;