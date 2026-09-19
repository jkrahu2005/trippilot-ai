import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const originContextTool = tool(
  async ({ origin }) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin)}&format=jsonv2&limit=1`,
      {
        headers: {
          "User-Agent": "TripPilot-AI",
        },
      }
    );

    const data = await res.json();

    if (!data.length) {
      throw new Error(`Could not locate ${origin}`);
    }

    return {
      origin,
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
      country: data[0].display_name,
    };
  },
  {
    name: "origin_context_tool",
    description: "Gets coordinates for the trip origin.",
    schema: z.object({
      origin: z.string(),
    }),
  }
);