import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { planTrip } from "../../services/trip.service";

/* =========================================================
   SCHEMA
   ========================================================= */

const tripSchema = z.object({
  origin: z
    .string()
    .trim()
    .min(2, "Please enter your starting location."),

  destination: z
    .string()
    .trim()
    .min(2, "Please enter a destination."),

  days: z
    .coerce
    .number()
    .int("Days must be a whole number.")
    .min(1, "Trip must be at least 1 day.")
    .max(30, "Trips can be up to 30 days."),

  interests: z
    .array(z.string())
    .min(1, "Choose at least one interest."),
});

/* =========================================================
   OPTIONS
   ========================================================= */

const interestOptions = [
  {
    id: "beaches",
    label: "Beaches",
    icon: "◒",
  },
  {
    id: "food",
    label: "Food",
    icon: "◌",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    icon: "✦",
  },
  {
    id: "history",
    label: "History",
    icon: "▱",
  },
  {
    id: "nature",
    label: "Nature",
    icon: "⌁",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "◫",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "↗",
  },
  {
    id: "culture",
    label: "Culture",
    icon: "◎",
  },
];

const suggestedDestinations = [
  "Goa",
  "Jaipur",
  "Delhi",
  "Bangkok",
];

/* =========================================================
   COMPONENT
   ========================================================= */

function TripForm() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: "",
      destination: "",
      days: 3,
      interests: [],
    },
  });

  const selectedInterests = watch("interests") || [];
  const selectedDays = watch("days");

  /* =======================================================
     INTEREST TOGGLE
     ======================================================= */

  function toggleInterest(interest) {
    const current = selectedInterests;

    const next = current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest];

    setValue("interests", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  /* =======================================================
     DAYS
     ======================================================= */

  function decreaseDays() {
    const next = Math.max(1, Number(selectedDays || 1) - 1);

    setValue("days", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function increaseDays() {
    const next = Math.min(30, Number(selectedDays || 1) + 1);

    setValue("days", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  /* =======================================================
     DESTINATION SUGGESTION
     ======================================================= */

  function chooseDestination(destination) {
    setValue("destination", destination, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setFocus("destination");
  }

  /* =======================================================
     SUBMIT
     ======================================================= */

  async function onSubmit(formData) {
    try {
      setSubmitError("");
      setIsSubmitting(true);

      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        days: formData.days,
        interests: formData.interests,
      };

      const result = await planTrip(payload);

      navigate("/trip", {
        state: {
          result,
          request: payload,
        },
      });
    } catch (error) {
      console.error("Trip generation failed:", error);

      setSubmitError(
        error?.message ||
          "Something went wrong while generating your trip."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="tp-card overflow-hidden rounded-[2rem]">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        {/* =================================================
            LEFT INFORMATION PANEL
            ================================================= */}

        <aside className="relative overflow-hidden border-b border-base-content/8 bg-neutral p-7 text-neutral-content sm:p-9 lg:border-b-0 lg:border-r">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-content/10 bg-neutral-content/5">
                <Sparkles size={19} />
              </div>

              <p className="tp-eyebrow text-secondary">
                TripPilot intelligence
              </p>

              <h2 className="mt-4 max-w-sm text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                A trip built around the way you travel.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-content/65">
                Your preferences become the starting point for a
                multi-agent planning workflow that connects
                itinerary, transport, weather and budget.
              </p>
            </div>

            <div className="mt-auto pt-12">
              <div className="space-y-4">
                <WorkflowStep
                  number="01"
                  title="Understand"
                  description="Reads your destination and interests."
                  active
                />

                <WorkflowStep
                  number="02"
                  title="Coordinate"
                  description="Plans transport, places and costs."
                />

                <WorkflowStep
                  number="03"
                  title="Refine"
                  description="Adjusts the itinerary around conditions."
                />
              </div>
            </div>
          </div>
        </aside>

        {/* =================================================
            FORM PANEL
            ================================================= */}

        <div className="p-6 sm:p-9 lg:p-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary">
              <Compass size={17} />
              <span className="text-sm font-semibold">
                Your journey
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Where are you heading?
            </h2>

            <p className="mt-2 text-sm text-base-content/55">
              Start with the basics. TripPilot handles the rest.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* =============================================
                ORIGIN + DESTINATION
                ============================================= */}

            <div className="grid gap-5 md:grid-cols-2">
              {/* Origin */}
              <div>
                <label className="tp-eyebrow mb-2 block text-base-content/50">
                  From
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    {...register("origin")}
                    type="text"
                    placeholder="Delhi"
                    autoComplete="off"
                    className={`tp-input h-14 pl-11 pr-4 text-sm ${
                      errors.origin ? "border-error" : ""
                    }`}
                  />
                </div>

                {errors.origin && (
                  <p className="mt-2 text-xs text-error">
                    {errors.origin.message}
                  </p>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="tp-eyebrow mb-2 block text-base-content/50">
                  To
                </label>

                <div className="relative">
                  <Compass
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    {...register("destination")}
                    type="text"
                    placeholder="Goa"
                    autoComplete="off"
                    className={`tp-input h-14 pl-11 pr-4 text-sm ${
                      errors.destination ? "border-error" : ""
                    }`}
                  />
                </div>

                {errors.destination && (
                  <p className="mt-2 text-xs text-error">
                    {errors.destination.message}
                  </p>
                )}
              </div>
            </div>

            {/* Suggested destinations */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-base-content/40">
                Try
              </span>

              {suggestedDestinations.map((destination) => (
                <button
                  key={destination}
                  type="button"
                  onClick={() => chooseDestination(destination)}
                  className="rounded-full border border-base-content/8 bg-base-200/60 px-3 py-1.5 text-xs font-medium text-base-content/60 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {destination}
                </button>
              ))}
            </div>

            {/* =============================================
                DAYS
                ============================================= */}

            <div className="mt-8">
              <label className="tp-eyebrow mb-2 block text-base-content/50">
                Duration
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-base-content/10 bg-base-200/45 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">
                    Length of trip
                  </div>

                  <div className="mt-0.5 text-xs text-base-content/45">
                    Choose between 1 and 30 days
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decreaseDays}
                    disabled={Number(selectedDays) <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-base-content/10 bg-base-100 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Decrease trip duration"
                  >
                    <Minus size={16} />
                  </button>

                  <div className="w-12 text-center">
                    <div className="text-xl font-semibold leading-none">
                      {selectedDays}
                    </div>

                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-base-content/40">
                      days
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={increaseDays}
                    disabled={Number(selectedDays) >= 30}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-base-content/10 bg-base-100 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Increase trip duration"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <input
                {...register("days")}
                type="hidden"
              />

              {errors.days && (
                <p className="mt-2 text-xs text-error">
                  {errors.days.message}
                </p>
              )}
            </div>

            {/* =============================================
                INTERESTS
                ============================================= */}

            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <label className="tp-eyebrow block text-base-content/50">
                    Interests
                  </label>

                  <p className="mt-2 text-sm text-base-content/55">
                    What should shape the experience?
                  </p>
                </div>

                <div className="hidden text-xs text-base-content/40 sm:block">
                  {selectedInterests.length} selected
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {interestOptions.map((interest) => {
                  const selected = selectedInterests.includes(
                    interest.id
                  );

                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`tp-chip relative rounded-2xl border p-4 text-left ${
                        selected
                          ? "border-primary/30 bg-primary/8 text-primary shadow-sm"
                          : "border-base-content/8 bg-base-200/35 text-base-content/65 hover:border-base-content/15 hover:bg-base-200/70"
                      }`}
                    >
                      <div
                        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                          selected
                            ? "bg-primary text-primary-content"
                            : "bg-base-100 text-base-content/45"
                        }`}
                      >
                        {interest.icon}
                      </div>

                      <div className="text-sm font-semibold">
                        {interest.label}
                      </div>

                      {selected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-content">
                          <Check size={12} strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {errors.interests && (
                <p className="mt-3 text-xs text-error">
                  {errors.interests.message}
                </p>
              )}
            </div>

            {/* =============================================
                ERROR
                ============================================= */}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-7 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
              >
                <div className="flex items-start gap-3">
                  <RotateCcw size={17} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      We couldn't generate the trip.
                    </p>

                    <p className="mt-1 opacity-80">
                      {submitError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* =============================================
                SUBMIT
                ============================================= */}

            <div className="mt-9 flex flex-col gap-4 border-t border-base-content/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs leading-5 text-base-content/45">
                <span className="font-medium text-base-content/65">
                  {selectedInterests.length || 0}
                </span>{" "}
                interests ·{" "}
                <span className="font-medium text-base-content/65">
                  {selectedDays}
                </span>{" "}
                day journey
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content shadow-lg shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Building your trip
                  </>
                ) : (
                  <>
                    Generate my trip

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-content/10 transition-transform duration-200 group-hover:translate-x-0.5">
                      <ArrowRight size={15} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WORKFLOW STEP
   ========================================================= */

function WorkflowStep({
  number,
  title,
  description,
  active = false,
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tracking-wider ${
          active
            ? "border-secondary/40 bg-secondary/15 text-secondary"
            : "border-neutral-content/10 bg-neutral-content/5 text-neutral-content/45"
        }`}
      >
        {number}
      </div>

      <div>
        <div className="text-sm font-semibold">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-neutral-content/50">
          {description}
        </div>
      </div>
    </div>
  );
}

export default TripForm;