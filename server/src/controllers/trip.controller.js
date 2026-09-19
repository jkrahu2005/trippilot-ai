import { tripGraph } from "../graph/trip.graph.js";

export async function planTrip(req, res, next) {
  try {
    /* =======================================================
       REQUEST DATA
       ======================================================= */

    const {
      origin,
      destination,
      days,
      interests,
    } = req.body;

    /* =======================================================
       VALIDATION
       ======================================================= */

    if (!origin || !destination || !days) {
      return res.status(400).json({
        success: false,
        message:
          "Origin, destination and days are required.",
      });
    }

    if (Number(days) < 1 || Number(days) > 30) {
      return res.status(400).json({
        success: false,
        message:
          "Trip duration must be between 1 and 30 days.",
      });
    }

    /* =======================================================
       GRAPH INPUT
       ======================================================= */

    const result = await tripGraph.invoke({
      origin: origin.trim(),
      destination: destination.trim(),
      days: Number(days),
      interests: Array.isArray(interests)
        ? interests
        : [],
      currentStep: "planner",
      trace: [],
    });

    /* =======================================================
       RESPONSE
       ======================================================= */

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Trip planning error:",
      error
    );

    next(error);
  }
}