import { tool } from "@langchain/core/tools";
import { z } from "zod";

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const distanceTool = tool(
  async ({ originLat, originLon, destinationLat, destinationLon }) => ({
    distanceKm: haversine(
      originLat,
      originLon,
      destinationLat,
      destinationLon
    ),
  }),
  {
    name: "distance_tool",
    description: "Calculates straight-line distance between two locations.",
    schema: z.object({
      originLat: z.number(),
      originLon: z.number(),
      destinationLat: z.number(),
      destinationLon: z.number(),
    }),
  }
);