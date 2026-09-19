import GeminiService from "../services/gemini.service.js";
import { plannerSystemPrompt } from "../prompts/planner.prompt.js";
import { ItinerarySchema } from "../schema/itinerary.schema.js";

export async function plannerAgent(state) {
  const userPrompt = `
Destination: ${state.destination}
Days: ${state.days}
Interests: ${state.interests.join(", ") || "General sightseeing"}

Generate a realistic itinerary.
`;
  console.log('2');
  const itinerary = await GeminiService.generateStructured(
    plannerSystemPrompt,
    userPrompt,
    ItinerarySchema
  );
  console.log('3');

  return {
  itinerary,
  currentStep: "transport",
  trace: ["Planner"],
};
}