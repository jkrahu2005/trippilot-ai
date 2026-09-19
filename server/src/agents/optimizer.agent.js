import GeminiService from "../services/gemini.service.js";

import { optimizerSystemPrompt } from "../prompts/optimizer.prompt.js";
import { OptimizerSchema } from "../schema/optimizer.schema.js";

export async function optimizerAgent(state) {
  const userPrompt = `
Itinerary:
${JSON.stringify(state.itinerary, null, 2)}

Weather:
${JSON.stringify(state.weather, null, 2)}

Transport:
${JSON.stringify(state.transport, null, 2)}

Budget:
${JSON.stringify(state.budget, null, 2)}
`;
console.log("moving to do")
  const optimized = await GeminiService.generateStructured(
    optimizerSystemPrompt,
    userPrompt,
    OptimizerSchema
  );
  console.log("doing the task")

  return {
    optimizedItinerary: optimized.optimizedItinerary,
    changes: optimized.changes,
    currentStep: "done",
    trace: ["Optimizer"],
  };
}