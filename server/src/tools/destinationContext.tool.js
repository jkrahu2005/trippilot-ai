import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const destinationContextTool = tool(
  async ({ destination }) => {
    const res = await fetch(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
        destination
      )}&apikey=${process.env.OPENTRIPMAP_API_KEY}`
    );

    if (!res.ok) {
      throw new Error(`Failed to geocode ${destination}`);
    }

    const geo = await res.json();

    return {
      destination,
      lat: geo.lat,
      lon: geo.lon,
      country: geo.country || null,
    };
  },
  {
    name: "destination_context_tool",
    description: "Gets coordinates for a destination.",
    schema: z.object({
      destination: z.string(),
    }),
  }
);