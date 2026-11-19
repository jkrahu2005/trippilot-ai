import { z } from "zod";

export const customizeExpenseSchema = z.object({
  hotels: z
    .array(
      z.object({
        name: z.string(),
        area: z.string().optional().default(""),
        amenities: z.string().optional().default(""),
        nightlyRate: z.number().optional().default(0),
        estimatedStayCost: z.number().optional().default(0),
        reason: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  activities: z
    .array(
      z.object({
        title: z.string(),
        place: z.string().optional().default(""),
        day: z.number().optional().nullable(),
        estimatedCost: z.number().optional().default(0),
        note: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  transport: z
    .array(
      z.object({
        mode: z.string(),
        provider: z.string().optional().default(""),
        estimatedCost: z.number().optional().default(0),
        duration: z.string().optional().default(""),
        reason: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  budgetAdjustments: z
    .object({
      accommodation: z.number().optional(),
      activities: z.number().optional(),
      food: z.number().optional(),
      localTransport: z.number().optional(),
      intercity: z.number().optional(),
    })
    .optional()
    .default({}),
  summary: z.string().optional().default(""),
});
