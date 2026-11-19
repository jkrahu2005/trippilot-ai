import GeminiService from "../services/gemini.service.js";
import { customizeExpenseSchema } from "../schema/customize.schema.js";

export async function customizeExpenses(req, res, next) {
  try {
    const {
      category = "all",
      origin = "",
      destination = "",
      days = 1,
      travelers = 1,
      budgetLimit = 0,
      interests = [],
      currentBudget = {},
      selectedTransport = null,
      selectedHotel = null,
      instruction = "",
    } = req.body || {};

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "Destination is required to customize expenses.",
      });
    }

    const systemPrompt = `You are TripPilot AI's travel cost and experience planner. Generate realistic, customizable options and estimates for a trip in Indian Rupees (INR). Return structured data matching the schema. Be specific to the destination when possible. Costs must be reasonable totals for all travellers for the whole trip unless stated otherwise. Keep names and reasons concise.`;

    const userPrompt = JSON.stringify({
      task: "Customize trip expenses and options",
      category,
      instruction,
      trip: {
        origin,
        destination,
        days: Number(days) || 1,
        travelers: Number(travelers) || 1,
        budgetLimit: Number(budgetLimit) || 0,
        interests: Array.isArray(interests) ? interests : [],
      },
      current: {
        budget: currentBudget || {},
        selectedTransport: selectedTransport || null,
        selectedHotel: selectedHotel || null,
      },
      guidance: {
        hotel: "Suggest 2-4 hotel/stay options with nightlyRate and estimatedStayCost (whole stay, all rooms).",
        activities: "Suggest 4-8 places to visit or activities with estimatedCost per activity/entry for all travellers, and day if relevant.",
        transport: "Suggest inter-city transport options (Flight/Train/Bus/Car) with estimatedCost total for all travellers and duration.",
        all: "Cover hotel, activities/places to visit, and transport. Provide budgetAdjustments totals for accommodation, activities, food, localTransport, intercity consistent with suggestions and budgetLimit if given.",
      },
    });

    let data;
    try {
      data = await GeminiService.generateStructured(
        systemPrompt,
        userPrompt,
        customizeExpenseSchema
      );
    } catch (err) {
      console.warn("Gemini customize failed, using fallback:", err?.message);
      data = buildFallback({ destination, days, travelers, budgetLimit, category });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Customize expenses error:", error);
    next(error);
  }
}

function buildFallback({ destination, days, travelers, budgetLimit, category }) {
  const d = Math.max(1, Number(days) || 1);
  const t = Math.max(1, Number(travelers) || 1);
  const nights = Math.max(1, d - 1);
  const base = Math.max(2000, Math.round((Number(budgetLimit) || d * t * 3500) / Math.max(1, d * t)) );

  const hotels = [
    { name: `${destination} Comfort Stay`, area: "Central area", amenities: "Wi‑Fi · Breakfast · AC", nightlyRate: base, estimatedStayCost: base * nights * Math.ceil(t / 2), reason: "Balanced comfort and value" },
    { name: `${destination} Budget Inn`, area: "Near transit", amenities: "Clean rooms · Essentials", nightlyRate: Math.round(base * 0.7), estimatedStayCost: Math.round(base * 0.7) * nights * Math.ceil(t / 2), reason: "Saves on stay costs" },
  ];
  const activities = [
    { title: "Top local landmark visit", place: destination, day: 1, estimatedCost: 300 * t, note: "Must-see highlight" },
    { title: "Local market & food walk", place: destination, day: 2, estimatedCost: 250 * t, note: "Culture and cuisine" },
    { title: "Nature or heritage spot", place: `Near ${destination}`, day: Math.min(3, d), estimatedCost: 400 * t, note: "Scenic experience" },
  ];
  const transport = [
    { mode: "Train", provider: "Express service", estimatedCost: 900 * t, duration: `${Math.max(2, Math.round(d * 1.5))}h`, reason: "Good value" },
    { mode: "Bus", provider: "AC coach", estimatedCost: 700 * t, duration: `${Math.max(3, Math.round(d * 2))}h`, reason: "Budget-friendly" },
    { mode: "Flight", provider: "Domestic carrier", estimatedCost: 4500 * t, duration: "1-3h", reason: "Fastest option" },
  ];

  return {
    hotels: category === "activities" || category === "transport" ? [] : hotels,
    activities: category === "hotel" || category === "transport" ? [] : activities,
    transport: category === "hotel" || category === "activities" ? [] : transport,
    budgetAdjustments: {},
    summary: `Suggested customizable options for ${destination} (fallback estimates).`,
  };
}
