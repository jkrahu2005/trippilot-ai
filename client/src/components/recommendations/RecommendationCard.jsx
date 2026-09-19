import {
  ArrowUpRight,
  Hotel,
  MapPin,
  Utensils,
} from "lucide-react";

function RecommendationCard({
  item,
  type = "attraction",
}) {
  const Icon =
    type === "hotel"
      ? Hotel
      : type === "restaurant"
        ? Utensils
        : MapPin;

  const name =
    item.name ||
    item.title ||
    item.otm_name ||
    "Interesting place";

  const description =
    item.description ||
    item.shortDescription ||
    item.kinds ||
    "";

  const address =
    item.address ||
    item.city ||
    item.country ||
    "";

  return (
    <article className="group rounded-2xl border border-base-content/8 bg-base-200/35 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-base-200/60">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition group-hover:bg-primary group-hover:text-primary-content">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="line-clamp-2 text-sm font-semibold leading-5">
              {name}
            </h4>

            <ArrowUpRight
              size={15}
              className="shrink-0 text-base-content/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </div>

          {address && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-base-content/40">
              <MapPin
                size={12}
                className="mt-0.5 shrink-0"
              />

              <span className="line-clamp-1">
                {address}
              </span>
            </div>
          )}

          {description && (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-base-content/50">
              {description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default RecommendationCard;