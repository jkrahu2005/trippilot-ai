import { z } from "zod";

export const BudgetSchema = z.object({
  accommodation: z.number(),
  food: z.number(),
  localTransport: z.number(),
  activities: z.number(),
  total: z.number(),
});