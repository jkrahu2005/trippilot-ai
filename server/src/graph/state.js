import { Annotation } from "@langchain/langgraph";

export const TripState = Annotation.Root({
  destination: Annotation({
    reducer: (_, value) => value,
    default: () => "",
  }),

  days: Annotation({
    reducer: (_, value) => value,
    default: () => 0,
  }),

 budget: Annotation({
  reducer: (_, value) => value,
  default: () => ({
    accommodation: 0,
    food: 0,
    transport: 0,
    activities: 0,
    total: 0,
  }),
}),

  interests: Annotation({
    reducer: (_, value) => value,
    default: () => [],
  }),

  itinerary: Annotation({
    reducer: (_, value) => value,
    default: () => [],
  }),

  weather: Annotation({
  reducer: (_, value) => value,
  default: () => ({
    days: [],
  }),
}),

  recommendations: Annotation({
    reducer: (_, value) => value,
    default: () => [],
  }),

  messages: Annotation({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  currentStep: Annotation({
    reducer: (_, value) => value,
    default: () => "planner",
  }),
  trace: Annotation({
  reducer: (current, update) => [...current, ...update],
  default: () => [],
}),
destinationContext: Annotation({
  reducer: (_, value) => value,
  default: () => ({
    lat: null,
    lon: null,
    country: null,
  }),
}),
origin: Annotation({
  reducer: (_, value) => value,
  default: () => "",
}),

transport: Annotation({
  reducer: (_, value) => value,
  default: () => ({
    mode: null,
    distanceKm: null,
    duration: null,
    estimatedCost: null,
  }),
}),
optimizedItinerary: Annotation({
  reducer: (_, value) => value,
  default: () => ({
    days: [],
  }),
}),

changes: Annotation({
  reducer: (_, value) => value,
  default: () => [],
}),
recommendations: Annotation({
  reducer: (_, update) => update,
  default: () => ({
    hotels: [],
    restaurants: [],
    attractions: [],
  }),
}),
});