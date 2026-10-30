import GeminiService from "../services/gemini.service.js";

import { weatherTool } from "../tools/weather.tool.js";
import { weatherSystemPrompt } from "../prompts/weather.prompt.js";
import { WeatherSchema } from "../schema/weather.schema.js";

export async function weatherAgent(state) {
  console.log("\n========== WEATHER AGENT ==========");

  console.log("Destination:", state.destination);

  console.log(
    "Destination Context:",
    state.destinationContext
  );

  console.log("Days:", state.days);

  // Step 1: Fetch forecast
  console.log("Calling Open-Meteo...");

  const forecast = await weatherTool.invoke({
    lat: state.destinationContext.lat,
    lon: state.destinationContext.lon,
    days: state.days,
  });

  console.log("Forecast received successfully.");

  // Step 2: Prepare Gemini prompt
  const userPrompt = `
Forecast:
${JSON.stringify(forecast, null, 2)}

Itinerary:
${JSON.stringify(state.itinerary, null, 2)}
`;

  // Step 3: Generate weather advice
  console.log("Calling Gemini for weather advice...");

  const weather = await GeminiService.generateStructured(
    weatherSystemPrompt,
    userPrompt,
    WeatherSchema
  );

  console.log("Weather advice generated successfully.");
  console.log("===================================\n");

  return {
    weather,
    currentStep: "optimizer",
    trace: ["Weather"],
  };
}