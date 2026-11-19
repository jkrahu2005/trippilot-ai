import { useState } from "react";
import {
  AlertCircle,
  BedDouble,
  Bus,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  IndianRupee,
  LifeBuoy,
  LoaderCircle,
  Mail,
  Pencil,
  Plane,
  ShieldCheck,
  Train,
  Users,
  XCircle,
} from "lucide-react";

const MODE_META = {
  Flight: { icon: Plane, label: "Flight" },
  Train: { icon: Train, label: "Train" },
  Bus: { icon: Bus, label: "Bus" },
  Car: { icon: Car, label: "Car" },
};

const rupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function itineraryText(itinerary) {
  const days = itinerary?.days || [];

  return days
    .map((day) => {
      const slots = ["morning", "afternoon", "evening"]
        .map((slot) => {
          const item = day?.[slot];
          const activity =
            item?.activity || item?.title || null;
          return activity
            ? `${slot}: ${activity}`
            : null;
        })
        .filter(Boolean)
        .join("\n    ");

      return `Day ${day.day}:\n    ${slots}`;
    })
    .join("\n\n");
}

export function bookingMailto(booking) {
  const transport =
    booking.selectedTransport || booking.selectedFlight || null;
  const hotel = booking.selectedHotel || null;

  const subject = `TripPilot AI — ${booking.origin} → ${booking.destination} is booked (${booking.id})`;

  const body = [
    `TripPilot AI — Booking confirmation`,
    ``,
    `Booking reference: ${booking.id}`,
    `Trip: ${booking.origin} → ${booking.destination} · ${booking.days} days${booking.startDate ? ` · ${booking.startDate}` : ""}`,
    `Travellers: ${booking.travelers} · Lead: ${booking.contact?.name || ""}`,
    ``,
    transport
      ? `Travel: ${transport.mode} · ${transport.provider || transport.airline || ""}${transport.code ? ` · ${transport.code}` : ""} · ${transport.duration} · ${rupees(transport.totalPrice)}`
      : "Travel: arranged by TripPilot",
    hotel
      ? `Stay: ${hotel.name}${hotel.amenities ? ` · ${hotel.amenities}` : ""}`
      : "Stay: recommended stay (included in the estimate)",
    `Total estimate: ${rupees(booking.total)}`,
    ``,
    itineraryText(booking.itinerary)
      ? `Itinerary:\n${itineraryText(booking.itinerary)}`
      : "",
    ``,
    `This is a demo confirmation — no payment was taken and no real reservation was created.`,
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${booking.contact?.email || ""}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function partnerLinks(booking) {
  const from = booking.origin || "";
  const to = booking.destination || "";
  const enc = encodeURIComponent;
  const mode = booking.selectedTransport?.mode || "Flight";
  const flightLinks = [];
  const trainBusLinks = [];
  const hotelLinks = [];

  if (mode === "Train") {
    trainBusLinks.push({ label: "IRCTC — Book train", href: "https://www.irctc.co.in/nget/train-search" });
    trainBusLinks.push({ label: "RailYatri", href: "https://www.railyatri.in/" });
    trainBusLinks.push({ label: "AbhiBus", href: "https://www.abhibus.com/" });
  } else if (mode === "Bus") {
    trainBusLinks.push({ label: `RedBus — ${from} to ${to}`, href: `https://www.redbus.in/search?srcName=${enc(from)}&destName=${enc(to)}` });
    trainBusLinks.push({ label: "AbhiBus", href: "https://www.abhibus.com/" });
  } else if (mode === "Car" || mode === "Self-drive") {
    flightLinks.push({ label: `Outstation cabs — ${from} to ${to}`, href: `https://www.google.com/search?q=outstation+cab+from+${enc(from)}+to+${enc(to)}` });
    flightLinks.push({ label: "Ola Outstation", href: "https://www.olacabs.com/inter-city" });
  } else {
    flightLinks.push({ label: `MakeMyTrip Flights`, href: `https://www.makemytrip.com/flights/` });
    flightLinks.push({ label: `Goibibo Flights`, href: `https://www.goibibo.com/flights/` });
    flightLinks.push({ label: `Yatra Flights`, href: `https://www.yatra.com/` });
    flightLinks.push({ label: `Google Flights — ${from} to ${to}`, href: `https://www.google.com/search?q=flights+from+${enc(from)}+to+${enc(to)}` });
  }

  hotelLinks.push({ label: `Booking.com — ${to}`, href: `https://www.booking.com/search.html?ss=${enc(to)}` });
  hotelLinks.push({ label: `MakeMyTrip Hotels`, href: `https://www.makemytrip.com/hotels/` });
  hotelLinks.push({ label: `OYO Rooms`, href: `https://www.oyorooms.com/` });
  hotelLinks.push({ label: `Airbnb — ${to}`, href: `https://www.airbnb.com/s/${enc(to)}/homes` });

  const travelLinks = (mode === "Train" || mode === "Bus") ? trainBusLinks : flightLinks;
  return { travelLinks, hotelLinks, travelLabel: mode === "Train" ? "Train booking" : mode === "Bus" ? "Bus booking" : mode === "Car" ? "Cab booking" : "Flight booking" };
}

function BookingConfirmation({
  booking,
  emailStatus,
  onModify,
  onCancel,
  onDownload,
}) {
  const [tab, setTab] = useState("overview");

  if (!booking) return null;

  const cancelled = booking.status === "Cancelled";

  const selectedTransport =
    booking.selectedTransport || booking.selectedFlight || null;

  const ModeIcon =
    (selectedTransport && MODE_META[selectedTransport.mode]?.icon) ||
    Plane;

  const modeLabel =
    (selectedTransport && MODE_META[selectedTransport.mode]?.label) ||
    "Transport";

  const created = new Date(
    booking.createdAt
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const itinerary = booking.itinerary || { days: [] };
  const expenses = booking.expenses || {};

  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${
        cancelled
          ? "border-error/20 bg-error/[0.035]"
          : "border-success/25 bg-success/[0.045]"
      }`}
    >
      <div
        className={`absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl ${
          cancelled ? "bg-error/10" : "bg-success/10"
        }`}
      />

      <div className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                cancelled
                  ? "bg-error/10 text-error"
                  : "bg-success/10 text-success"
              }`}
            >
              {cancelled ? (
                <XCircle size={22} />
              ) : (
                <Check size={22} />
              )}
            </div>

            <div>
              <div
                className={`tp-eyebrow ${
                  cancelled ? "text-error" : "text-success"
                }`}
              >
                {cancelled
                  ? "Booking cancelled"
                  : "Booking confirmed"}
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {cancelled
                  ? "Your trip has been cancelled."
                  : `You're booked, ${
                      booking.contact?.name?.split(" ")[0] ||
                      "traveller"
                    }.`}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/50">
                {cancelled
                  ? "The booking has been marked cancelled. You can start a fresh plan or modify the itinerary and book again."
                  : "Your itinerary, transport and stay selections are confirmed. A copy has been saved to this browser."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                cancelled
                  ? "bg-error/10 text-error"
                  : "bg-success/10 text-success"
              }`}
            >
              {booking.status}
            </span>

            <span className="rounded-full border border-base-content/10 bg-base-100/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/45">
              {booking.id}
            </span>
          </div>
        </div>

        {/* Booking details in tabs */}
        <div className="mt-6 rounded-2xl border border-base-content/8 bg-base-100/60 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 border-b border-base-content/8 pb-3">
            {[
              { id: "overview", label: "Overview" },
              { id: "itinerary", label: "Itinerary" },
              { id: "expenses", label: "Expenses" },
              { id: "email", label: "Email & booking links" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  tab === t.id
                    ? "bg-primary text-primary-content"
                    : "bg-base-200/70 text-base-content/60 hover:text-base-content"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === "overview" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  icon={CalendarDays}
                  label="Trip"
                  value={`${booking.origin} → ${booking.destination}`}
                  sub={`${booking.days} days · ${booking.startDate || "Flexible"}`}
                />
                <Detail
                  icon={Users}
                  label="Travellers"
                  value={`${booking.travelers} ${booking.travelers === 1 ? "traveller" : "travellers"}`}
                  sub={booking.contact?.email}
                />
                <Detail
                  icon={ModeIcon}
                  label={modeLabel}
                  value={selectedTransport?.provider || selectedTransport?.airline || "Transport included"}
                  sub={selectedTransport ? (selectedTransport.depart ? `${selectedTransport.depart} → ${selectedTransport.arrive} · ${selectedTransport.duration}` : `${selectedTransport.duration} · whole vehicle`) : "Based on your route"}
                />
                <Detail
                  icon={BedDouble}
                  label="Stay"
                  value={booking.selectedHotel?.name || "Recommended stay"}
                  sub={booking.selectedHotel ? "Selected during customization" : "Included in estimate"}
                />
                <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-base-content/8 bg-base-100/50 p-3.5 text-xs leading-6 text-base-content/55">
                  <strong className="text-base-content/70">Places & activities:</strong>{" "}
                  {(booking.interests || []).length ? booking.interests.join(", ") : "Personalized in your itinerary"}. See the Itinerary tab for day-wise places to visit and experiences.
                </div>
              </div>
            )}

            {tab === "itinerary" && (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {(itinerary.days || []).length === 0 ? (
                  <p className="text-sm text-base-content/50">No itinerary details saved for this booking.</p>
                ) : (
                  itinerary.days.map((day) => (
                    <div key={day.day} className="rounded-2xl border border-base-content/8 bg-base-100/70 p-3.5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Day {day.day}</div>
                      <div className="mt-2 space-y-1.5 text-sm text-base-content/70">
                        {["morning", "afternoon", "evening"].map((slot) => {
                          const item = day?.[slot];
                          const activity = item?.activity || item?.title;
                          if (!activity) return null;
                          return (
                            <div key={slot}>
                              <span className="font-medium capitalize text-base-content/55">{slot}:</span> {activity}
                              {item?.description ? <span className="text-base-content/45"> — {item.description}</span> : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "expenses" && (
              <div className="space-y-2">
                {[
                  ["Accommodation / hotel", expenses.accommodation],
                  ["Food & dining", expenses.food],
                  ["Local transport", expenses.localTransport],
                  ["Activities & places to visit", expenses.activities],
                  ["Inter-city transport", expenses.intercity ?? selectedTransport?.totalPrice],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-base-content/8 bg-base-100/70 px-3.5 py-2.5 text-sm">
                    <span className="text-base-content/60">{label}</span>
                    <span className="font-semibold">{val != null ? rupees(val) : "Included"}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3.5 py-3 text-sm font-semibold text-primary">
                  <span className="inline-flex items-center gap-1.5"><IndianRupee size={14} /> Total estimate</span>
                  <span>{rupees(booking.total)}</span>
                </div>
                <p className="pt-1 text-[11px] leading-5 text-base-content/40">
                  Customized expenses (hotel, transport, activities/places to visit, food, local travel) as saved at booking time.
                </p>
              </div>
            )}

            {tab === "email" && (
              <div className="grid gap-3 lg:grid-cols-2">
                {!cancelled ? (
                  <div className="rounded-2xl border border-base-content/8 bg-base-100/70 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/40">
                      <Mail size={12} />
                      Confirmation email
                    </div>

                    {emailStatus === "sending" ? (
                      <div className="mt-3 flex items-center gap-2 text-xs leading-5 text-base-content/60">
                        <LoaderCircle size={15} className="animate-spin text-primary" />
                        Sending the details to <strong>{booking.contact?.email}</strong>…
                      </div>
                    ) : emailStatus === "sent" ? (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-success">
                          <CheckCircle2 size={15} />
                          Confirmation sent
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-base-content/50">
                          A copy of your itinerary and booking reference <strong>{booking.id}</strong> has been emailed to {booking.contact?.email}.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                          <AlertCircle size={15} />
                          {emailStatus === "failed" ? "The email couldn't be sent" : "Automatic email isn't set up"}
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-base-content/50">
                          {emailStatus === "failed"
                            ? "The mail service on this demo isn't reachable. Send yourself the full details from your own mail app:"
                            : "This demo server has no mail credentials configured, so TripPilot can't send email by itself. Send yourself the full details instead:"}
                        </p>
                        <a
                          href={bookingMailto(booking)}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-content transition hover:-translate-y-0.5"
                        >
                          <Mail size={13} />
                          Email me these details
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-base-content/8 bg-base-100/70 p-4 text-sm text-base-content/55">
                    This booking is cancelled. You can modify the trip and book again to receive a new confirmation.
                  </div>
                )}

                <div className="rounded-2xl border border-base-content/8 bg-base-100/70 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/40">
                    <ExternalLink size={12} />
                    Actually book this trip
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-base-content/50">
                    TripPilot plans your itinerary — click below to make real reservations with our booking partners:
                  </p>

                  {/* Transport links */}
                  {(() => {
                    const { travelLinks, hotelLinks, travelLabel } = partnerLinks(booking);
                    return (
                      <>
                        <div className="mt-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-base-content/35 mb-1.5">{travelLabel}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {travelLinks.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                              >
                                {link.label}
                                <ExternalLink size={9} />
                              </a>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-base-content/35 mb-1.5">Hotel / Stay</p>
                          <div className="flex flex-wrap gap-1.5">
                            {hotelLinks.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-secondary/5 px-3 py-1.5 text-[11px] font-semibold text-secondary transition hover:bg-secondary/10"
                              >
                                {link.label}
                                <ExternalLink size={9} />
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-base-content/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/40">
              Booking total
            </div>

            <div className="mt-1 text-2xl font-semibold">
              ₹
              {Number(booking.total || 0).toLocaleString(
                "en-IN"
              )}
            </div>

            <div className="mt-1 text-[10px] text-base-content/35">
              Booked {created} · No payment taken in this demo
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-4 py-2.5 text-xs font-semibold text-base-content/65 transition hover:border-base-content/20 hover:text-base-content"
            >
              <Download size={14} />
              Download itinerary
            </button>

            <button
              type="button"
              onClick={onModify}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              <Pencil size={14} />
              {cancelled ? "Start again from this trip" : "Modify trip"}
            </button>

            {!cancelled && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-full border border-error/20 bg-error/5 px-4 py-2.5 text-xs font-semibold text-error transition hover:bg-error/10"
              >
                <XCircle size={14} />
                Cancel booking
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-base-content/8 bg-base-100/50 px-4 py-3 text-[11px] leading-5 text-base-content/45 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <LifeBuoy size={13} className="text-secondary" />
            Post-booking support: changes, cancellations and
            travel questions are handled from here.
          </span>

          <span className="inline-flex items-center gap-1.5 font-medium text-success">
            <ShieldCheck size={12} />
            Confirmation stored locally
          </span>
        </div>
      </div>
    </section>
  );
}

function Detail({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-base-content/8 bg-base-100/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-base-content/35">
        <Icon size={11} />
        {label}
      </div>

      <div className="mt-1.5 line-clamp-1 text-xs font-semibold">
        {value}
      </div>

      {sub && (
        <div className="mt-0.5 line-clamp-1 text-[10px] text-base-content/40">
          {sub}
        </div>
      )}
    </div>
  );
}

export default BookingConfirmation;
