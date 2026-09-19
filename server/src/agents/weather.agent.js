import GeminiService from "../services/gemini.service.js";

import { weatherTool } from "../tools/weather.tool.js";
import { weatherSystemPrompt } from "../prompts/weather.prompt.js";
import { WeatherSchema } from "../schema/weather.schema.js";

export async function weatherAgent(state) {
  const forecast = await weatherTool.invoke({
    lat: state.destinationContext.lat,
    lon: state.destinationContext.lon,
    days: state.days,
  });

  const userPrompt = `
Forecast:
${JSON.stringify(forecast, null, 2)}

Itinerary:
${JSON.stringify(state.itinerary, null, 2)}
`;
console.log('8');
  const weather = await GeminiService.generateStructured(
    weatherSystemPrompt,
    userPrompt,
    WeatherSchema
  );
 console.log('9');
  return {
    weather,
    currentStep: "optimizer",
    trace: ["Weather"],
  };
}