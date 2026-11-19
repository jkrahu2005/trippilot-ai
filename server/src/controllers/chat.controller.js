import GeminiService from "../services/gemini.service.js";
import { ChatIntakeSchema } from "../schema/chat.schema.js";

const SYSTEM = `You are TripPilot's conversational travel-planning intake agent.

Your job is to understand what the user says in natural language, update the trip brief, and ask only for what is still missing.

Rules:
- Be robust: greetings, corrections, negations and messy phrasing must not become destinations or origins. "hello" is not a place. "no destination is delhi" means the destination is not Delhi (and may state an origin) — do not set destination to "No destination is delhi".
- If the user is asking for recommendations, alternatives, ideas or comparisons (e.g. "more options like X", "more opyion like manali", "suggest places like Y", "where should I go?"), DO NOT set destination to X or Y! Instead:
  * Keep destination empty/null.
  * Suggest 3-4 inspiring alternative places (e.g. Shimla, Kasol, Dharamshala, Leh for mountain lovers; Gokarna, Pondicherry for beach lovers).
  * Ask which of those they would like to explore or if they'd like other suggestions.
- If the user is unsure or asks you to choose between two places (e.g. "goa or manali?", "where should I go X or Y?"), that is NOT a trip brief. Compare them helpfully, do NOT fill destination, and ask them to pick one. Never write "X or Y", "X / Y" or "X vs Y" into destination or origin — leave it empty and set nextField to destination.
- A field you have not been told must stay empty/0 — never invent values. Empty is correct; do not guess days, budget, travelers, dates or stay style.
- Extract every detail present: destination, origin, days, travelers, budget (INR number), interests, startDate/travel window, hotelPreference/stay style, pace (Relaxed|Balanced|Packed), notes.
- Preserve previously known draft values unless the user clearly corrects them.
- If the user says they don't know / are flexible / no preference for an optional field, record a sensible value (e.g. "Flexible" for startDate, "No strong preference" for hotelPreference) so we don't keep asking.
- Required to be "ready to build": destination, origin, days. Ask for travelers/budget/interests/startDate/hotelPreference/pace if missing, but keep it brief (one question at a time).
- reply: warm, concise, 1-3 short sentences. Acknowledge what you understood, then ask for the next missing thing (or tell them to tap "Build my trip" when ready). Do not mention internal field names.
- nextField: the single most important missing field to ask about next, or "done" when destination, origin and days are all known and you have asked enough.
- draft: return the full updated draft. Use empty string for unknown string fields, 0 for unknown numbers, [] for empty arrays. interests should be short lowercase-ish theme words.
- updates: list which field names changed because of this message (empty array if none changed).
Return only data matching the schema.`;

function normalizeDraft(draft = {}) {
  const s = (v) => (v == null ? "" : String(v));
  const n = (v) => (v == null ? 0 : Number(v) || 0);
  return {
    destination: s(draft.destination),
    origin: s(draft.origin),
    days: n(draft.days) || 0,
    travelers: n(draft.travelers) || 0,
    budget: n(draft.budget) || 0,
    interests: Array.isArray(draft.interests) ? draft.interests : [],
    startDate: s(draft.startDate),
    hotelPreference: s(draft.hotelPreference),
    pace: s(draft.pace),
    notes: Array.isArray(draft.notes) ? draft.notes : [],
    skipped: Array.isArray(draft.skipped) ? draft.skipped : [],
  };
}

// A place field must name ONE place; "Goa or Manali" / "Goa vs Manali" are not valid.
function cleanPlaceField(value) {
  const t = String(value ?? "").trim();
  if (!t) return null;
  if (/\b(?:or|vs|versus|either|between|and)\b|[\/,&]/i.test(t)) return null;
  if (t.length > 40) return null;
  return t;
}

function toClientDraft(draft = {}) {
  const s = (v) => {
    const t = String(v ?? "").trim();
    return t ? t : null;
  };
  const n = (v) => {
    const num = Number(v);
    return Number.isFinite(num) && num > 0 ? num : null;
  };
  return {
    destination: cleanPlaceField(draft.destination),
    origin: cleanPlaceField(draft.origin),
    days: n(draft.days),
    travelers: n(draft.travelers),
    budget: n(draft.budget),
    interests: Array.isArray(draft.interests)
      ? draft.interests.filter(Boolean)
      : [],
    startDate: s(draft.startDate),
    hotelPreference: s(draft.hotelPreference),
    pace: s(draft.pace),
    notes: Array.isArray(draft.notes) ? draft.notes.filter(Boolean) : [],
    skipped: Array.isArray(draft.skipped) ? draft.skipped : [],
  };
}

export async function chatIntake(req, res, next) {
  try {
    const { message, draft, pendingField, history } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const safeDraft = normalizeDraft(draft);
    const recent = Array.isArray(history) ? history.slice(-8) : [];

    const userPrompt = `Current draft (JSON):\n${JSON.stringify(safeDraft, null, 2)}\n\nPending field we just asked about: ${pendingField || "none"}\n\nRecent conversation:\n${recent
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n") || "(none)"}\n\nUser message:\n${String(message)}`;

    const result = await GeminiService.generateStructured(
      SYSTEM,
      userPrompt,
      ChatIntakeSchema
    );

    const nextField = result.nextField === "done" ? null : result.nextField;
    const merged = toClientDraft({
      ...safeDraft,
      ...(result.draft || {}),
    });

    return res.status(200).json({
      success: true,
      data: {
        draft: {
          ...merged,
          skipped: Array.isArray(draft?.skipped) ? draft.skipped : [],
        },
        reply: result.reply,
        field: nextField,
        chips: [],
        updates: Array.isArray(result.updates) ? result.updates : [],
      },
    });
  } catch (error) {
    console.error("Chat intake error:", error);
    next(error);
  }
}
