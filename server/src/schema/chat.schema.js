import { z } from "zod";

export const ChatIntakeSchema = z.object({
  draft: z.object({
    destination: z.string().describe("Destination city/place, or empty string if unknown"),
    origin: z.string().describe("Starting/origin city/place, or empty string if unknown"),
    days: z.number().int().describe("Trip duration in days, or 0 if unknown"),
    travelers: z.number().int().describe("Number of travellers, or 0 if unknown"),
    budget: z.number().describe("Budget in INR, or 0 if unknown/no cap"),
    interests: z.array(z.string()).describe("Interests/themes, may be empty"),
    startDate: z.string().describe("Travel window/date text, or empty if unknown"),
    hotelPreference: z.string().describe("Stay preference, or empty if unknown"),
    pace: z.string().describe("Relaxed, Balanced or Packed, or empty if unknown"),
    notes: z.array(z.string()).describe("Extra notes, may be empty"),
  }),
  reply: z.string().describe("Friendly assistant reply to the user"),
  nextField: z
    .enum([
      "destination",
      "origin",
      "days",
      "travelers",
      "budget",
      "interests",
      "startDate",
      "hotelPreference",
      "pace",
      "done",
    ])
    .describe("Next missing field to ask about, or done if ready to build"),
  updates: z.array(z.string()).describe("Field names updated from this message"),
});
