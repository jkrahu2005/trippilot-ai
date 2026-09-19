import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  IndianRupee,
  Plane,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import TripHeader from "../components/itinerary/TripHeader";
import AgentTrace from "../components/itinerary/AgentTrace";
import ItineraryTimeline from "../components/itinerary/ItineraryTimeline";

import TransportCard from "../components/transport/TransportCard";
import WeatherCard from "../components/weather/WeatherCard";
import BudgetCard from "../components/budget/BudgetCard";

import ChangesCard from "../components/optimizer/ChangesCard";
import RecommendationsSection from "../components/recommendations/RecommendationsSection";

function TripResult() {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================================
     GET RESULT FROM NAVIGATION STATE
     ========================================================= */

  const result = location.state?.result;
  const request = location.state?.request;

  const trip = result?.data;

  /* =========================================================
     NO RESULT STATE
     ========================================================= */

  if (!trip) {
    return (
      <div
        data-theme="trippilot-journey"
        className="tp-shell bg-base-100"
      >
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="tp-orb bg-primary/10"
            style={{
              top: "-8rem",
              right: "-5rem",
            }}
          />

          <div
            className="tp-orb bg-secondary/10"
            style={{
              bottom: "-10rem",
              left: "-5rem",
            }}
          />

          <div className="tp-grid absolute inset-0 opacity-[0.2]" />
        </div>

        {/* Empty state */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="tp-card w-full max-w-lg rounded-[2rem] p-8 text-center sm:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass size={25} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Your journey isn't here yet.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-base-content/55">
              This result page needs a generated trip. Start a new
              journey and TripPilot will build one for you.
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

  /* =========================================================
     NORMALIZE DATA
     ========================================================= */

  const itinerary =
    trip.optimizedItinerary || trip.itinerary;

  const destination =
    request?.destination ||
    trip.destination ||
    "Your destination";

  const origin =
    request?.origin ||
    trip.origin ||
    "Your origin";

  const days =
    request?.days ||
    trip.days ||
    itinerary?.days?.length ||
    0;

  const interests =
    request?.interests ||
    trip.interests ||
    [];

  const recommendations =
    trip.recommendations || null;

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div
      data-theme="trippilot-journey"
      className="tp-shell bg-base-100"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="tp-orb bg-primary/10"
          style={{
            top: "-12rem",
            right: "-8rem",
          }}
        />

        <div
          className="tp-orb bg-secondary/10"
          style={{
            top: "45%",
            left: "-12rem",
          }}
        />

        <div
          className="tp-orb bg-accent/10"
          style={{
            bottom: "-12rem",
            right: "25%",
          }}
        />

        <div className="tp-grid absolute inset-0 opacity-[0.18]" />
      </div>

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
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

          {/* Plan another */}
          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="group flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 text-sm font-medium text-base-content/65 backdrop-blur-md transition hover:border-base-content/20 hover:bg-base-100 hover:text-base-content"
          >
            <RefreshCw
              size={15}
              className="transition-transform duration-300 group-hover:rotate-180"
            />

            Plan another
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="relative z-10 px-6 pb-20 pt-6 lg:px-8 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              TRIP HEADER
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
            }}
          >
            <TripHeader
              origin={origin}
              destination={destination}
              days={days}
              interests={interests}
            />
          </motion.div>

          {/* =================================================
              AGENT TRACE
              ================================================= */}

          {trip.trace?.length > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.08,
              }}
              className="mt-6"
            >
              <AgentTrace trace={trip.trace} />
            </motion.div>
          )}

          {/* =================================================
              OVERVIEW CARDS
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.14,
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Duration */}
            <OverviewCard
              icon={CalendarDays}
              label="Duration"
              value={`${days} days`}
            />

            {/* Distance */}
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

            {/* Budget */}
            <OverviewCard
              icon={IndianRupee}
              label="Estimated trip"
              value={
                trip.budget?.total
                  ? `₹${trip.budget.total.toLocaleString(
                      "en-IN"
                    )}`
                  : "Calculating"
              }
            />

            {/* Status */}
            <OverviewCard
              icon={Sparkles}
              label="Planning status"
              value="Optimized"
              accent
            />
          </motion.div>

          {/* =================================================
              ITINERARY
              ================================================= */}

          {itinerary?.days?.length > 0 && (
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.2,
              }}
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
            </motion.section>
          )}

          {/* =================================================
              TRANSPORT + WEATHER
              ================================================= */}

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Transport */}
            {trip.transport && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
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

            {/* Weather */}
            {trip.weather?.days?.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.55,
                  delay: 0.29,
                }}
              >
                <WeatherCard
                  weather={trip.weather}
                />
              </motion.div>
            )}
          </div>

          {/* =================================================
              BUDGET
              ================================================= */}

          {trip.budget && (
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.34,
              }}
              className="mt-10"
            >
              <SectionHeading
                eyebrow="Trip economics"
                title="Know where the money goes."
                description="An estimated breakdown across accommodation, food, local transport, activities and inter-city travel."
              />

              <div className="mt-5">
                <BudgetCard
                  budget={trip.budget}
                />
              </div>
            </motion.section>
          )}

          {/* =================================================
              RECOMMENDATIONS
              ================================================= */}

          {recommendations && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.39,
              }}
            >
              <RecommendationsSection
                recommendations={recommendations}
              />
            </motion.div>
          )}

          {/* =================================================
              OPTIMIZER CHANGES
              ================================================= */}

          {trip.changes?.length > 0 && (
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.44,
              }}
              className="mt-10"
            >
              <ChangesCard
                changes={trip.changes}
              />
            </motion.section>
          )}

          {/* =================================================
              BOTTOM CTA
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.5,
            }}
            className="mt-14"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-neutral px-7 py-9 text-neutral-content sm:px-10 sm:py-11">
              {/* Ambient decoration */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />

              {/* Content */}
              <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
                <div>
                  <div className="tp-eyebrow text-accent">
                    Ready when you are
                  </div>

                  <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                    Your itinerary is the starting
                    point, not the finish line.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-content/55">
                    Change your destination, duration
                    or interests and let TripPilot build
                    another journey.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/plan")}
                  className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-neutral-content px-5 py-3 text-sm font-semibold text-neutral transition hover:-translate-y-0.5"
                >
                  Start again

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral/10 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight
                      size={15}
                    />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
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
        {/* Icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            accent
              ? "bg-primary text-primary-content"
              : "bg-base-200 text-base-content/55"
          }`}
        >
          <Icon size={18} />
        </div>

        {/* Success indicator */}
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