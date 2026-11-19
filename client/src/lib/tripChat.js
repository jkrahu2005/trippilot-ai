/* =========================================================
   TRIPPILOT — CONVERSATIONAL TRIP INTAKE ENGINE
   Turns natural-language messages into a structured trip
   brief. It is deliberately deterministic so the copilot
   keeps working even when the LLM or network is unavailable.
   ========================================================= */

import {
  INTEREST_OPTIONS,
  findCityMatches,
  titleCasePlace,
} from "./tripOptions";

const WORD_NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const SKIP_WORDS =
  /^(skip|no\s+budget|no\s+limit|no\s+idea|not\s+sure|doesn'?t\s+matter|anything|whatever|flexible|surprise\s+me|you\s+decide|no\s+preference)\b/i;

const FIELD_ORDER = [
  "destination",
  "origin",
  "days",
  "travelers",
  "budget",
  "interests",
  "startDate",
  "hotelPreference",
];

const FIELD_LABELS = {
  destination: "Destination",
  origin: "Starting from",
  days: "Duration",
  travelers: "Travellers",
  budget: "Budget",
  interests: "Interests",
  startDate: "Travel window",
  hotelPreference: "Stay style",
  pace: "Pace",
};

const QUESTIONS = {
  destination: {
    text: "Where are you dreaming of going? A city, a coast, a mountain town — anything works.",
    chips: [
      { label: "Goa", value: "Goa" },
      { label: "Manali", value: "Manali" },
      { label: "Jaipur", value: "Jaipur" },
      { label: "Bali", value: "Bali" },
    ],
  },
  origin: {
    text: "Where will you be starting from?",
    chips: [
      { label: "Delhi", value: "Delhi" },
      { label: "Mumbai", value: "Mumbai" },
      { label: "Bengaluru", value: "Bengaluru" },
      { label: "Kolkata", value: "Kolkata" },
    ],
  },
  days: {
    text: "How many days are you thinking?",
    chips: [
      { label: "3 days", value: "3 days" },
      { label: "5 days", value: "5 days" },
      { label: "7 days", value: "7 days" },
      { label: "10 days", value: "10 days" },
    ],
  },
  travelers: {
    text: "Who's coming along?",
    chips: [
      { label: "Just me", value: "solo" },
      { label: "2 people", value: "2 people" },
      { label: "4 friends", value: "4 people" },
      { label: "Family of 4", value: "family of 4" },
    ],
  },
  budget: {
    text: "Do you have a budget in mind? A rough number helps me optimise hotels, flights and activities around it.",
    chips: [
      { label: "₹30,000", value: "₹30,000" },
      { label: "₹50,000", value: "₹50,000" },
      { label: "₹1,00,000", value: "₹1,00,000" },
      { label: "No limit", value: "no limit" },
    ],
  },
  interests: {
    text: "What should the trip feel like? Pick a few interests — or say “surprise me”.",
    chips: [
      {
        label: "Beaches + food",
        value: "beaches and food",
      },
      {
        label: "Adventure + nature",
        value: "adventure and nature",
      },
      {
        label: "History + culture",
        value: "history and culture",
      },
      { label: "Surprise me", value: "surprise me" },
    ],
  },
  startDate: {
    text: "When are you planning to travel?",
    chips: [
      { label: "This month", value: "this month" },
      { label: "Next month", value: "next month" },
      { label: "Not sure", value: "not sure" },
    ],
  },
  hotelPreference: {
    text: "What kind of stay do you prefer?",
    chips: [
      { label: "Beachfront", value: "beachfront" },
      { label: "Luxury", value: "luxury" },
      { label: "Budget-friendly", value: "budget" },
      { label: "Boutique", value: "boutique" },
      { label: "No preference", value: "not sure" },
    ],
  },
};

const INTEREST_KEYWORDS = {
  beaches: [
    "beach",
    "beaches",
    "sea",
    "coast",
    "coastal",
    "island",
    "shore",
    "snorkel",
    "scuba",
    "sunset",
    "water sport",
    "water sports",
  ],
  food: [
    "food",
    "foodie",
    "eat",
    "eating",
    "cuisine",
    "restaurant",
    "street food",
    "cafe",
    "cafes",
    "gastronomy",
    "local dishes",
  ],
  nightlife: [
    "nightlife",
    "party",
    "clubbing",
    "club",
    "bar",
    "pub",
    "night out",
  ],
  history: [
    "history",
    "historic",
    "fort",
    "palace",
    "museum",
    "heritage",
    "monument",
    "temple",
    "temples",
    "ruins",
    "archaeology",
  ],
  nature: [
    "nature",
    "mountain",
    "mountains",
    "hill",
    "hills",
    "trek",
    "trekking",
    "waterfall",
    "wildlife",
    "park",
    "forest",
    "lake",
    "valley",
    "scenery",
  ],
  shopping: [
    "shopping",
    "shop",
    "market",
    "markets",
    "mall",
    "bazaar",
    "souvenir",
    "souvenirs",
  ],
  adventure: [
    "adventure",
    "adventurous",
    "rafting",
    "paragliding",
    "hiking",
    "camping",
    "zipline",
    "zip line",
    "safari",
    "biking",
    "scuba",
    "snorkel",
    "water sport",
    "water sports",
    "adrenaline",
    "trek",
    "trekking",
  ],
  culture: [
    "culture",
    "cultural",
    "art",
    "arts",
    "festival",
    "festivals",
    "local life",
    "sightseeing",
    "architecture",
    "tradition",
    "traditional",
    "photography",
  ],
};

const STAY_PATTERNS = [
  { value: "Beachfront stay", pattern: /beachfront|near the beach|by the beach|on the beach|sea view/i },
  { value: "Luxury hotel", pattern: /luxury|5[-\s]?star|five[-\s]?star|premium|high[-\s]?end/i },
  { value: "Budget-friendly stay", pattern: /budget\s*(?:hotel|stay|option|accommodation|property)|cheap|affordable|economical|value[- ]for[- ]money/i },
  { value: "Boutique hotel", pattern: /boutique|design hotel|boutique stay/i },
  { value: "Resort", pattern: /resort/i },
  { value: "Homestay", pattern: /homestay|home stay|guesthouse/i },
  { value: "Hostel", pattern: /hostel|dorm/i },
];

/* =========================================================
   DRAFT HELPERS
   ========================================================= */

export function createDraft() {
  return {
    destination: "",
    origin: "",
    days: null,
    travelers: null,
    budget: null,
    interests: [],
    startDate: "",
    hotelPreference: "",
    pace: "",
    notes: [],
    skipped: [],
  };
}

export function cloneDraft(draft) {
  return {
    ...createDraft(),
    ...draft,
    interests: [...(draft?.interests || [])],
    notes: [...(draft?.notes || [])],
    skipped: [...(draft?.skipped || [])],
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function numberFromToken(token) {
  if (token === null || token === undefined) return null;

  const normalized = String(token).toLowerCase();

  if (WORD_NUMBERS[normalized]) {
    return WORD_NUMBERS[normalized];
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

/* =========================================================
   VALUE PARSERS
   ========================================================= */

function parseMoney(text) {
  const patterns = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lac|lacs|crore|cr)?/i,
    /([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|lac|lacs|crore|cr)\b/i,
    /(?:budget|under|within|around|about|max(?:imum)?|up\s*to|upto)\s*(?:of\s*)?(?:₹|rs\.?|inr)?\s*([\d,]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) continue;

    const raw = Number(String(match[1]).replace(/,/g, ""));
    const unit = (match[2] || "").toLowerCase();

    if (!Number.isFinite(raw)) continue;

    let multiplier = 1;

    if (unit === "k" || unit === "thousand") multiplier = 1000;
    else if (
      unit === "lakh" ||
      unit === "lakhs" ||
      unit === "lac" ||
      unit === "lacs"
    ) {
      multiplier = 100000;
    } else if (unit === "crore" || unit === "cr") {
      multiplier = 10000000;
    }

    const value = Math.round(raw * multiplier);

    if (value >= 500) {
      return value;
    }
  }

  return null;
}

function parseDays(text) {
  const explicit = text.match(
    /(\d{1,2})\s*[-\s]?\s*(day|days|night|nights)\b/i
  );

  if (explicit) {
    return clamp(Number(explicit[1]), 1, 30);
  }

  const wordNumber =
    "(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";

  const worded = text.match(
    new RegExp(
      `\\b${wordNumber}\\s*[-\\s]?\\s*(day|days|night|nights)\\b`,
      "i"
    )
  );

  if (worded) {
    return clamp(numberFromToken(worded[1]), 1, 30);
  }

  const weeks = text.match(
    new RegExp(
      `\\b(\\d{1,2}|a|an|${wordNumber})\\s*week(s)?\\b`,
      "i"
    )
  );

  if (weeks) {
    const amount =
      /a|an/i.test(weeks[1]) ? 1 : numberFromToken(weeks[1]);

    if (amount) {
      return clamp(amount * 7, 1, 30);
    }
  }

  if (/fortnight/i.test(text)) return 14;
  if (/long weekend/i.test(text)) return 3;
  if (/weekend/i.test(text)) return 2;

  return null;
}

function parseTravelers(text) {
  const friendPattern = text.match(
    /(?:with|and)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:friends|people|others|colleagues)\b/i
  );

  if (friendPattern) {
    const count = numberFromToken(friendPattern[1]);

    if (count) {
      return clamp(count + 1, 1, 20);
    }
  }

  const explicit = text.match(
    /(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|persons?|adults?|travell?ers?|travelers?|guests?|pax)\b/i
  );

  if (explicit) {
    const count = numberFromToken(explicit[1]);

    if (count) return clamp(count, 1, 20);
  }

  const family = text.match(
    /(?:family|group|party)\s+of\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\b/i
  );

  if (family) {
    const count = numberFromToken(family[1]);

    if (count) return clamp(count, 1, 20);
  }

  const ofUs = text.match(
    /(one|two|three|four|five|six|seven|eight|nine|ten)\s+of\s+us\b/i
  );

  if (ofUs) {
    return clamp(numberFromToken(ofUs[1]), 1, 20);
  }

  if (/solo|just me|by myself|alone|single traveller|single traveler/i.test(text)) {
    return 1;
  }

  if (/couple|my wife|my husband|my partner|honeymoon|two of us/i.test(text)) {
    return 2;
  }

  return null;
}

function parseInterests(text) {
  const lower = text.toLowerCase();
  const matched = [];

  Object.entries(INTEREST_KEYWORDS).forEach(
    ([interest, keywords]) => {
      const hit = keywords.some((keyword) =>
        new RegExp(
          `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        ).test(lower)
      );

      if (hit && !matched.includes(interest)) {
        matched.push(interest);
      }
    }
  );

  return matched.filter((id) => INTEREST_OPTIONS.some((item) => item.id === id));
}

function parseMonth(text) {
  const lower = text.toLowerCase();

  const month = MONTHS.find((name) => {
    const short = name.slice(0, 3);
    return new RegExp(`\\b${short}[a-z]*\\b`, "i").test(lower);
  });

  if (!month) return null;

  const year = text.match(/\b(20\d{2})\b/);
  const label =
    month.charAt(0).toUpperCase() + month.slice(1);

  return year ? `${label} ${year[1]}` : label;
}

function parseStartDate(text) {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  if (iso) return iso[1];

  const month = parseMonth(text);

  if (month) return month;

  if (/next\s+month/i.test(text)) {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);

    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (/this\s+month/i.test(text)) {
    return new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (/next\s+week/i.test(text)) {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (/weekend/i.test(text)) {
    const date = new Date();
    const day = date.getDay();
    const offset = (6 - day + 7) % 7 || 7;
    date.setDate(date.getDate() + offset);

    return `Weekend of ${date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`;
  }

  return null;
}

function parseHotelPreference(text) {
  const match = STAY_PATTERNS.find((item) =>
    item.pattern.test(text)
  );

  return match ? match.value : null;
}

function parsePace(text) {
  if (/relaxed|slow|leisurely|unhurried|chill/i.test(text)) {
    return "Relaxed";
  }

  if (/packed|fast|busy|action[-\s]?packed|maximise|maximize/i.test(text)) {
    return "Packed";
  }

  if (/balanced|moderate|mix/i.test(text)) {
    return "Balanced";
  }

  return null;
}

/* =========================================================
   PLACE EXTRACTION
   ========================================================= */

const PLACE_END =
  "(?=\\s+(?:for|from|with|on|in|at|next|this|the|and|under|within|budget|around|about|of|by|starting|travell?ing|traveling)\\b|[,.;!?]|$)";

const ORIGIN_PATTERN = new RegExp(
  "(?:from|starting(?:\\s+(?:from|in))?|based\\s+in|live\\s+in|i'?m\\s+(?:in|from)|i\\s+am\\s+(?:in|from)|departing\\s+from|leaving\\s+from|fly(?:ing)?\\s+from)\\s+([a-z][a-z\\s'’.-]{1,40}?)" +
    PLACE_END,
  "i"
);

const DESTINATION_PATTERN = new RegExp(
  "(?:to|towards|visit(?:ing)?|heading\\s+to|going\\s+to|go\\s+to|trip\\s+to|travel(?:ing|ling)?\\s+to|fly(?:ing)?\\s+to|holiday\\s+in|vacation\\s+in)\\s+([a-z][a-z\\s'’.-]{1,40}?)" +
    PLACE_END,
  "i"
);

function cleanPlace(raw) {
  const cleaned = String(raw || "")
    .replace(/[.,;:!?]+$/g, "")
    .replace(/^(?:the|a|an)\s+/i, "")
    .replace(
      /\s+(?:for|from|with|on|in|at|next|this|and|under|within|budget|around|about|of|by)\b.*$/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const words = cleaned.split(" ").slice(0, 4);
  const value = titleCasePlace(words.join(" "));

  return value.length >= 2 ? value : null;
}

function placeFromChunk(chunk) {
  if (!chunk) return null;

  const city = findCityMatches(chunk)[0];

  if (city) return city.name;

  return cleanPlace(chunk);
}

const NON_PLACE_WORDS = new Set([
  "hello",
  "hi",
  "hey",
  "yo",
  "ok",
  "okay",
  "sure",
  "yes",
  "no",
  "nope",
  "nah",
  "not",
  "none",
  "nothing",
  "maybe",
  "thanks",
  "thank",
  "please",
  "help",
  "destination",
  "origin",
  "start",
  "starting",
  "trip",
  "plan",
  "travel",
  "travelling",
  "traveling",
  "budget",
  "days",
  "day",
  "people",
  "person",
  "traveller",
  "travellers",
  "traveler",
  "travelers",
]);

function looksLikePlace(text) {
  if (!text) return false;

  const words = text
    .trim()
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
    .filter(Boolean);

  if (!words.length || words.length > 3) return false;
  if (words.some((w) => NON_PLACE_WORDS.has(w))) return false;
  // If the text contains comparison/choice words like "or", "vs", "versus", "between", "either", it's a question, not a place
  if (/\b(?:or|vs|versus|between|either|confused)\b/i.test(text)) {
    return false;
  }
  if (/\d|\b(?:hotel|rs|inr)\b/i.test(text)) {
    return false;
  }

  return true;
}

function parseDestinationFromText(text, draft = {}) {
  const chunk = text.match(DESTINATION_PATTERN)?.[1];
  const fromChunk = placeFromChunk(chunk);

  if (fromChunk && findCityMatches(fromChunk).length) {
    return findCityMatches(fromChunk)[0].name;
  }

  if (fromChunk && looksLikePlace(fromChunk)) return fromChunk;

  const cities = findCityMatches(text);
  const origin = draft.origin;

  const notOrigin = cities.find(
    (city) => city.name !== origin
  );

  if (notOrigin) return notOrigin.name;

  // As a last resort for direct answers, accept only a short, clean
  // place-like phrase (never conversational text like "hello").
  if (looksLikePlace(text)) return cleanPlace(text);

  return null;
}

function parseOriginFromText(text, draft = {}) {
  const chunk = text.match(ORIGIN_PATTERN)?.[1];
  const fromChunk = placeFromChunk(chunk);

  if (fromChunk && findCityMatches(fromChunk).length) {
    const dest = draft.destination;
    const hit = findCityMatches(fromChunk).find(
      (c) => c.name !== dest
    );
    if (hit) return hit.name;
  }

  if (fromChunk && looksLikePlace(fromChunk)) return fromChunk;

  const cities = findCityMatches(text);
  const destination = draft.destination;

  if (cities.length >= 2) {
    const notDestination = cities.find(
      (city) => city.name !== destination
    );

    if (notDestination) return notDestination.name;
  }

  if (looksLikePlace(text)) return cleanPlace(text);

  return null;
}

/* =========================================================
   FIELD VALUE PARSING
   ========================================================= */

function parseRawInterests(text) {
  const mapped = parseInterests(text);

  if (mapped.length) return mapped;

  const raw = text
    .toLowerCase()
    .replace(/[.]/g, "")
    .split(/,|\band\b|\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item) =>
        item.length > 2 &&
        item.length < 20 &&
        !/^(i|we|would|like|love|want|prefer|some|and|with|my|our|to|the)$/i.test(
          item
        )
    );

  return [...new Set(raw)].slice(0, 4);
}

export function parseFieldValue(field, text, draft = {}) {
  const value = String(text || "").trim();

  if (!value) return null;

  switch (field) {
    case "destination": {
      const parsed =
        parseDestinationFromText(value, draft) ||
        (looksLikePlace(value) ? cleanPlace(value) : null);
      return parsed;
    }

    case "origin": {
      const parsed =
        parseOriginFromText(value, draft) ||
        (looksLikePlace(value) ? cleanPlace(value) : null);
      return parsed;
    }

    case "days": {
      if (/^\d{1,2}$/.test(value)) {
        return clamp(Number(value), 1, 30);
      }

      return parseDays(value);
    }

    case "travelers": {
      if (/^\d{1,2}$/.test(value)) {
        return clamp(Number(value), 1, 20);
      }

      return parseTravelers(value);
    }

    case "budget": {
      if (SKIP_WORDS.test(value)) return { skip: true };

      return parseMoney(value);
    }

    case "interests": {
      if (/surprise|anything|you decide|no preference|not sure/i.test(value)) {
        return ["culture", "food", "nature"];
      }

      return parseRawInterests(value);
    }

    case "startDate": {
      if (SKIP_WORDS.test(value)) return { skip: true };

      return parseStartDate(value);
    }

    case "hotelPreference": {
      if (SKIP_WORDS.test(value)) return { skip: true };

      const parsed = parseHotelPreference(value);

      if (parsed) return parsed;

      return looksLikePlace(value)
        ? titleCasePlace(value)
        : null;
    }

    case "pace":
      return parsePace(value);

    default:
      return null;
  }
}

/* =========================================================
   GENERAL EXTRACTION
   ========================================================= */

function extractTripDetails(text, draft) {
  const details = {};

  const budget = parseMoney(text);
  if (budget) details.budget = budget;

  const travelers = parseTravelers(text);
  if (travelers) details.travelers = travelers;

  const days = parseDays(text);
  if (days) details.days = days;

  const interests = parseInterests(text);
  if (interests.length) details.interests = interests;

  const startDate = parseStartDate(text);
  if (startDate) details.startDate = startDate;

  const hotelPreference = parseHotelPreference(text);
  if (hotelPreference) details.hotelPreference = hotelPreference;

  const pace = parsePace(text);
  if (pace) details.pace = pace;

  const originCue = parseOriginFromText(text, draft);
  if (originCue) details.origin = originCue;

  const destinationCue = parseDestinationFromText(text, draft);
  if (destinationCue) details.destination = destinationCue;

  const cities = findCityMatches(text);

  if (!details.destination) {
    const origin = details.origin || draft.origin;
    const candidate = cities.find(
      (city) => city.name !== origin
    );

    /*
     * Only infer a destination when the message names more than
     * one place. A single city is more likely an answer to the
     * question we just asked (for example "Delhi" for origin), so
     * it must not silently overwrite the destination.
     */
    if (candidate && cities.length >= 2) {
      details.destination = candidate.name;
    }
  }

  if (!details.origin) {
    const destination =
      details.destination || draft.destination;

    if (cities.length >= 2) {
      const candidate = cities.find(
        (city) => city.name !== destination
      );

      if (candidate) details.origin = candidate.name;
    }
  }

  return details;
}

/* =========================================================
   FIELD STATE
   ========================================================= */

function isEmpty(draft, field) {
  if (draft.skipped?.includes(field)) return false;

  switch (field) {
    case "interests":
      return !(draft.interests || []).length;
    case "days":
    case "travelers":
      return draft[field] === null || draft[field] === undefined;
    case "budget":
      return draft.budget === null || draft.budget === undefined;
    default:
      return !draft[field];
  }
}

export function firstMissingField(draft) {
  return (
    FIELD_ORDER.find((field) => isEmpty(draft, field)) || null
  );
}

export function isReady(draft) {
  return Boolean(
    draft?.destination && draft?.origin && draft?.days
  );
}

export function completeness(draft) {
  const filled = FIELD_ORDER.filter(
    (field) => !isEmpty(draft, field)
  ).length;

  return Math.round((filled / FIELD_ORDER.length) * 100);
}

export function questionFor(field) {
  return QUESTIONS[field] || null;
}

/* =========================================================
   APPLYING UPDATES
   ========================================================= */

function applyField(draft, field, value) {
  if (value === null || value === undefined) return false;

  if (field === "interests") {
    const next = Array.isArray(value) ? value : [value];

    if (!next.length) return false;

    const merged = [
      ...new Set([...(draft.interests || []), ...next]),
    ].slice(0, 8);

    const changed =
      merged.length !== (draft.interests || []).length ||
      merged.some(
        (item) => !(draft.interests || []).includes(item)
      );

    draft.interests = merged;
    draft.skipped = (draft.skipped || []).filter(
      (item) => item !== "interests"
    );

    return changed;
  }

  if (value && value.skip) {
    if (!(draft.skipped || []).includes(field)) {
      draft.skipped = [...(draft.skipped || []), field];
      return true;
    }

    return false;
  }

  const normalized =
    field === "destination" || field === "origin"
      ? titleCasePlace(value)
      : value;

  if (draft[field] === normalized) return false;

  draft[field] = normalized;
  draft.skipped = (draft.skipped || []).filter(
    (item) => item !== field
  );

  return true;
}

function formatFieldValue(field, draft) {
  switch (field) {
    case "destination":
      return `destination ${draft.destination}`;
    case "origin":
      return `starting from ${draft.origin}`;
    case "days":
      return `${draft.days} days`;
    case "travelers":
      return `${draft.travelers} ${
        draft.travelers === 1 ? "traveller" : "travellers"
      }`;
    case "budget":
      return `₹${Number(draft.budget).toLocaleString("en-IN")} budget`;
    case "interests":
      return `interests: ${(draft.interests || []).join(", ")}`;
    case "startDate":
      return `travel window: ${draft.startDate}`;
    case "hotelPreference":
      return `stay: ${draft.hotelPreference}`;
    case "pace":
      return `pace: ${draft.pace}`;
    default:
      return "";
  }
}

function skipLabel(field) {
  switch (field) {
    case "budget":
      return "No budget cap — I'll optimise for value.";
    case "startDate":
      return "Flexible dates — I'll plan around the best available window.";
    case "hotelPreference":
      return "No strong stay preference — I'll pick a balanced option.";
    default:
      return "Noted.";
  }
}

const OPENERS = [
  "Got it",
  "Noted",
  "Perfect",
  "Great",
  "Lovely",
];

/* =========================================================
   RESPOND
   ========================================================= */

export function respondToMessage(
  text,
  currentDraft,
  pendingField = null
) {
  const draft = cloneDraft(currentDraft);
  const clean = String(text || "").trim();

  if (!clean) {
    return {
      draft,
      reply: "I didn't catch that. Could you say it again?",
      field: pendingField || firstMissingField(draft),
      chips: questionFor(pendingField || firstMissingField(draft))?.chips || [],
    };
  }

  // Detect comparison / deliberation / choice between two destinations
  const comparisonMatch = clean.match(/\b([A-Za-z\s]+?)\s+(?:or|vs\.?|versus)\s+([A-Za-z\s]+?)(?:\?|$|\.|\!|\s+(?:which|better|confused))/i) ||
                          clean.match(/confused\s+between\s+([A-Za-z\s]+?)\s+and\s+([A-Za-z\s]+?)(?:\?|$|\.|\!)/i);

  if (comparisonMatch && !draft.destination) {
    const opt1 = titleCasePlace(comparisonMatch[1].trim());
    const opt2 = titleCasePlace(comparisonMatch[2].trim());
    const expected = pendingField || firstMissingField(draft);
    return {
      draft,
      reply: `Both ${opt1} and ${opt2} are great choices! ${opt1} is wonderful for scenic vibes, while ${opt2} has its own unique charm. Which one would you prefer to lock in for this trip?`,
      field: "destination",
      chips: [
        { label: opt1, value: opt1 },
        { label: opt2, value: opt2 },
      ],
      updates: [],
    };
  }

  const expectedField =
    pendingField || firstMissingField(draft);

  const updates = [];
  let skipped = null;

  /* 1. A direct answer to the question we just asked. */

  if (expectedField) {
    const direct = parseFieldValue(
      expectedField,
      clean,
      draft
    );

    if (direct && direct.skip) {
      if (applyField(draft, expectedField, direct)) {
        skipped = expectedField;
      }
    } else if (direct) {
      if (applyField(draft, expectedField, direct)) {
        updates.push(expectedField);
      }
    }
  }

  /* 2. Any other details volunteered in the same message. */

  const general = extractTripDetails(clean, draft);

  Object.entries(general).forEach(([field, value]) => {
    if (field === expectedField && updates.includes(field)) {
      return;
    }

    if (applyField(draft, field, value)) {
      if (!updates.includes(field)) updates.push(field);
    }
  });

  /* 3. Compose the reply. */

  const nextField = firstMissingField(draft);

  let reply = "";

  if (skipped) {
    reply = skipLabel(skipped);
  } else if (updates.length) {
    const opener =
      OPENERS[Math.floor(Math.random() * OPENERS.length)];

    reply = `${opener} — ${updates
      .map((field) => formatFieldValue(field, draft))
      .join(" · ")}.`;
  } else {
    reply =
      "I've kept that in mind. Add anything else you'd like the trip to include.";
  }

  if (nextField) {
    reply += `\n\n${questionFor(nextField).text}`;
  } else {
    reply +=
      "\n\nI have everything I need. Tap “Build my trip” and I'll coordinate the planner, transport, budget, weather and optimizer agents.";
  }

  return {
    draft,
    reply,
    field: nextField,
    chips: nextField
      ? questionFor(nextField)?.chips || []
      : [],
    updates,
  };
}

/* =========================================================
   FINALISE
   ========================================================= */

export function finalizeDraft(draft) {
  const next = cloneDraft(draft);

  if (!next.travelers) next.travelers = 2;
  if (!next.days) next.days = 3;

  if (!next.interests?.length) {
    next.interests = ["culture", "food", "nature"];
  }

  return next;
}

export function toApiRequest(draft) {
  const next = finalizeDraft(draft);

  return {
    origin: next.origin,
    destination: next.destination,
    days: Number(next.days),
    interests: next.interests,
    travelers: Number(next.travelers) || 1,
    budget: next.budget ? Number(next.budget) : null,
    startDate: next.startDate || "",
    preferences: {
      hotelPreference: next.hotelPreference || "",
      pace: next.pace || "",
      notes: next.notes || [],
    },
  };
}

/* =========================================================
   META FOR THE DASHBOARD
   ========================================================= */

export function buildTripMeta({ draft, request, trip } = {}) {
  const interests =
    draft?.interests?.length
      ? draft.interests
      : request?.interests?.length
        ? request.interests
        : trip?.interests || [];

  return {
    days:
      draft?.days ??
      request?.days ??
      trip?.days ??
      trip?.itinerary?.days?.length ??
      1,
    travelers:
      draft?.travelers ??
      request?.travelers ??
      trip?.travelers ??
      2,
    budgetLimit:
      draft?.budget ??
      request?.budget ??
      trip?.budgetLimit ??
      null,
    startDate:
      draft?.startDate ||
      request?.startDate ||
      trip?.startDate ||
      "",
    hotelPreference:
      draft?.hotelPreference ||
      request?.preferences?.hotelPreference ||
      trip?.preferences?.hotelPreference ||
      "",
    pace:
      draft?.pace ||
      request?.preferences?.pace ||
      trip?.preferences?.pace ||
      "",
    interests,
    skipped: draft?.skipped || [],
  };
}

export { FIELD_ORDER, FIELD_LABELS };
