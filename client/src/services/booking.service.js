const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

/* =========================================================
   BOOKING EMAIL
   Sends the finalized booking to the lead traveller.
   Returns { status: "sent" } | { status: "unconfigured" } |
   { status: "failed", message }.
   ========================================================= */

export async function sendBookingConfirmationEmail(booking) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/booking/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ booking }),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 503 && data?.code === "EMAIL_NOT_CONFIGURED") {
      return { status: "unconfigured" };
    }

    if (!response.ok || !data?.success) {
      return {
        status: "failed",
        message:
          data?.message ||
          `Confirmation email failed (${response.status})`,
      };
    }

    return {
      status: "sent",
      previewUrl: data?.data?.previewUrl || null,
      mode: data?.data?.mode || "smtp",
    };
  } catch (error) {
    return {
      status: "failed",
      message:
        error?.message ||
        "Could not reach the email service.",
    };
  }
}
