const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

/* =========================================================
   PLAN TRIP
   ========================================================= */

export async function planTrip(tripData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/trip/plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Trip planning failed (${response.status})`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Trip planning failed."
      );
    }

    return data;
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to TripPilot backend. Make sure the backend is running on port 3000."
      );
    }

    throw error;
  }
}