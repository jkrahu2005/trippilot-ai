import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

function TripHeader({
  origin,
  destination,
  days,
  interests,
}) {
  return (
    <div className="tp-card relative overflow-hidden rounded-[2rem] p-7 sm:p-9 lg:p-10">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-base-content/40">
          <Sparkles size={14} className="text-primary" />
          Trip generated
        </div>

        <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {origin}
              </div>

              <ArrowRight
                className="hidden text-base-content/25 sm:block"
                size={24}
              />

              <div className="text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl">
                {destination}
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-base-content/55 sm:text-base">
              TripPilot coordinated your itinerary using destination
              context, transport, budget, weather and optimization.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-base-content/8 bg-base-200/45 px-4 py-3">
            <CalendarDays
              size={18}
              className="text-primary"
            />

            <div>
              <div className="text-lg font-semibold">
                {days}
              </div>

              <div className="text-[10px] uppercase tracking-[0.14em] text-base-content/40">
                days
              </div>
            </div>
          </div>
        </div>

        {interests.length > 0 && (
          <div className="mt-7 border-t border-base-content/8 pt-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-base-content/40">
              Built around
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium capitalize text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center gap-2 text-xs text-base-content/40">
          <MapPin size={13} />
          Personalized for your journey
        </div>
      </div>
    </div>
  );
}

export default TripHeader;