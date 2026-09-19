import {
  ArrowRight,
  Clock3,
  IndianRupee,
  Navigation,
  Plane,
  Route,
} from "lucide-react";

function TransportCard({ transport }) {
  return (
    <div className="tp-card h-full rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="tp-eyebrow text-primary">
            Getting there
          </div>

          <h3 className="mt-3 text-xl font-semibold">
            Transport
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <Plane size={19} />
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-base-content/8 bg-base-200/40 p-5">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-semibold">
              Recommended mode
            </div>

            <div className="mt-1 text-2xl font-semibold tracking-tight text-primary">
              {transport.mode}
            </div>
          </div>

          <ArrowRight
            size={20}
            className="ml-auto text-base-content/20"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat
          icon={Route}
          label="Distance"
          value={
            transport.distanceKm
              ? `${Math.round(transport.distanceKm)} km`
              : "—"
          }
        />

        <Stat
          icon={Clock3}
          label="Duration"
          value={transport.duration || "—"}
        />

        <Stat
          icon={IndianRupee}
          label="Estimated"
          value={
            transport.estimatedCost
              ? `₹${transport.estimatedCost.toLocaleString(
                  "en-IN"
                )}`
              : "—"
          }
        />
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-base-content/40">
        <Navigation size={13} />
        Based on your origin and destination
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-base-content/8 bg-base-200/30 p-3">
      <Icon
        size={15}
        className="text-secondary"
      />

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-base-content/35">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5">
        {value}
      </p>
    </div>
  );
}

export default TransportCard;