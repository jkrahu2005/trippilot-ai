import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  IndianRupee,
  Pencil,
  Plane,
  RefreshCw,
  Sparkles,
  Ticket,
} from "lucide-react";

import TripHeader from "../components/itinerary/TripHeader";
import AgentTrace from "../components/itinerary/AgentTrace";
import ItineraryTimeline from "../components/itinerary/ItineraryTimeline";

import TransportCard from "../components/transport/TransportCard";
import WeatherCard from "../components/weather/WeatherCard";
import BudgetCard from "../components/budget/BudgetCard";
import ExpenseDashboard from "../components/budget/ExpenseDashboard";

import ChangesCard from "../components/optimizer/ChangesCard";
import RecommendationsSection from "../components/recommendations/RecommendationsSection";

import PlanEditor from "../components/trip/PlanEditor";
import TransportOptions from "../components/trip/TransportOptions";
import HotelPicker from "../components/trip/HotelPicker";
import BudgetGuard from "../components/trip/BudgetGuard";

import BookingModal from "../components/booking/BookingModal";
import BookingConfirmation from "../components/booking/BookingConfirmation";

import { planTrip } from "../services/trip.service";
import { sendBookingConfirmationEmail } from "../services/booking.service";
import { buildDemoTrip } from "../lib/demoPlan";
import { buildTransportOptions } from "../lib/transport";
import { stayEstimate } from "../lib/stay";
import { buildTripMeta } from "../lib/tripChat";
import {
  createBooking,
  saveBooking,
  updateBooking,
} from "../lib/booking";

const STORAGE_KEY = "trippilot:trip-state";

function readTripState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function TripResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const stored = readTripState();

  /*
   * A browser refresh keeps the original navigation state around, which
   * can be older than the edits saved in sessionStorage. If the stored
   * copy belongs to the same generated trip, it is the better source.
   */
  const sameTrip = Boolean(
    location.state?.tripKey &&
      stored?.tripKey === location.state.tripKey
  );

  const initialTrip = sameTrip
    ? stored.trip
    : location.state?.result?.data || stored?.trip || null;

  const initialRequest = sameTrip
    ? stored.request || {}
    : location.state?.request || stored?.request || {};

  const initialMeta = sameTrip
    ? stored.meta ||
      buildTripMeta({
        request: initialRequest,
        trip: initialTrip,
      })
    : location.state?.meta ||
      stored?.meta ||
      buildTripMeta({
        request: initialRequest,
        trip: initialTrip,
      });

  const [tripKey] = useState(
    location.state?.tripKey || stored?.tripKey || null
  );

  const [trip, setTrip] = useState(initialTrip);
  const [request, setRequest] = useState(initialRequest);
  const [meta, setMeta] = useState(initialMeta);
  const [previewReason, setPreviewReason] = useState(
    sameTrip
      ? stored.previewReason || ""
      : location.state?.previewReason || ""
  );

  /*
   * A brand-new trip starts without a booking. Only restore a booking
   * when we are rehydrating the same trip after a refresh.
   */
  const [booking, setBooking] = useState(
    sameTrip ? stored.booking || null : null
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [expenseEditing, setExpenseEditing] = useState(false);  const [toast, setToast] = useState("");

  /* =======================================================
     PERSIST
     ======================================================= */

  useEffect(() => {
    if (!trip) return;

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripKey,
          trip,
          request,
          meta,
          booking,
          previewReason,
        })
      );
    } catch {
      /* Session storage is optional. */
    }
  }, [tripKey, trip, request, meta, booking, previewReason]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(""), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     NORMALIZE
     ======================================================= */

  const itinerary =
    trip?.optimizedItinerary || trip?.itinerary;

  const days =
    Number(meta?.days) ||
    Number(request?.days) ||
    Number(trip?.days) ||
    itinerary?.days?.length ||
    0;

  const origin =
    trip?.origin ||
    request?.origin ||
    "Your origin";

  const destination =
    trip?.destination ||
    request?.destination ||
    "Your destination";

  const interests =
    meta?.interests?.length > 0
      ? meta.interests
      : request?.interests || trip?.interests || [];

  const travelers = Math.max(
    1,
    Number(meta?.travelers) ||
      Number(request?.travelers) ||
      Number(trip?.travelers) ||
      2
  );

  const budgetLimit =
    Number(meta?.budgetLimit) ||
    Number(request?.budget) ||
    Number(trip?.budgetLimit) ||
    0;

  const recommendations = trip?.recommendations || null;
  const hotels = recommendations?.hotels || [];

  /*
   * Older sessions stored the choice as `selectedFlight`; newer
   * sessions store a full transport option (any mode). Read both.
   */
  const selectedTransport =
    trip?.selectedTransport || trip?.selectedFlight || null;
  const selectedHotel = trip?.selectedHotel || null;

  const nights = Math.max(1, days - 1);

  const intercityCost = Number(
    selectedTransport?.totalPrice ??
      trip?.transport?.estimatedCost ??
      0
  );

  const effectiveBudget = useMemo(() => {
    const budget = trip?.budget || {};

    const localTotal =
      (Number(budget.accommodation) || 0) +
      (Number(budget.food) || 0) +
      (Number(budget.localTransport) || 0) +
      (Number(budget.activities) || 0) +
      intercityCost;

    return {
      ...budget,
      total: localTotal,
    };
  }, [trip?.budget, intercityCost]);

  const transportGroups = useMemo(
    () =>
      buildTransportOptions({
        transport: trip?.transport,
        travelers,
        origin,
        destination,
      }),
    [
      trip?.transport,
      travelers,
      origin,
      destination,
    ]
  );

  const isPreview = Boolean(
    trip?.__preview || previewReason
  );

  /* =======================================================
     NO RESULT
     ======================================================= */

  if (!trip) {
    return (
      <div
        data-theme="trippilot-journey"
        className="tp-shell bg-base-100"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="tp-orb bg-primary/10"
            style={{ top: "-8rem", right: "-5rem" }}
          />

          <div
            className="tp-orb bg-secondary/10"
            style={{ bottom: "-10rem", left: "-5rem" }}
          />

          <div className="tp-grid absolute inset-0 opacity-[0.2]" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="tp-card w-full max-w-lg rounded-[2rem] p-8 text-center sm:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass size={25} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Your journey isn't here yet.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/55">
              This page needs a generated trip. Talk to the
              TripPilot copilot and it will build one for you.
            </p>

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-content transition hover:-translate-y-0.5"
            >
              Plan a trip
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ACTIONS
     ======================================================= */

  function selectTransport(option) {
    setTrip((current) => {
      const budget = { ...(current.budget || {}) };
      const localTotal =
        (Number(budget.accommodation) || 0) +
        (Number(budget.food) || 0) +
        (Number(budget.localTransport) || 0) +
        (Number(budget.activities) || 0);

      budget.total = localTotal + option.totalPrice;

      return {
        ...current,
        selectedTransport: option,
        transport: {
          ...current.transport,
          mode: option.mode,
          duration: option.duration,
          estimatedCost: option.totalPrice,
          _selected: true,
        },
        budget,
      };
    });

    setToast(
      `${option.provider} ${option.mode.toLowerCase()} selected · ₹${option.totalPrice.toLocaleString(
        "en-IN"
      )}`
    );
  }

  function selectHotel(hotel) {
    const estimate = stayEstimate(
      hotel,
      nights,
      travelers
    );

    setTrip((current) => {
      const transport = Number(
        current.selectedTransport?.totalPrice ??
          current.selectedFlight?.totalPrice ??
          current.transport?.estimatedCost ??
          0
      );

      const budget = {
        ...current.budget,
        accommodation: estimate.total,
        food: Number(current.budget?.food) || 0,
        localTransport:
          Number(current.budget?.localTransport) || 0,
        activities:
          Number(current.budget?.activities) || 0,
      };

      budget.total =
        budget.accommodation +
        budget.food +
        budget.localTransport +
        budget.activities +
        transport;

      return {
        ...current,
        selectedHotel: hotel,
        budget,
      };
    });

    setToast(
      `${hotel.name} selected · ₹${estimate.total.toLocaleString(
        "en-IN"
      )} stay`
    );
  }

  function handleSaveExpenses(values) {
    setTrip((current) => {
      const budget = { ...(current.budget || {}) };
      const intercity =
        Number(values.intercity) || 0;

      budget.accommodation =
        Number(values.accommodation) || 0;
      budget.food = Number(values.food) || 0;
      budget.localTransport =
        Number(values.localTransport) || 0;
      budget.activities = Number(values.activities) || 0;

      const localTotal =
        budget.accommodation +
        budget.food +
        budget.localTransport +
        budget.activities;

      budget.total = localTotal + intercity;

      const keepSelection =
        current.selectedTransport &&
        current.selectedTransport.totalPrice === intercity;

      return {
        ...current,
        selectedTransport: keepSelection
          ? current.selectedTransport
          : null,
        transport: keepSelection
          ? current.transport
          : {
              ...current.transport,
              estimatedCost: intercity,
              _selected: false,
            },
        budget,
      };
    });

    setExpenseEditing(false);
    setToast("Expenses updated");
  }

  function applyGeminiHotel(hotel) {
    const nightsCount = Math.max(1, days - 1);
    const rooms = Math.max(1, Math.ceil(travelers / 2));
    const stayCost = Number(hotel.estimatedStayCost) ||
      (Number(hotel.nightlyRate) || 0) * nightsCount * rooms;

    const normalized = {
      xid: hotel.xid || `ai-${Math.random().toString(36).slice(2, 8)}`,
      name: hotel.name || "AI suggested stay",
      address: hotel.area || "",
      amenities: hotel.amenities || "",
      kinds: "ai,suggested",
      rate: Number(hotel.nightlyRate) || 0,
      _ai: true,
    };

    setTrip((current) => {
      const rec = current.recommendations || {};
      const existing = Array.isArray(rec.hotels) ? rec.hotels : [];
      const hotels = [normalized, ...existing.filter((h) => h?.name !== normalized.name)].slice(0, 6);
      const budget = { ...(current.budget || {}) };
      const intercity = Number(
        current.selectedTransport?.totalPrice ??
          current.selectedFlight?.totalPrice ??
          current.transport?.estimatedCost ??
          0
      );
      budget.accommodation = stayCost;
      budget.total =
        (Number(budget.accommodation) || 0) +
        (Number(budget.food) || 0) +
        (Number(budget.localTransport) || 0) +
        (Number(budget.activities) || 0) +
        intercity;

      return {
        ...current,
        selectedHotel: normalized,
        recommendations: { ...rec, hotels },
        budget,
      };
    });
    setToast("Hotel option applied");
  }

  function applyGeminiTransportCost(option) {
    const cost = Number(option.estimatedCost) || 0;
    setTrip((current) => {
      const budget = { ...(current.budget || {}) };
      const localTotal =
        (Number(budget.accommodation) || 0) +
        (Number(budget.food) || 0) +
        (Number(budget.localTransport) || 0) +
        (Number(budget.activities) || 0);
      budget.total = localTotal + cost;
      const selected = {
        mode: option.mode || "Transport",
        provider: option.provider || "Suggested option",
        code: option.reason || "",
        duration: option.duration || "Estimate",
        stopLabel: "AI suggested",
        totalPrice: cost,
        perPerson: true,
        _ai: true,
      };
      return {
        ...current,
        selectedTransport: selected,
        transport: {
          ...(current.transport || {}),
          mode: selected.mode,
          duration: selected.duration,
          estimatedCost: cost,
          _selected: true,
        },
        budget,
      };
    });
    setToast("Transport option applied");
  }

  function applyGeminiActivities(list) {
    const total = (Array.isArray(list) ? list : []).reduce(
      (s, a) => s + (Number(a.estimatedCost) || 0),
      0
    );
    setTrip((current) => {
      const budget = { ...(current.budget || {}) };
      const intercity = Number(
        current.selectedTransport?.totalPrice ??
          current.selectedFlight?.totalPrice ??
          current.transport?.estimatedCost ??
          0
      );
      budget.activities = total;
      budget.total =
        (Number(budget.accommodation) || 0) +
        (Number(budget.food) || 0) +
        (Number(budget.localTransport) || 0) +
        (Number(budget.activities) || 0) +
        intercity;
      return {
        ...current,
        budget,
        recommendations: {
          ...(current.recommendations || {}),
          aiActivities: list,
        },
      };
    });
    setToast("Activities & places cost applied");
  }

  function applyGeminiBudgetAdjustments(adj) {
    setTrip((current) => {
      const budget = { ...(current.budget || {}) };
      if (adj.accommodation != null) budget.accommodation = Number(adj.accommodation) || 0;
      if (adj.food != null) budget.food = Number(adj.food) || 0;
      if (adj.localTransport != null) budget.localTransport = Number(adj.localTransport) || 0;
      if (adj.activities != null) budget.activities = Number(adj.activities) || 0;
      const intercity = adj.intercity != null
        ? Number(adj.intercity) || 0
        : Number(
            current.selectedTransport?.totalPrice ??
              current.selectedFlight?.totalPrice ??
              current.transport?.estimatedCost ??
              0
          );
      const keepSelection =
        adj.intercity == null ||
        (current.selectedTransport &&
          current.selectedTransport.totalPrice === intercity);
      const localTotal =
        (Number(budget.accommodation) || 0) +
        (Number(budget.food) || 0) +
        (Number(budget.localTransport) || 0) +
        (Number(budget.activities) || 0);
      budget.total = localTotal + intercity;
      return {
        ...current,
        selectedTransport: keepSelection ? current.selectedTransport : (adj.intercity != null ? null : current.selectedTransport),
        transport: {
          ...(current.transport || {}),
          estimatedCost: intercity,
          _selected: keepSelection,
        },
        budget,
      };
    });
    setToast("Gemini budget adjustments applied");
  }

  function optimizeBudget() {
    if (!budgetLimit) return;

    setTrip((current) => {
      const transport = Number(
        current.selectedTransport?.totalPrice ??
          current.selectedFlight?.totalPrice ??
          current.transport?.estimatedCost ??
          0
      );

      const budget = current.budget || {};

      const accommodation =
        Number(budget.accommodation) || 0;
      const food = Number(budget.food) || 0;
      const localTransport =
        Number(budget.localTransport) || 0;
      const activities = Number(budget.activities) || 0;

      const target =
        Number(budgetLimit) -
        transport -
        localTransport;

      let nextAccommodation = accommodation;
      let nextFood = food;
      let nextActivities = activities;

      if (target > 0) {
        const discounted =
          accommodation * 0.7 +
          food * 0.9 +
          activities * 0.55;

        const factor =
          discounted > target
            ? target / discounted
            : 1;

        nextAccommodation = Math.round(
          accommodation * 0.7 * factor
        );
        nextFood = Math.round(
          food * 0.9 * factor
        );
        nextActivities = Math.round(
          activities * 0.55 * factor
        );
      } else {
        nextAccommodation = 0;
        nextFood = 0;
        nextActivities = 0;
      }

      const nextBudget = {
        ...budget,
        accommodation: nextAccommodation,
        food: nextFood,
        localTransport,
        activities: nextActivities,
      };

      nextBudget.total =
        nextAccommodation +
        nextFood +
        localTransport +
        nextActivities +
        transport;

      return {
        ...current,
        budget: nextBudget,
      };
    });

    setToast("Trip rebalanced to fit your budget");
  }

  function handleSave(nextPlan, nextMeta) {
    setTrip(nextPlan);
    setMeta(nextMeta);
    setRequest((current) => ({
      ...current,
      origin: nextPlan.origin,
      destination: nextPlan.destination,
      days: nextMeta.days,
      interests: nextMeta.interests,
      travelers: nextMeta.travelers,
      budget: nextMeta.budgetLimit || null,
      startDate: nextMeta.startDate || "",
      preferences: {
        hotelPreference: nextMeta.hotelPreference || "",
        pace: nextMeta.pace || "",
      },
    }));

    setIsEditing(false);
    setEditorError("");

    if (booking && booking.status === "Confirmed") {
      const intercity = Number(
        nextPlan.selectedTransport?.totalPrice ??
          nextPlan.selectedFlight?.totalPrice ??
          nextPlan.transport?.estimatedCost ??
          0
      );
      const updated = updateBooking(booking.id, {
        origin: nextPlan.origin,
        destination: nextPlan.destination,
        days: nextMeta.days,
        travelers: nextMeta.travelers,
        startDate: nextMeta.startDate || "",
        interests: nextMeta.interests,
        selectedTransport:
          nextPlan.selectedTransport ||
          nextPlan.selectedFlight ||
          null,
        selectedHotel:
          nextPlan.selectedHotel || null,
        total: Number(nextPlan.budget?.total) || 0,
        expenses: {
          accommodation: Number(nextPlan.budget?.accommodation) || 0,
          food: Number(nextPlan.budget?.food) || 0,
          localTransport: Number(nextPlan.budget?.localTransport) || 0,
          activities: Number(nextPlan.budget?.activities) || 0,
          intercity,
        },
        itinerary:
          nextPlan.optimizedItinerary ||
          nextPlan.itinerary,
        updatedAt: new Date().toISOString(),
      });

      setBooking(updated);
      setToast("Trip and booking updated");
      return;
    }

    setToast("Changes saved");
  }

  async function handleRegenerate(planDraft, metaDraft) {
    if (isRegenerating) return;

    setIsRegenerating(true);
    setEditorError("");

    const payload = {
      origin: planDraft.origin,
      destination: planDraft.destination,
      days: Number(metaDraft.days) || days,
      interests: metaDraft.interests || [],
      travelers: Number(metaDraft.travelers) || travelers,
      budget: metaDraft.budgetLimit
        ? Number(metaDraft.budgetLimit)
        : null,
      startDate: metaDraft.startDate || "",
      preferences: {
        hotelPreference:
          metaDraft.hotelPreference || "",
        pace: metaDraft.pace || "",
      },
    };

    try {
      const result = await planTrip(payload);
      const nextTrip = result?.data;

      if (!nextTrip) {
        throw new Error("The planner returned an empty trip.");
      }

      setTrip(nextTrip);
      setMeta(
        buildTripMeta({
          request: payload,
          trip: nextTrip,
        })
      );
      setRequest(payload);
      setIsEditing(false);
      setToast("Trip re-planned with AI");
    } catch (error) {
      console.warn(
        "Re-plan failed, using local preview:",
        error
      );

      const demo = buildDemoTrip({
        origin: payload.origin,
        destination: payload.destination,
        days: payload.days,
        travelers: payload.travelers,
        interests: payload.interests,
        budget: payload.budget,
        startDate: payload.startDate,
        hotelPreference:
          payload.preferences?.hotelPreference,
        pace: payload.preferences?.pace,
      });

      setTrip(demo);
      setMeta(
        buildTripMeta({
          request: payload,
          trip: demo,
        })
      );
      setRequest(payload);
      setPreviewReason(
        error?.message ||
          "The live planning service could not be reached."
      );
      setIsEditing(false);
      setToast("Preview plan rebuilt locally");
    } finally {
      setIsRegenerating(false);
    }
  }

  function confirmBooking(contact) {
    const created = createBooking({
      plan: trip,
      meta,
      contact,
      selectedTransport,
      selectedHotel,
      total: effectiveBudget.total,
    });

    saveBooking(created);
    setBooking(created);
    setBookingOpen(false);
    setToast(`Booking ${created.id} confirmed`);
    setEmailStatus("sending");

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);

    sendBookingConfirmationEmail(created).then((result) => {
      setEmailStatus(result.status);
    });
  }

  function cancelBooking() {
    if (!booking) return;

    const confirmed = window.confirm(
      "Cancel this booking? You can always plan and book again."
    );

    if (!confirmed) return;

    const updated = updateBooking(booking.id, {
      status: "Cancelled",
      cancelledAt: new Date().toISOString(),
    });

    setBooking(updated);
    setToast("Booking cancelled");
  }

  function downloadItinerary() {
    window.print();
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div
      data-theme="trippilot-journey"
      className="tp-shell bg-base-100"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="tp-orb bg-primary/10"
          style={{ top: "-12rem", right: "-8rem" }}
        />

        <div
          className="tp-orb bg-secondary/10"
          style={{ top: "45%", left: "-12rem" }}
        />

        <div
          className="tp-orb bg-accent/10"
          style={{ bottom: "-12rem", right: "25%" }}
        />

        <div className="tp-grid absolute inset-0 opacity-[0.18]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral text-neutral-content transition-transform duration-200 group-hover:-rotate-6">
              <Compass size={20} />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-tight">
                TripPilot
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-base-content/45">
                Your journey
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditorError("");

                  window.setTimeout(() => {
                    document
                      .getElementById("trip-editor")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }, 60);
                }}
                className="group flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 text-sm font-medium text-base-content/65 backdrop-blur-md transition hover:border-base-content/20 hover:bg-base-100 hover:text-base-content"
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">
                  Customize
                </span>
              </button>
            )}

            {!booking && !isEditing && (
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="group hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-content transition hover:-translate-y-0.5 sm:flex"
              >
                <Ticket size={15} />
                Finalize
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="group flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 text-sm font-medium text-base-content/65 backdrop-blur-md transition hover:border-base-content/20 hover:bg-base-100 hover:text-base-content"
            >
              <RefreshCw
                size={15}
                className="transition-transform duration-300 group-hover:rotate-180"
              />

              <span className="hidden sm:inline">
                Plan another
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 px-6 pb-20 pt-6 lg:px-8 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          {/* Trip header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <TripHeader
              origin={origin}
              destination={destination}
              days={days}
              interests={interests}
            />
          </motion.div>

          {/* Preview banner */}
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent/[0.07] px-4 py-3 text-xs leading-5 text-base-content/65 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="font-semibold">
                  Preview plan.
                </span>{" "}
                The live AI agents aren't connected right now, so
                TripPilot built this plan locally. Everything is
                editable and bookable.
              </span>

              <Link
                to="/plan"
                className="shrink-0 font-semibold text-primary hover:text-primary/75"
              >
                Connect a live plan →
              </Link>
            </motion.div>
          )}

          {/* Booking confirmation */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <BookingConfirmation
                booking={booking}
                emailStatus={emailStatus}
                onModify={() => {
                  setIsEditing(true);

                  window.setTimeout(() => {
                    document
                      .getElementById("trip-editor")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }, 60);
                }}
                onCancel={cancelBooking}
                onDownload={downloadItinerary}
              />
            </motion.div>
          )}

          {/* Agent trace */}
          {trip.trace?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 print:hidden"
            >
              <AgentTrace trace={trip.trace} />
            </motion.div>
          )}

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <OverviewCard
              icon={CalendarDays}
              label="Duration"
              value={`${days} days`}
            />

            <OverviewCard
              icon={Plane}
              label="Distance"
              value={
                trip.transport?.distanceKm
                  ? `${Math.round(
                      trip.transport.distanceKm
                    )} km`
                  : "Planned"
              }
            />

            <OverviewCard
              icon={IndianRupee}
              label="Trip total"
              value={
                effectiveBudget.total
                  ? `₹${Number(
                      effectiveBudget.total
                    ).toLocaleString("en-IN")}`
                  : "Calculating"
              }
            />

            <OverviewCard
              icon={Sparkles}
              label={
                booking ? "Booking status" : "Planning status"
              }
              value={
                booking
                  ? booking.status
                  : isPreview
                    ? "Preview"
                    : "Optimized"
              }
              accent={Boolean(booking) || !isPreview}
            />
          </motion.div>

          {/* Editing */}
          {isEditing ? (
            <div id="trip-editor" className="mt-8 scroll-mt-6">
              <PlanEditor
                key={`${trip.destination}-${days}-${travelers}`}
                plan={trip}
                meta={meta}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false);
                  setEditorError("");
                }}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
                error={editorError}
              />
            </div>
          ) : (
            <>
              {/* Itinerary */}
              {itinerary?.days?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                  className="mt-10"
                >
                  <SectionHeading
                    eyebrow="Your days"
                    title="The journey, laid out."
                    description="A day-by-day plan refined using your interests, travel conditions and trip context."
                  />

                  <div className="mt-5">
                    <ItineraryTimeline
                      itinerary={itinerary}
                    />
                  </div>

                  <div className="mt-4 flex justify-end print:hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);

                        window.setTimeout(() => {
                          document
                            .getElementById("trip-editor")
                            ?.scrollIntoView({
                              behavior: "smooth",
                            });
                        }, 60);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-4 py-2 text-xs font-semibold text-base-content/55 transition hover:border-primary/25 hover:text-primary"
                    >
                      <Pencil size={13} />
                      Edit this itinerary
                    </button>
                  </div>
                </motion.section>
              )}

              {/* Transport + weather */}
              <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                {trip.transport && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.24,
                    }}
                  >
                    <TransportCard
                      transport={trip.transport}
                    />
                  </motion.div>
                )}

                {trip.weather?.days?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.29,
                    }}
                  >
                    <WeatherCard weather={trip.weather} />
                  </motion.div>
                )}
              </div>

              {/* Transport comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.32 }}
                className="mt-10"
              >
                <TransportOptions
                  groups={transportGroups}
                  selected={selectedTransport}
                  travelers={travelers}
                  onSelect={selectTransport}
                />
              </motion.div>

              {/* Stays */}
              {hotels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.36,
                  }}
                  className="mt-10"
                >
                  <HotelPicker
                    hotels={hotels}
                    nights={nights}
                    travelers={travelers}
                    selected={selectedHotel}
                    preference={meta.hotelPreference}
                    onSelect={selectHotel}
                  />
                </motion.div>
              )}

              {/* Budget */}
              {trip.budget && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.4,
                  }}
                  className="mt-10"
                >
                  <SectionHeading
                    eyebrow="Trip economics"
                    title="Know where the money goes."
                    description="An estimated breakdown across accommodation, food, local transport, activities and inter-city travel."
                  />

                  <div className="mt-5">
                    <BudgetCard budget={effectiveBudget} />
                  </div>

                  <div className="mt-4">
                    <BudgetGuard
                      total={effectiveBudget.total}
                      limit={budgetLimit}
                      intercity={intercityCost}
                      days={days}
                      onOptimize={optimizeBudget}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-4 py-2 text-xs font-semibold text-base-content/55 transition hover:border-primary/25 hover:text-primary"
                    >
                      <Pencil size={13} />
                      Edit whole trip
                    </button>
                  </div>

                  {/* Gemini Expense Dashboard — always visible */}
                  <div className="mt-6 print:hidden">
                    <ExpenseDashboard
                      trip={trip}
                      meta={meta}
                      budget={effectiveBudget}
                      intercityCost={intercityCost}
                      onApplyHotel={applyGeminiHotel}
                      onApplyTransportCost={applyGeminiTransportCost}
                      onApplyActivities={applyGeminiActivities}
                      onApplyBudgetAdjustments={applyGeminiBudgetAdjustments}
                      onFinalize={() => setBookingOpen(true)}
                    />
                  </div>
                </motion.section>
              )}

              {/* Recommendations */}
              {recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.44,
                  }}
                >
                  <RecommendationsSection
                    recommendations={recommendations}
                  />
                </motion.div>
              )}

              {/* Optimizer changes */}
              {trip.changes?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.48,
                  }}
                  className="mt-10 print:hidden"
                >
                  <ChangesCard changes={trip.changes} />
                </motion.section>
              )}

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 0.52,
                }}
                className="mt-14 print:hidden"
              >
                <div className="relative overflow-hidden rounded-[2rem] bg-neutral px-7 py-9 text-neutral-content sm:px-10 sm:py-11">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />

                  <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />

                  <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
                    <div>
                      <div className="tp-eyebrow text-accent">
                        {booking
                          ? "Post-booking support"
                          : "Ready when you are"}
                      </div>

                      <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                        {booking
                          ? "Need to change something? We're still here."
                          : "Happy with the plan? Lock it in."}
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-content/55">
                        {booking
                          ? "Update your trip, download the itinerary, or cancel the booking. Changes are reflected instantly."
                          : "Review your flight and stay, then finalize. You can still come back and edit every detail."}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-content/15 px-5 py-3 text-sm font-semibold text-neutral-content/80 transition hover:border-neutral-content/30 hover:text-neutral-content"
                      >
                        <Pencil size={14} />
                        Customize
                      </button>

                      {!booking || booking.status === "Cancelled" ? (
                        <button
                          type="button"
                          onClick={() => setBookingOpen(true)}
                          className="group inline-flex items-center justify-center gap-3 rounded-full bg-neutral-content px-5 py-3 text-sm font-semibold text-neutral transition hover:-translate-y-0.5"
                        >
                          {booking
                            ? "Book this trip again"
                            : "Finalize & book"}
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral/10 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight size={15} />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate("/plan")}
                          className="group inline-flex items-center justify-center gap-3 rounded-full bg-neutral-content px-5 py-3 text-sm font-semibold text-neutral transition hover:-translate-y-0.5"
                        >
                          Plan another trip
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral/10 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight size={15} />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Booking modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        plan={trip}
        meta={meta}
        total={effectiveBudget.total}
        selectedTransport={selectedTransport}
        selectedHotel={selectedHotel}
        onConfirm={confirmBooking}
      />

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral px-5 py-3 text-xs font-semibold text-neutral-content shadow-xl print:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <Check size={13} className="text-success" />
            {toast}
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW CARD
   ========================================================= */

function OverviewCard({
  icon: Icon,
  label,
  value,
  accent = false,
}) {
  return (
    <div className="tp-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            accent
              ? "bg-primary text-primary-content"
              : "bg-base-200 text-base-content/55"
          }`}
        >
          <Icon size={18} />
        </div>

        {accent && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
            <Check size={13} />
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-base-content/40">
          {label}
        </p>

        <p className="mt-1 text-lg font-semibold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
   ========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>
      <div className="tp-eyebrow text-primary">
        {eyebrow}
      </div>

      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/55">
        {description}
      </p>
    </div>
  );
}

export default TripResult;
