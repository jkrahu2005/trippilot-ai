import { tool } from "@langchain/core/tools";
import { z } from "zod";

async function getPlaceDetails(xid) {
  const res = await fetch(
    `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${process.env.OPENTRIPMAP_API_KEY}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch details for ${xid}`);
  }

  return await res.json();
}

export const placeSearchTool = tool(
  async ({ destination, kind }) => {
    // Map our app's categories to OpenTripMap categories
    const kindMap = {
      hotels: "accomodations,other_hotels",
      restaurants: "foods",
      interesting_places: "interesting_places",
    };

    const apiKind = kindMap[kind];

    // Step 1: Find destination coordinates
    const geoRes = await fetch(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
        destination
      )}&apikey=${process.env.OPENTRIPMAP_API_KEY}`
    );

    if (!geoRes.ok) {
      throw new Error(`Failed to geocode ${destination}`);
    }

    const geo = await geoRes.json();

    // Step 2: Search nearby places
    const placesRes = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${geo.lon}&lat=${geo.lat}&kinds=${encodeURIComponent(
        apiKind
      )}&limit=5&apikey=${process.env.OPENTRIPMAP_API_KEY}`
    );

    if (!placesRes.ok) {
      throw new Error(`Failed to search ${kind}`);
    }

    const places = await placesRes.json();

    const features = places.features || [];

    console.log(`[${kind}] Found ${features.length} places in ${destination}`);

    // Step 3: Fetch place details in parallel
    const detailedResults = await Promise.all(
      features.map(async (place) => {
        try {
          const details = await getPlaceDetails(place.properties.xid);

          return {
            name: details.name || place.properties.name || "Unknown",
            xid: details.xid,
            rating: details.rate ?? null,
            kinds: details.kinds ?? null,
            wikipedia: details.wikipedia || null,
          };
        } catch {
          // Return basic info if details API fails
          return {
            name: place.properties.name || "Unknown",
            xid: place.properties.xid,
            rating: null,
            kinds: null,
            wikipedia: null,
          };
        }
      })
    );

    return {
      destination,
      kind,
      results: detailedResults,
    };
  },
  {
    name: "place_search_tool",
    description:
      "Search hotels, restaurants, or attractions near a destination using OpenTripMap.",
    schema: z.object({
      destination: z.string(),
      kind: z.enum(["hotels", "restaurants", "interesting_places"]),
    }),
  }
);