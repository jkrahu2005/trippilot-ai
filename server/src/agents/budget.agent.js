import GeminiService from "../services/gemini.service.js";

import { budgetSystemPrompt } from "../prompts/budget.prompt.js";
import { BudgetSchema } from "../schema/budget.schema.js";

import { placeSearchTool } from "../tools/placeSearch.tool.js";
import { destinationContextTool } from "../tools/destinationContext.tool.js";

import { withTimeout } from "../utils/timeout.js";

export async function budgetAgent(state) {
  /* =========================================================
     1. GET DESTINATION COORDINATES
     Reuse coordinates already present in graph state.
     ========================================================= */

  const destinationContext =
    state.destinationContext?.lat !== null &&
    state.destinationContext?.lat !== undefined
      ? state.destinationContext
      : await destinationContextTool.invoke({
          destination: state.destination,
        });

  /* =========================================================
     2. SEARCH DESTINATION PLACES IN PARALLEL
     Hotels + Restaurants + Attractions
     ========================================================= */

  const results = await Promise.allSettled([
    // Hotels
    withTimeout(
      placeSearchTool.invoke({
        destination: state.destination,
        lat: destinationContext.lat,
        lon: destinationContext.lon,
        kind: "hotels",
      }),
      5000,
      "Hotel Tool"
    ),

    // Restaurants
    withTimeout(
      placeSearchTool.invoke({
        destination: state.destination,
        lat: destinationContext.lat,
        lon: destinationContext.lon,
        kind: "restaurants",
      }),
      5000,
      "Restaurant Tool"
    ),

    // Attractions
    withTimeout(
      placeSearchTool.invoke({
        destination: state.destination,
        lat: destinationContext.lat,
        lon: destinationContext.lon,
        kind: "interesting_places",
      }),
      5000,
      "Attraction Tool"
    ),
  ]);

  /* =========================================================
     3. EXTRACT SUCCESSFUL RESULTS
     Fallback to empty arrays if an individual tool fails.
     ========================================================= */

  const hotels =
    results[0].status === "fulfilled"
      ? results[0].value?.results || []
      : [];

  const restaurants =
    results[1].status === "fulfilled"
      ? results[1].value?.results || []
      : [];

  const attractions =
    results[2].status === "fulfilled"
      ? results[2].value?.results || []
      : [];

  /* =========================================================
     4. DEBUG LOGS
     ========================================================= */

  console.log("Hotels:", hotels.length);
  console.log("Restaurants:", restaurants.length);
  console.log("Attractions:", attractions.length);

  /* =========================================================
     5. GEMINI BUDGET PROMPT
     ========================================================= */

  const userPrompt = `
Destination: ${state.destination}
Days: ${state.days}

Coordinates:
Latitude: ${destinationContext.lat}
Longitude: ${destinationContext.lon}

Interests:
${state.interests?.join(", ") || "General sightseeing"}

Transport:
${JSON.stringify(state.transport, null, 2)}

Itinerary:
${JSON.stringify(state.itinerary, null, 2)}

Hotels:
${JSON.stringify(hotels, null, 2)}

Restaurants:
${JSON.stringify(restaurants, null, 2)}

Attractions:
${JSON.stringify(attractions, null, 2)}

Estimate a realistic travel budget in INR.

Important:
- accommodation = estimated hotel/accommodation cost
- food = estimated food cost
- localTransport = transport within the destination
- activities = estimated attraction/activity expenses
- Do NOT include origin-to-destination transport inside these four categories.
- Origin-to-destination transport will be added separately from the transport agent.
- If any category has no available place data, estimate conservatively.
`;

  console.log("Budget Agent → Gemini");

  /* =========================================================
     6. GENERATE STRUCTURED BUDGET
     ========================================================= */

  const budget = await GeminiService.generateStructured(
    budgetSystemPrompt,
    userPrompt,
    BudgetSchema
  );

  /* =========================================================
     7. FINAL TOTAL
     
     Local expenses
     +
     Origin → Destination transport
     ========================================================= */

  budget.total =
    budget.accommodation +
    budget.food +
    budget.localTransport +
    budget.activities +
    (state.transport?.estimatedCost || 0);

  console.log("Final Budget:", budget.total);

  /* =========================================================
     8. RETURN UPDATED STATE
     ========================================================= */

  return {
    budget,

    destinationContext,

    /*
     * These are the actual OpenTripMap results used by
     * the budget agent and are now exposed to the frontend.
     */
    recommendations: {
      hotels,
      restaurants,
      attractions,
    },

    currentStep: "weather",

    trace: ["Budget"],
  };
}