import { z } from "zod";

export const OptimizerSchema = z.object({
  optimizedItinerary: z.object({
    days: z.array(
      z.object({
        day: z.number(),
        morning: z.object({
          activity: z.string(),
          duration: z.string(),
        }),
        afternoon: z.object({
          activity: z.string(),
          duration: z.string(),
        }),
        evening: z.object({
          activity: z.string(),
          duration: z.string(),
        }),
      })
    ),
  }),

  changes: z.array(
    z.object({
      day: z.number(),
      reason: z.string(),
      original: z.string(),
      updated: z.string(),
    })
  ),
});