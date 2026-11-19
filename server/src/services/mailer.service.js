import nodemailer from "nodemailer";

/* =========================================================
   TRIPPILOT — BOOKING EMAILER
   Sends the final booking details to the lead traveller.
   Configured entirely through environment variables:
   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
   ========================================================= */

function isPlaceholderPass(pass) {
  if (!pass) return true;
  const p = String(pass).toLowerCase();
  return p.includes("your-") || p.includes("password-here") || p.includes("xxx");
}

function config() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } =
    process.env;

  if (
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !MAIL_FROM ||
    isPlaceholderPass(SMTP_PASS)
  ) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: MAIL_FROM,
  };
}

export function isMailConfigured() {
  return Boolean(config());
}

const rupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const dayList = (itinerary) => {
  const days = itinerary?.days || [];

  return days
    .map((day) => {
      const slots = ["morning", "afternoon", "evening"]
        .map((slot) => {
          const item = day?.[slot];
          if (!item) return null;
          const activity =
            item.activity || item.title || null;
          if (!activity) return null;
          return `${slot.charAt(0).toUpperCase() + slot.slice(1)}: ${activity}`;
        })
        .filter(Boolean);

      return `<li style="margin:0 0 10px 0">
        <strong>Day ${day.day}</strong>${
          slots.length ? `<br/>${slots.join("<br/>")}` : ""
        }
      </li>`;
    })
    .join("");
};

function partnerLinks(booking) {
  const from = encodeURIComponent(booking.origin || "");
  const to = encodeURIComponent(booking.destination || "");
  const mode = booking.selectedTransport?.mode || "Flight";

  const flightLinks = [];
  const trainBusLinks = [];
  const hotelLinks = [];

  if (mode === "Train") {
    trainBusLinks.push({ label: "IRCTC — Book train", href: "https://www.irctc.co.in/nget/train-search" });
    trainBusLinks.push({ label: "RailYatri — Train tickets", href: "https://www.railyatri.in/" });
  } else if (mode === "Bus") {
    trainBusLinks.push({ label: `RedBus — ${booking.origin} to ${booking.destination}`, href: `https://www.redbus.in/search?srcName=${from}&destName=${to}` });
    trainBusLinks.push({ label: "AbhiBus — Bus tickets", href: `https://www.abhibus.com/` });
  } else {
    flightLinks.push({ label: `MakeMyTrip Flights`, href: `https://www.makemytrip.com/flights/` });
    flightLinks.push({ label: `Goibibo Flights`, href: `https://www.goibibo.com/flights/` });
    flightLinks.push({ label: `Yatra Flights`, href: `https://www.yatra.com/` });
    flightLinks.push({ label: `Google Flights`, href: `https://www.google.com/search?q=flights+from+${from}+to+${to}` });
  }

  hotelLinks.push({ label: `Booking.com — Hotels in ${booking.destination}`, href: `https://www.booking.com/search.html?ss=${encodeURIComponent(booking.destination || "")}` });
  hotelLinks.push({ label: `MakeMyTrip Hotels`, href: `https://www.makemytrip.com/hotels/` });
  hotelLinks.push({ label: `OYO Rooms`, href: `https://www.oyorooms.com/` });

  return { flightLinks, trainBusLinks, hotelLinks };
}

function renderPartnerLinksHtml(booking) {
  const { flightLinks, trainBusLinks, hotelLinks } = partnerLinks(booking);
  const mode = booking.selectedTransport?.mode || "Flight";

  const travelLinks = mode === "Train" || mode === "Bus" ? trainBusLinks : flightLinks;
  const travelLabel = mode === "Train" ? "Train booking" : mode === "Bus" ? "Bus booking" : "Flight booking";

  const linkStyle = `
    display:inline-block;
    margin:4px 4px 4px 0;
    padding:7px 14px;
    background:#f2f7f5;
    border:1px solid #d0e0da;
    border-radius:20px;
    font-size:12px;
    color:#0f3b34;
    text-decoration:none;
    font-weight:600;
  `;

  const travelHtml = travelLinks.map(l =>
    `<a href="${l.href}" target="_blank" style="${linkStyle}">${l.label} ↗</a>`
  ).join("");

  const hotelHtml = hotelLinks.map(l =>
    `<a href="${l.href}" target="_blank" style="${linkStyle}">${l.label} ↗</a>`
  ).join("");

  return `
    <div style="background:#fff;border-radius:16px;margin-top:16px;padding:22px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 6px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        🎟️ Actually book this trip
      </h2>
      <p style="margin:0 0 14px;font-size:12px;color:#93a49c">
        TripPilot plans your itinerary — click below to complete your real reservations with our partners.
      </p>

      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0f3b34;margin-bottom:6px">
          ${travelLabel}
        </div>
        ${travelHtml}
      </div>

      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0f3b34;margin-bottom:6px">
          Hotel / Stay
        </div>
        ${hotelHtml}
      </div>
    </div>
  `;
}

export function bookingEmailHtml(booking) {
  const transport =
    booking.selectedTransport || booking.selectedFlight || null;
  const hotel = booking.selectedHotel || null;
  const days = dayList(booking.itinerary);
  const expenses = booking.expenses || {};

  /* Expense rows */
  const expenseRows = [
    ["🏨 Accommodation / Hotel", expenses.accommodation ?? booking.breakdown?.accommodation],
    ["🍽️ Food & Dining", expenses.food ?? booking.breakdown?.food],
    ["🚌 Local Transport", expenses.localTransport ?? booking.breakdown?.localTransport],
    ["🎭 Activities & Places", expenses.activities ?? booking.breakdown?.activities],
    ["✈️ Inter-city Travel", expenses.intercity ?? transport?.totalPrice],
  ]
    .map(([label, val]) => {
      if (val == null) return "";
      return `
        <tr>
          <td style="padding:8px 10px;font-size:13px;color:#2b3d38;border-bottom:1px solid #f0f4f2">${label}</td>
          <td style="padding:8px 10px;font-size:13px;font-weight:700;color:#0f3b34;text-align:right;border-bottom:1px solid #f0f4f2">${rupees(val)}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c2b28">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f3b34 0%,#1a5c50 100%);color:#f2f7f5;border-radius:20px;padding:32px 28px 28px;text-align:left">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8fd6c3;font-weight:700;margin-bottom:8px">
        TripPilot AI · Booking Confirmed ✅
      </div>
      <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;font-weight:700">
        You're booked, ${booking.contact?.name || "traveller"} 🎉
      </h1>
      <p style="margin:0;font-size:14px;color:#c4d8d1;line-height:1.6">
        <strong>Reference:</strong> ${booking.id}<br/>
        <strong>Trip:</strong> ${booking.origin} → ${booking.destination} · ${booking.days} days${booking.startDate ? ` · Starting ${booking.startDate}` : ""}<br/>
        <strong>Travellers:</strong> ${booking.travelers} ${booking.travelers === 1 ? "person" : "people"}
      </p>
    </div>

    <!-- Travel Details -->
    <div style="background:#ffffff;border-radius:16px;margin-top:16px;padding:22px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 12px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        ✈️ Travel
      </h2>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#2b3d38">
        ${transport
          ? `<strong>${transport.mode}</strong> · ${transport.provider || transport.airline || ""}${transport.code ? `<br/><span style="color:#5b7269">${transport.code}</span>` : ""}<br/>${
              transport.depart
                ? `${transport.depart} → ${transport.arrive} · ${transport.duration} · ${transport.stopLabel || ""}<br/>`
                : `${transport.duration} · door to door<br/>`
            }<strong style="color:#0f3b34">${rupees(transport.totalPrice)}</strong>${
              transport.perPerson === false ? " (whole vehicle)" : " (all travellers)"
            }`
          : `Arranged by TripPilot on your route — check the itinerary.`}
      </p>

      <h2 style="margin:20px 0 12px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        🏨 Stay
      </h2>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#2b3d38">
        ${hotel
          ? `<strong>${hotel.name}</strong>${hotel.amenities ? `<br/><span style="color:#5b7269">${hotel.amenities}</span>` : ""}`
          : "Recommended stay (included in your estimate)."}
      </p>
    </div>

    <!-- Expense Breakdown -->
    ${expenseRows ? `
    <div style="background:#ffffff;border-radius:16px;margin-top:16px;padding:22px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 14px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        💰 Expense Breakdown
      </h2>
      <table style="width:100%;border-collapse:collapse">
        ${expenseRows}
        <tr style="background:#f2f7f5">
          <td style="padding:10px 10px;font-size:14px;font-weight:700;color:#0f3b34">Total Estimate</td>
          <td style="padding:10px 10px;font-size:16px;font-weight:700;color:#0f3b34;text-align:right">${rupees(booking.total)}</td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-size:11px;color:#93a49c">
        ${booking.travelers} ${booking.travelers === 1 ? "traveller" : "travellers"} · ${booking.contact?.email || ""}${booking.contact?.phone ? ` · ${booking.contact.phone}` : ""}
      </p>
    </div>` : `
    <div style="background:#ffffff;border-radius:16px;margin-top:16px;padding:22px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 8px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">Total Estimate</h2>
      <p style="margin:0;font-size:24px;font-weight:700;color:#0f3b34">${rupees(booking.total)}</p>
    </div>`}

    <!-- Itinerary -->
    ${days ? `
    <div style="background:#ffffff;border-radius:16px;margin-top:16px;padding:22px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 14px;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        📅 Your Itinerary
      </h2>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:#2b3d38">${days}</ul>
    </div>` : ""}

    <!-- Interests / Places -->
    ${(booking.interests || []).length > 0 ? `
    <div style="background:#f9fdfb;border-radius:16px;margin-top:16px;padding:18px 24px;border:1px solid #e3ebe8">
      <h2 style="margin:0 0 10px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#5b7269">
        🌟 Your Interests & Experiences
      </h2>
      <p style="margin:0;font-size:13px;color:#2b3d38;line-height:1.6">
        ${booking.interests.join(" · ")}
      </p>
    </div>` : ""}

    <!-- Partner Booking Links -->
    ${renderPartnerLinksHtml(booking)}

    <!-- Footer -->
    <p style="margin:20px 4px 0;font-size:11px;line-height:1.6;color:#93a49c;text-align:center">
      This booking confirmation is from <strong>TripPilot AI</strong>.<br/>
      This is an AI-planned itinerary — no payment was taken and no supplier reservation was auto-created.<br/>
      To make real reservations, use the booking links above.<br/>
      Questions? Reply to this email or visit TripPilot to manage your trip.
    </p>
  </div>
</body>
</html>`;
}

export function bookingEmailText(booking) {
  const transport =
    booking.selectedTransport || booking.selectedFlight || null;
  const hotel = booking.selectedHotel || null;
  const expenses = booking.expenses || {};

  return [
    `TripPilot AI — Booking confirmed (${booking.id})`,
    ``,
    `${booking.origin} → ${booking.destination} · ${booking.days} days${booking.startDate ? ` · ${booking.startDate}` : ""} · ${booking.travelers} traveller(s)`,
    ``,
    `Travel: ${transport ? `${transport.mode} · ${transport.provider || transport.airline || ""} · ${transport.code || ""} · ${transport.duration} · ${rupees(transport.totalPrice)}` : "Arranged by TripPilot"}`,
    `Stay: ${hotel ? hotel.name : "Recommended stay (included in estimate)"}`,
    ``,
    `Expense Breakdown:`,
    `  Accommodation:    ${rupees(expenses.accommodation)}`,
    `  Food & Dining:    ${rupees(expenses.food)}`,
    `  Local Transport:  ${rupees(expenses.localTransport)}`,
    `  Activities:       ${rupees(expenses.activities)}`,
    `  Inter-city:       ${rupees(expenses.intercity ?? transport?.totalPrice)}`,
    `  TOTAL ESTIMATE:   ${rupees(booking.total)}`,
    ``,
    `Contact: ${booking.contact?.name || ""} · ${booking.contact?.email || ""}${booking.contact?.phone ? ` · ${booking.contact.phone}` : ""}`,
    ``,
    `Book with partners:`,
    `  Flights: https://www.makemytrip.com/flights/`,
    `  Hotels: https://www.booking.com/search.html?ss=${encodeURIComponent(booking.destination || "")}`,
    `  IRCTC (Trains): https://www.irctc.co.in/nget/train-search`,
    ``,
    `This is a demo confirmation. No payment was taken and no real reservation was created.`,
  ].join("\n");
}

async function sendWithEthereal(booking, recipient) {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const from = process.env.MAIL_FROM || "TripPilot AI <gunutig123@gmail.com>";

  const info = await transporter.sendMail({
    from,
    to: recipient,
    subject: `TripPilot AI — ${booking.origin} to ${booking.destination} is booked ✅ (${booking.id})`,
    text: bookingEmailText(booking),
    html: bookingEmailHtml(booking),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[TripPilot Mailer] Sent via Ethereal test inbox. Preview URL: ${previewUrl}`);

  return {
    ...info,
    previewUrl,
    mode: "test_preview",
  };
}

export async function sendBookingEmail(booking) {
  const recipient = booking.contact?.email;

  if (!recipient) {
    const error = new Error("A recipient email is required.");
    error.code = "EMAIL_RECIPIENT_MISSING";
    throw error;
  }

  const mail = config();

  // If real SMTP is configured and not a placeholder, try sending with it
  if (mail) {
    try {
      const transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.secure,
        auth: mail.auth,
      });

      const info = await transporter.sendMail({
        from: mail.from,
        to: recipient,
        subject: `TripPilot AI — ${booking.origin} to ${booking.destination} is booked ✅ (${booking.id})`,
        text: bookingEmailText(booking),
        html: bookingEmailHtml(booking),
      });

      return { ...info, mode: "smtp" };
    } catch (err) {
      console.warn("[TripPilot Mailer] Gmail SMTP failed, falling back to online preview:", err.message);
      // Fallback to Ethereal preview so the user can view the email online immediately
      return await sendWithEthereal(booking, recipient);
    }
  }

  // If no SMTP configured, use Ethereal for immediate live email preview
  return await sendWithEthereal(booking, recipient);
}
