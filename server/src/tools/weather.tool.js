
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ lat, lon, days }) => {
    try {
      console.log("\n========== WEATHER TOOL ==========");

      console.log("Latitude:", lat);
      console.log("Longitude:", lon);
      console.log("Forecast Days:", days);

      // Validate input
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error(
          `Invalid coordinates: lat=${lat}, lon=${lon}`
        );
      }

      if (!Number.isInteger(days) || days < 1 || days > 14) {
        throw new Error(
          `Invalid forecast duration: ${days}`
        );
      }

      // Get Visual Crossing API key
      const apiKey = process.env.VISUAL_CROSSING_API_KEY;

      if (!apiKey) {
        throw new Error(
          "VISUAL_CROSSING_API_KEY is missing from environment variables."
        );
      }

      // Construct Visual Crossing Timeline API URL
      const location = `${lat},${lon}`;

      const url = new URL(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}`
      );

      const params = new URLSearchParams({
        key: apiKey,
        unitGroup: "metric",
        include: "days",
        elements: "datetime,tempmax,tempmin,precipprob",
        contentType: "json",
      });

      url.search = params.toString();

      console.log("Weather Provider: Visual Crossing");
      console.log("Location:", location);
      console.log("Forecast Days Requested:", days);
      console.log("Calling Visual Crossing API...");

      // Call Visual Crossing
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });

      console.log("HTTP Status:", res.status);
      console.log("HTTP Status Text:", res.statusText);

      // Read response body
      const responseText = await res.text();

      // Handle API errors
      if (!res.ok) {
        console.error("API Error Response:", responseText);

        throw new Error(
          `Visual Crossing HTTP ${res.status}: ${responseText}`
        );
      }

      // Parse JSON response
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Visual Crossing returned invalid JSON: ${responseText}`
        );
      }

      // Validate forecast response
      if (!data || !Array.isArray(data.days)) {
        throw new Error(
          "Visual Crossing response does not contain daily forecast data."
        );
      }

      if (data.days.length < days) {
        throw new Error(
          `Visual Crossing returned only ${data.days.length} days, but ${days} days were requested.`
        );
      }

      // Transform API response into existing TripPilot format
      const forecast = data.days
        .slice(0, days)
        .map((day, index) => {
          if (
            !day.datetime ||
            !Number.isFinite(day.tempmax) ||
            !Number.isFinite(day.tempmin)
          ) {
            throw new Error(
              `Incomplete weather data for forecast day ${index + 1}.`
            );
          }

          return {
            day: index + 1,
            date: day.datetime,
            maxTemp: day.tempmax,
            minTemp: day.tempmin,
            rainChance: Number.isFinite(day.precipprob)
              ? day.precipprob
              : null,
          };
        });

      console.log("Forecast generated:", forecast);
      console.log("Weather forecast successfully fetched.");
      console.log("=================================\n");

      return forecast;

    } catch (error) {
      console.error("\n========== WEATHER ERROR ==========");
      console.error("Error Message:", error.message);
      console.error("Full Error:", error);
      console.error("===================================\n");

      throw error;
    }
  },
  {
    name: "weather_tool",
    description: "Fetches a multi-day weather forecast.",

    schema: z.object({
      lat: z.number(),
      lon: z.number(),
      days: z.number().int().min(1).max(14),
    }),
  }
);
