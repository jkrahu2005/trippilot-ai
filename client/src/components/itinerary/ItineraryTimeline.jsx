import {
  Clock3,
  Moon,
  Sun,
  Sunset,
} from "lucide-react";

const slots = [
  {
    key: "morning",
    label: "Morning",
    icon: Sun,
  },
  {
    key: "afternoon",
    label: "Afternoon",
    icon: Sunset,
  },
  {
    key: "evening",
    label: "Evening",
    icon: Moon,
  },
];

function ItineraryTimeline({ itinerary }) {
  return (
    <div className="space-y-5">
      {itinerary.days.map((day) => (
        <DayCard key={day.day} day={day} />
      ))}
    </div>
  );
}

function DayCard({ day }) {
  return (
    <article className="tp-card overflow-hidden rounded-[1.75rem]">
      <div className="border-b border-base-content/8 px-6 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="tp-eyebrow text-primary">
              Day {day.day}
            </div>

            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              Day {day.day} of your journey
            </h3>
          </div>

          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-sm font-semibold text-primary sm:flex">
            {String(day.day).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3">
        {slots.map((slot, index) => {
          const activity = day[slot.key];
          const Icon = slot.icon;

          return (
            <div
              key={slot.key}
              className={`relative p-6 sm:p-7 ${
                index > 0
                  ? "border-t border-base-content/8 lg:border-l lg:border-t-0"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-base-content/40">
                  <Icon
                    size={15}
                    className="text-secondary"
                  />

                  {slot.label}
                </div>

                {activity?.duration && (
                  <div className="flex items-center gap-1 text-[11px] text-base-content/35">
                    <Clock3 size={12} />
                    {activity.duration}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h4 className="text-base font-semibold leading-6">
                  {activity?.activity || "Free time"}
                </h4>

                <p className="mt-3 text-sm leading-6 text-base-content/50">
                  A curated part of your Day {day.day} plan.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default ItineraryTimeline;