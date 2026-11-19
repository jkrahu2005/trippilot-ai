import {
  isMailConfigured,
  sendBookingEmail,
} from "../services/mailer.service.js";

/* =========================================================
   BOOKING CONTROLLER
   Accepts the finalized booking from the client and emails
   the traveller. Returns a structured error when mail is
   not configured so the client can offer a fallback.
   ========================================================= */

export async function emailBookingConfirmation(req, res, next) {
  try {
    const booking = req.body?.booking || req.body;

    if (!booking || typeof booking !== "object") {
      return res.status(400).json({
        success: false,
        code: "BOOKING_MISSING",
        message: "A booking payload is required.",
      });
    }

    const recipient = booking.contact?.email;

    if (
      !recipient ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(recipient))
    ) {
      return res.status(400).json({
        success: false,
        code: "EMAIL_RECIPIENT_MISSING",
        message: "A valid traveller email is required.",
      });
    }

    const traveller = String(
      booking.contact?.name || ""
    ).trim();

    if (traveller.length < 2) {
      return res.status(400).json({
        success: false,
        code: "NAME_MISSING",
        message: "The lead traveller's name is required.",
      });
    }

    const info = await sendBookingEmail(booking);

    return res.status(200).json({
      success: true,
      data: {
        messageId: info?.messageId || null,
        accepted: info?.accepted || [recipient],
        previewUrl: info?.previewUrl || null,
        mode: info?.mode || "smtp",
      },
    });
  } catch (error) {
    console.error("Booking email error:", error);

    if (error?.code === "EMAIL_NOT_CONFIGURED" || error?.code === "EMAIL_AUTH_FAILED") {
      return res.status(503).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    next(error);
  }
}
