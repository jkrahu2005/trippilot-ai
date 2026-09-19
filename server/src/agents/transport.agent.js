import GeminiService from "../services/gemini.service.js";

import { originContextTool } from "../tools/originContext.tool.js";
import { destinationContextTool } from "../tools/destinationContext.tool.js";
import { distanceTool } from "../tools/distance.tool.js";

import { transportSystemPrompt } from "../prompts/transport.prompt.js";
import { TransportSchema } from "../schema/transport.schema.js";

export async function transportAgent(state) {
  // Get origin coordinates
  const originContext = await originContextTool.invoke({
    origin: state.origin,
  });

  // Reuse destination coordinates if they already exist,
  // otherwise fetch them now.
  const destinationContext =
    state.destinationContext?.lat !== null
      ? state.destinationContext
      : await destinationContextTool.invoke({
          destination: state.destination,
        });

  // Calculate distance
  const { distanceKm } = await distanceTool.invoke({
    originLat: originContext.lat,
    originLon: originContext.lon,
    destinationLat: destinationContext.lat,
    destinationLon: destinationContext.lon,
  });

  const userPrompt = `
Origin: ${state.origin}
Destination: ${state.destination}

Origin Country:
${originContext.country}

Destination Country:
${destinationContext.country}

Distance:
${distanceKm} km
`;
 console.log('4');
  const transport = await GeminiService.generateStructured(
    transportSystemPrompt,
    userPrompt,
    TransportSchema
  );
  console.log('5');

  return {
    transport: {
      ...transport,
      distanceKm,
    },
    destinationContext,
    currentStep: "budget",
    trace: ["Transport"],
  };
}