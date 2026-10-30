import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ lat, lon, days }) => {
    try {
      console.log("\n========== WEATHER TOOL ==========");

      console.log("Latitude:", lat);
      console.log("Longitude:", lon);
      console.log("Forecast Days:", days);

      // Validate input before making the request
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

      // Construct URL safely
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        daily:
          "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: String(days),
        timezone: "auto",
      });

      const url =
        `https://api.open-meteo.com/v1/forecast?${params}`;

      console.log("Request URL:", url);

      // Call Open-Meteo
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });

      console.log("HTTP Status:", res.status);
      console.log("HTTP Status Text:", res.statusText);

      // Read response body
      const responseText = await res.text();

      console.log("Raw API Response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Open-Meteo returned invalid JSON: ${responseText}`
        );
      }

      // Handle API errors
      if (!res.ok) {
        throw new Error(
          `Open-Meteo HTTP ${res.status}: ${
            data.reason || responseText
          }`
        );
      }

      // Validate forecast response
      if (
        !data.daily ||
        !Array.isArray(data.daily.time)
      ) {
        throw new Error(
          "Open-Meteo response does not contain daily forecast data."
        );
      }

      const {
        time,
        temperature_2m_max,
        temperature_2m_min,
        precipitation_probability_max,
      } = data.daily;

      if (
        !Array.isArray(temperature_2m_max) ||
        !Array.isArray(temperature_2m_min) ||
        !Array.isArray(precipitation_probability_max)
      ) {
        throw new Error(
          "Open-Meteo returned incomplete daily weather variables."
        );
      }

      // Transform API response
      const forecast = time.map((date, index) => ({
        day: index + 1,
        date,
        maxTemp: temperature_2m_max[index],
        minTemp: temperature_2m_min[index],
        rainChance: precipitation_probability_max[index],
      }));

      console.log("Forecast generated:", forecast);
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