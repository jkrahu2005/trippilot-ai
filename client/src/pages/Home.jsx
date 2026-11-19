import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  Compass,
  ExternalLink,
  IndianRupee,
  LoaderCircle,
  Mail,
  MapPin,
  Plane,
  Printer,
  Route,
  Sparkles,
  Ticket,
  Train,
  Users,
  WalletCards,
  CloudSun,
  XCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { loadBookings } from "../lib/booking";
import { sendBookingConfirmationEmail } from "../services/booking.service";
import { bookingMailto } from "../components/booking/BookingConfirmation";

const MODE_ICON = {
  Flight: Plane,
  Train: Train,
  Bus: Bus,
  Car: Car,
};

function Home() {
  const [bookings, setBookings] = useState(() => loadBookings());
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("overview");

  const active = useMemo(
    () => bookings.find((b) => b.id === activeId) || null,
    [bookings, activeId]
  );

  const refresh = () => setBookings(loadBookings());

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };
  return (
    <main className="min-h-screen bg-base-100 text-base-content overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-sm">
            <Compass size={21} strokeWidth={2.2} />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight">TripPilot</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-base-content/45">
              AI Travel Planner
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-base-content/65 md:flex">
          <a href="#how-it-works" className="transition hover:text-base-content">
            How it works
          </a>

          <a href="#features" className="transition hover:text-base-content">
            Features
          </a>
        </div>

        <Link
          to="/plan"
          className="btn btn-primary rounded-xl px-5 shadow-none"
        >
          Plan a trip
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left */}
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 text-sm font-medium text-base-content/65 backdrop-blur">
              <Sparkles size={15} className="text-accent" />
              <span>Planning, optimized by AI</span>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Go somewhere
              <span className="block text-primary">worth remembering.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-base-content/60">
              Tell TripPilot where you're starting, where you're headed, and
              what you love. It builds your itinerary, plans your journey,
              checks the weather, estimates costs, and refines the trip for you.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/plan"
                className="btn btn-primary h-14 rounded-xl px-7 text-base shadow-none"
              >
                Start planning
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how-it-works"
                className="btn btn-ghost h-14 rounded-xl border border-base-300 bg-base-100 px-7 text-base text-base-content/75 hover:bg-base-200"
              >
                See how it works
              </a>
            </div>

            {/* Small metrics */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p className="text-2xl font-semibold tracking-tight">5</p>
                <p className="mt-1 text-xs text-base-content/50">
                  AI agents
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p className="text-2xl font-semibold tracking-tight">Live</p>
                <p className="mt-1 text-xs text-base-content/50">
                  Weather data
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100/80 p-4">
                <p className="text-2xl font-semibold tracking-tight">1</p>
                <p className="mt-1 text-xs text-base-content/50">
                  Smart itinerary
                </p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto w-full max-w-xl">
            {/* Main travel composition */}
            <div className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-neutral p-3 shadow-2xl">
              {/* Image-like visual made without external assets */}
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-base-200">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(225,197,119,0.75),transparent_22%),linear-gradient(145deg,#d9e2dc_0%,#9eb8aa_42%,#657c73_100%)]" />

                {/* Sun */}
                <div className="absolute right-12 top-12 h-24 w-24 rounded-full bg-accent/80 blur-[1px]" />

                {/* Mountains */}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-72 bg-[clip-path:polygon(0_72%,12%_50%,22%_62%,34%_33%,48%_60%,60%_40%,72%_63%,84%_45%,100%_67%,100%_100%,0_100%)] bg-primary/55" />
                  <div className="-mt-24 h-56 bg-[clip-path:polygon(0_70%,16%_45%,28%_58%,42%_30%,57%_55%,70%_38%,84%_60%,100%_42%,100%_100%,0_100%)] bg-neutral/70" />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral/85 via-transparent to-transparent" />

                {/* Destination label */}
                <div className="absolute bottom-7 left-7 right-7 text-neutral-content">
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-content/60">
                    Your next destination
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-4xl font-semibold tracking-tight">
                        Somewhere
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-content/70">
                        <MapPin size={15} />
                        <span>Ready when you are</span>
                      </div>
                    </div>

                    <div className="hidden rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur sm:block">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-content/60">
                        Trip style
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Personalized
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating intelligence card */}
            <div className="absolute -bottom-5 -left-4 w-[250px] rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xl sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <CloudSun size={20} />
                </div>

                <div>
                  <p className="text-xs text-base-content/45">
                    Trip intelligence
                  </p>
                  <p className="text-sm font-semibold">
                    Weather-aware planning
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-base-200 px-3 py-2.5">
                <span className="text-xs text-base-content/55">
                  Outdoor plans
                </span>
                <span className="text-xs font-semibold text-secondary">
                  Optimized
                </span>
              </div>
            </div>

            {/* Floating budget card */}
            <div className="absolute -right-3 top-12 w-[210px] rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xl sm:-right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-base-content">
                  <WalletCards size={19} />
                </div>

                <div>
                  <p className="text-xs text-base-content/45">
                    Estimated budget
                  </p>
                  <p className="text-lg font-semibold">₹28.5K</p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-300">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section
        id="features"
        className="border-y border-base-300 bg-base-200/50"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-base-300 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-10">
          <div className="px-0 py-8 sm:px-8">
            <Route size={20} className="text-primary" />
            <h3 className="mt-4 font-semibold">From door to destination</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              Plans the journey from your starting point through the entire
              trip.
            </p>
          </div>

          <div className="px-0 py-8 sm:px-8">
            <CloudSun size={20} className="text-secondary" />
            <h3 className="mt-4 font-semibold">Weather-aware decisions</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              Forecast data can trigger intelligent itinerary adjustments.
            </p>
          </div>

          <div className="px-0 py-8 sm:px-8">
            <Sparkles size={20} className="text-accent" />
            <h3 className="mt-4 font-semibold">Continuously refined</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              Multiple agents collaborate to turn a rough plan into a useful
              itinerary.
            </p>
          </div>
        </div>
      </section>

      {/* My bookings */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-20 lg:px-10 lg:pt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/40">
              Your trips
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              My bookings
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/55">
              Finalized trips saved on this device. Open any booking to review its full details, itinerary, expenses, and contact info.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-4 py-2 text-sm font-medium text-base-content/65 transition hover:border-base-content/20 hover:text-base-content"
          >
            Refresh
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-base-300 bg-base-100/70 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Ticket size={20} />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/50">
              Plan a trip, customize it on the dashboard, and finalize it — your confirmed bookings will appear here.
            </p>
            <Link
              to="/plan"
              className="btn btn-primary mt-5 rounded-xl px-5 shadow-none"
            >
              Plan a trip
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {bookings.map((booking) => {
                const transport = booking.selectedTransport || booking.selectedFlight || null;
                const ModeIcon = (transport && MODE_ICON[transport.mode]) || Plane;
                const isActive = booking.id === activeId;
                const cancelled = booking.status === "Cancelled";

                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => {
                      setActiveId(booking.id);
                      setTab("overview");
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-primary/30 bg-primary/[0.04] shadow-sm"
                        : "border-base-300 bg-base-100 hover:border-base-content/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold tracking-tight">
                            {booking.origin} → {booking.destination}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                              cancelled
                                ? "bg-error/10 text-error"
                                : "bg-success/10 text-success"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/50">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />
                            {booking.days} days{booking.startDate ? ` · ${booking.startDate}` : ""}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} />
                            {booking.travelers} traveller{booking.travelers === 1 ? "" : "s"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ModeIcon size={12} />
                            {transport?.mode || "Transport"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold">
                          ₹{Number(booking.total || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="mt-0.5 text-[10px] text-base-content/40">
                          {booking.id}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-base-content/35">
                      Booked {formatDate(booking.createdAt)} · {booking.contact?.email || "No email"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.75rem] border border-base-300 bg-base-100 p-5 sm:p-6">
              {!active ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 text-base-content/45">
                    <Ticket size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">Select a booking</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-base-content/50">
                    Choose a booking from the list to see its details, itinerary, expenses, and confirmation info in tabs.
                  </p>
                </div>
              ) : (
                <BookingDetails
                  booking={active}
                  tab={tab}
                  setTab={setTab}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/40">
            How TripPilot works
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            One request.
            <span className="block text-base-content/45">
              Multiple layers of intelligence.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Tell us your trip",
              description:
                "Choose your origin, destination, duration, budget, and interests.",
            },
            {
              number: "02",
              title: "TripPilot plans",
              description:
                "Specialized agents handle itinerary, transport, budget, and weather.",
            },
            {
              number: "03",
              title: "Your trip gets refined",
              description:
                "The optimizer reviews the complete plan and makes context-aware changes.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-base-300 bg-base-100 p-7"
            >
              <span className="text-sm font-semibold text-base-content/30">
                {item.number}
              </span>

              <h3 className="mt-12 text-xl font-semibold tracking-tight">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-base-content/55">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] bg-primary px-7 py-12 text-primary-content sm:px-12 sm:py-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-content/55">
                Ready to go?
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Your next trip starts with one idea.
              </h2>
            </div>

            <Link
              to="/plan"
              className="btn h-14 rounded-xl border-0 bg-base-100 px-7 text-base text-primary shadow-none hover:bg-base-200"
            >
              Build my itinerary
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function BookingDetails({ booking, tab, setTab }) {
  const transport = booking.selectedTransport || booking.selectedFlight || null;
  const hotel = booking.selectedHotel || null;
  const cancelled = booking.status === "Cancelled";
  const ModeIcon = (transport && MODE_ICON[transport.mode]) || Plane;
  const itinerary = booking.itinerary || { days: [] };
  const expenses = booking.expenses || {};

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailError, setEmailError] = useState("");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: "Itinerary" },
    { id: "expenses", label: "Expenses" },
    { id: "contact", label: "Contact" },
    { id: "book", label: "Book Now" },
  ];

  const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const EXPENSE_COLORS = ["#4f86c6", "#6b9e5e", "#c6844f", "#c64f7a", "#7a4fc6"];
  const intercityCost = Number(expenses.intercity ?? transport?.totalPrice ?? 0);
  const chartData = [
    { name: "Hotel", value: Number(expenses.accommodation) || 0 },
    { name: "Transport", value: intercityCost },
    { name: "Activities", value: Number(expenses.activities) || 0 },
    { name: "Food", value: Number(expenses.food) || 0 },
    { name: "Local", value: Number(expenses.localTransport) || 0 },
  ].filter((d) => d.value > 0);

  const enc = encodeURIComponent;
  const mode = transport?.mode || "Flight";
  const from = booking.origin || "";
  const to = booking.destination || "";
  const travelLinks =
    mode === "Train"
      ? [
          { label: "IRCTC — Book Train", href: "https://www.irctc.co.in/nget/train-search" },
          { label: "RailYatri", href: "https://www.railyatri.in/" },
        ]
      : mode === "Bus"
      ? [
          { label: `RedBus — ${from} to ${to}`, href: `https://www.redbus.in/search?srcName=${enc(from)}&destName=${enc(to)}` },
          { label: "AbhiBus", href: "https://www.abhibus.com/" },
        ]
      : [
          { label: "MakeMyTrip Flights", href: "https://www.makemytrip.com/flights/" },
          { label: "Goibibo Flights", href: "https://www.goibibo.com/flights/" },
          { label: "Yatra Flights", href: "https://www.yatra.com/" },
          { label: `Google Flights — ${from} to ${to}`, href: `https://www.google.com/search?q=flights+from+${enc(from)}+to+${enc(to)}` },
        ];

  const hotelLinks = [
    { label: `Booking.com — ${to}`, href: `https://www.booking.com/search.html?ss=${enc(to)}` },
    { label: "MakeMyTrip Hotels", href: "https://www.makemytrip.com/hotels/" },
    { label: "OYO Rooms", href: "https://www.oyorooms.com/" },
    { label: `Airbnb — ${to}`, href: `https://www.airbnb.com/s/${enc(to)}/homes` },
  ];

  async function resendEmail() {
    setSendingEmail(true);
    setEmailStatus(null);
    setEmailError("");
    try {
      const res = await sendBookingConfirmationEmail(booking);
      if (res.status === "sent") {
        setEmailStatus("sent");
      } else {
        setEmailStatus(res.status);
        setEmailError(res.message || "Email could not be delivered");
      }
    } catch (err) {
      setEmailStatus("failed");
      setEmailError(err.message || "Could not reach email service");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div>
      <div className="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-t-[1.5rem] bg-gradient-to-br from-primary/80 to-primary px-5 py-5 text-primary-content sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {booking.origin} → {booking.destination}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                cancelled ? "bg-error/20 text-error" : "bg-white/15 text-primary-content"
              }`}
            >
              {cancelled ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
              {booking.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-primary-content/70">
            Ref {booking.id} · {booking.days} days · {booking.travelers} traveller{booking.travelers === 1 ? "" : "s"}
            {booking.startDate ? ` · ${booking.startDate}` : ""}
          </p>
          <p className="mt-1 text-sm font-semibold">{rupees(booking.total)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-base-200 pb-3">
        {tabs.map((t) => (
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
        <button
          type="button"
          onClick={() => window.print()}
          title="Print / Export"
          className="ml-auto rounded-full bg-base-200/70 px-2.5 py-1.5 text-base-content/50 transition hover:text-base-content"
        >
          <Printer size={12} />
        </button>
      </div>

      <div className="mt-4">
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={ModeIcon} label={transport?.mode || "Travel"} value={transport?.provider || transport?.airline || "Arranged by TripPilot"} sub={transport ? (transport.depart ? `${transport.depart} → ${transport.arrive} · ${transport.duration}` : `${transport.duration} · ${transport.code || "door to door"}`) : "See itinerary"} />
              <Info icon={BedDouble} label="Stay" value={hotel?.name || "Recommended stay"} sub={hotel?.amenities || "Included in estimate"} />
              <Info icon={CalendarDays} label="Trip" value={`${booking.origin} → ${booking.destination}`} sub={`${booking.days} days${booking.startDate ? ` · ${booking.startDate}` : " · Flexible dates"}`} />
              <Info icon={IndianRupee} label="Booking total" value={rupees(booking.total)} sub="Demo estimate · no payment taken" />
            </div>
            <div className="rounded-2xl border border-base-content/8 bg-base-200/30 p-3.5 text-xs leading-6 text-base-content/55">
              <strong className="text-base-content/70">Places &amp; experiences:</strong>{" "}
              {(booking.interests || []).length ? booking.interests.join(", ") : "Personalized by your itinerary"}.
              Open the Itinerary tab for day-wise places to visit and activities.
            </div>
            {!cancelled && (
              <div className="rounded-2xl border border-base-content/8 bg-base-100 p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-base-content/40" />
                    <span className="text-xs text-base-content/70">
                      {emailStatus === "sent" ? (
                        <span className="font-semibold text-success">Confirmation email sent to {booking.contact?.email}!</span>
                      ) : emailStatus ? (
                        <span className="text-warning font-medium">Automatic email not configured</span>
                      ) : (
                        <span>Send booking confirmation to <strong>{booking.contact?.email || "traveller"}</strong></span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resendEmail}
                      disabled={sendingEmail}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-60"
                    >
                      {sendingEmail ? <LoaderCircle size={11} className="animate-spin" /> : <Mail size={11} />}
                      {sendingEmail ? "Sending…" : "Send via server"}
                    </button>

                    <a
                      href={bookingMailto(booking)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-base-content/10 bg-base-100 px-3 py-1.5 text-[11px] font-semibold text-base-content/65 transition hover:bg-base-200"
                    >
                      Open in Mail app ↗
                    </a>
                  </div>
                </div>

                {emailStatus && emailStatus !== "sent" && (
                  <p className="text-[11px] leading-5 text-base-content/50 border-t border-base-content/6 pt-2">
                    {emailError || "Server SMTP requires a 16-character Gmail App Password in server/.env."}{" "}
                    You can click <strong>Open in Mail app</strong> above to send the full details directly!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "itinerary" && (
          <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {(itinerary.days || []).length === 0 ? (
              <p className="text-sm text-base-content/50">No itinerary details saved for this booking.</p>
            ) : (
              itinerary.days.map((day) => (
                <div key={day.day} className="rounded-2xl border border-base-content/8 bg-base-100 p-3.5">
                  <div className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Day {day.day}</div>
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
          <div className="space-y-3">
            {chartData.length > 0 && (
              <div className="rounded-2xl border border-base-content/8 bg-base-100 p-3.5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-base-content/40">
                  Budget distribution
                </p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => rupees(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {[
              ["Accommodation / hotel", booking.expenses?.accommodation ?? booking.breakdown?.accommodation],
              ["Food & dining", booking.expenses?.food ?? booking.breakdown?.food],
              ["Local transport", booking.expenses?.localTransport ?? booking.breakdown?.localTransport],
              ["Activities & places to visit", booking.expenses?.activities ?? booking.breakdown?.activities],
              ["Inter-city transport", booking.expenses?.intercity ?? transport?.totalPrice],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-base-content/8 bg-base-100 px-3.5 py-2.5 text-sm">
                <span className="text-base-content/60">{label}</span>
                <span className="font-semibold">{val != null ? rupees(val) : "Included"}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3.5 py-3 text-sm font-semibold text-primary">
              <span>Total estimate</span>
              <span>{rupees(booking.total)}</span>
            </div>
            <p className="pt-1 text-[11px] leading-5 text-base-content/40">
              Expenses reflect the customized plan at the time of booking (hotel, activities/places, transport and other costs).
            </p>
          </div>
        )}

        {tab === "contact" && (
          <div className="space-y-3">
            <Info icon={Users} label="Lead traveller" value={booking.contact?.name || "—"} sub={booking.contact?.email || ""} />
            <Info icon={Ticket} label="Booking reference" value={booking.id} sub={booking.contact?.phone ? `Phone: ${booking.contact.phone}` : "Saved locally on this device"} />
            <div className="rounded-2xl border border-base-content/8 bg-base-200/30 p-3.5 text-xs leading-6 text-base-content/55">
              Confirmation details can be sent to <strong>{booking.contact?.email || "your email"}</strong> from the Overview tab. Use the "Send email" button or the booking links in the "Book Now" tab.
            </div>
          </div>
        )}

        {tab === "book" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-3.5">
              <p className="text-xs font-semibold text-primary mb-1">ℹ️ Real Booking Links</p>
              <p className="text-[11px] leading-5 text-base-content/55">
                TripPilot prepares and optimizes your plan — to make real reservations, book directly with these verified partners:
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-base-content/35 mb-2">
                {mode === "Train" ? "Train booking" : mode === "Bus" ? "Bus booking" : "Flight booking"}
              </p>
              <div className="flex flex-wrap gap-2">
                {travelLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                  >
                    {link.label}
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-base-content/35 mb-2">
                Hotel / Stay
              </p>
              <div className="flex flex-wrap gap-2">
                {hotelLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/5 px-3.5 py-2 text-[11px] font-semibold text-secondary transition hover:bg-secondary/10"
                  >
                    {link.label}
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/plan"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-content transition hover:-translate-y-0.5"
        >
          Plan a similar trip
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-base-content/8 bg-base-100 p-3.5">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-base-content/35">
        <Icon size={11} />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-base-content/45">{sub}</div> : null}
    </div>
  );
}

export default Home;