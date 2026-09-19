import {
  ArrowRight,
  CloudRain,
  Sparkles,
} from "lucide-react";

function ChangesCard({ changes }) {
  return (
    <div className="tp-card overflow-hidden rounded-[1.75rem]">
      <div className="border-b border-base-content/8 px-6 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Sparkles size={19} />
          </div>

          <div>
            <div className="tp-eyebrow text-primary">
              Behind the plan
            </div>

            <h3 className="mt-2 text-xl font-semibold">
              What TripPilot changed
            </h3>

            <p className="mt-2 text-sm leading-6 text-base-content/50">
              The optimizer reviewed your plan against the
              trip context and made targeted adjustments.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-base-content/8">
        {changes.map((change, index) => (
          <div
            key={`${change.day}-${index}`}
            className="p-6 sm:p-7"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <CloudRain size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/35">
                    Day
                  </p>

                  <p className="text-sm font-semibold">
                    {change.day}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-base-content/65">
                  {change.reason}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="rounded-2xl border border-base-content/8 bg-base-200/35 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-base-content/35">
                      Original
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {change.original}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="hidden text-base-content/25 md:block"
                  />

                  <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary/70">
                      Updated
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {change.updated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChangesCard;