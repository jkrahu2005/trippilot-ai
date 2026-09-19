import { z } from "zod";

export const TransportSchema = z.object({
  mode: z.string(),
  distanceKm: z.number(),
  duration: z.string(),
  estimatedCost: z.number(),
});