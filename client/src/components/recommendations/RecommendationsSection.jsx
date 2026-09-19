import { Compass, Hotel, MapPinned, Utensils } from "lucide-react";

import RecommendationCard from "./RecommendationCard";

function RecommendationsSection({
  recommendations,
}) {
  if (!recommendations) {
    return null;
  }

  const hotels = recommendations.hotels || [];
  const restaurants = recommendations.restaurants || [];
  const attractions =
    recommendations.attractions || [];

  const hasResults =
    hotels.length ||
    restaurants.length ||
    attractions.length;

  if (!hasResults) {
    return null;
  }

  return (
    <section className="mt-10">
      <div>
        <div className="tp-eyebrow text-primary">
          Discover
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Places worth knowing.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/55">
          TripPilot pulled together useful places around your
          destination to help turn the itinerary into a real trip.
        </p>
      </div>

      {/* Attractions */}
      {attractions.length > 0 && (
        <RecommendationGroup
          icon={Compass}
          eyebrow="Explore"
          title="Places to visit"
          items={attractions}
          type="attraction"
        />
      )}

      {/* Hotels */}
      {hotels.length > 0 && (
        <RecommendationGroup
          icon={Hotel}
          eyebrow="Stay"
          title="Where you could stay"
          items={hotels}
          type="hotel"
        />
      )}

      {/* Restaurants */}
      {restaurants.length > 0 && (
        <RecommendationGroup
          icon={Utensils}
          eyebrow="Taste"
          title="Places to eat"
          items={restaurants}
          type="restaurant"
        />
      )}
    </section>
  );
}

function RecommendationGroup({
  icon: Icon,
  eyebrow,
  title,
  items,
  type,
}) {
  return (
    <div className="mt-7">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon size={17} />
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-base-content/35">
            {eyebrow}
          </div>

          <h3 className="mt-0.5 text-lg font-semibold">
            {title}
          </h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item, index) => (
          <RecommendationCard
            key={
              item.xid ||
              item.id ||
              `${type}-${index}`
            }
            item={item}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

export default RecommendationsSection;