import { z } from "zod";

export const WeatherSchema = z.object({
  days: z.array(
    z.object({
      day: z.number(),
      maxTemp: z.number(),
      minTemp: z.number(),
      rainChance: z.number(),
      advice: z.string(),
    })
  ),
});