import { z } from "zod";

const ActivitySchema = z.object({
  activity: z.string(),
  duration: z.string(),
});

const DaySchema = z.object({
  day: z.number(),
  morning: ActivitySchema,
  afternoon: ActivitySchema,
  evening: ActivitySchema,
});

export const ItinerarySchema = z.object({
  days: z.array(DaySchema),
});