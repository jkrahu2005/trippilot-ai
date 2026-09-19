import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ lat, lon, days }) => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=${days}` +
      `&timezone=auto`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch weather.");
    }

    const data = await res.json();

    return data.daily.time.map((date, index) => ({
      day: index + 1,
      date,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      rainChance: data.daily.precipitation_probability_max[index],
    }));
  },
  {
    name: "weather_tool",
    description: "Fetches a multi-day weather forecast.",
    schema: z.object({
      lat: z.number(),
      lon: z.number(),
      days: z.number().min(1).max(14),
    }),
  }
);