import {
  Check,
  ChevronRight,
  Cpu,
} from "lucide-react";

function AgentTrace({ trace }) {
  const uniqueTrace = [...new Set(trace)];

  return (
    <div className="tp-card rounded-[1.5rem] px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Cpu size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Agent journey
            </p>

            <p className="text-[11px] text-base-content/40">
              {uniqueTrace.length} stages completed
            </p>
          </div>
        </div>

        <div className="hidden h-px flex-1 bg-base-content/8 lg:block" />

        <div className="flex flex-wrap items-center gap-2">
          {uniqueTrace.map((agent, index) => (
            <div
              key={`${agent}-${index}`}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 rounded-full border border-base-content/8 bg-base-200/40 px-3 py-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check size={10} strokeWidth={2.7} />
                </span>

                <span className="text-xs font-medium text-base-content/65">
                  {agent}
                </span>
              </div>

              {index !== uniqueTrace.length - 1 && (
                <ChevronRight
                  size={13}
                  className="text-base-content/25"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgentTrace;