import {
  CloudRain,
  CloudSun,
  Droplets,
  Thermometer,
} from "lucide-react";

function WeatherCard({ weather }) {
  return (
    <div className="tp-card rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="tp-eyebrow text-secondary">
            Forecast
          </div>

          <h3 className="mt-3 text-xl font-semibold">
            Weather-aware planning
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <CloudSun size={20} />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {weather.days.map((day) => {
          const rainy = day.rainChance >= 60;

          return (
            <div
              key={day.day}
              className="rounded-2xl border border-base-content/8 bg-base-200/35 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-100">
                  {rainy ? (
                    <CloudRain
                      size={18}
                      className="text-info"
                    />
                  ) : (
                    <CloudSun
                      size={18}
                      className="text-accent"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      Day {day.day}
                    </p>

                    <p className="text-xs font-medium text-base-content/55">
                      {day.rainChance}% rain
                    </p>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-base-content/45">
                    <span className="flex items-center gap-1">
                      <Thermometer size={12} />
                      {day.minTemp}° — {day.maxTemp}°
                    </span>

                    <span className="flex items-center gap-1">
                      <Droplets size={12} />
                      {rainy ? "Pack rain gear" : "Good outdoor window"}
                    </span>
                  </div>
                </div>
              </div>

              {day.advice && (
                <div className="mt-4 border-t border-base-content/6 pt-3 text-xs leading-5 text-base-content/50">
                  {day.advice}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherCard;