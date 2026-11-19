import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import ChatPlanner from "../components/chat/ChatPlanner";

function PlanTrip() {
  return (
    <div data-theme="trippilot-coast" className="tp-shell bg-base-100">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="tp-orb bg-secondary/20"
          style={{
            top: "-10rem",
            left: "-8rem",
          }}
        />

        <div
          className="tp-orb bg-primary/15"
          style={{
            top: "30%",
            right: "-12rem",
          }}
        />

        <div
          className="tp-orb bg-accent/15"
          style={{
            bottom: "-14rem",
            left: "35%",
          }}
        />

        <div className="tp-grid absolute inset-0 opacity-[0.22]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral text-neutral-content shadow-sm transition-transform duration-200 group-hover:-rotate-6">
              <Compass size={20} strokeWidth={2.1} />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-tight">
                TripPilot
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-base-content/45">
                AI Travel Planner
              </div>
            </div>
          </Link>

          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 text-sm font-medium text-base-content/70 backdrop-blur-md transition-all hover:border-base-content/20 hover:bg-base-100 hover:text-base-content"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 px-4 pb-8 pt-4 lg:px-8 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-9 max-w-3xl text-center"
          >
            <div className="tp-eyebrow mb-4 text-primary">
              Your travel copilot
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-base-content sm:text-4xl lg:text-5xl">
              Tell us the trip.
              <span className="block text-primary">
                We'll shape the rest.
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-base-content/60 sm:text-base">
              Talk to TripPilot the way you'd talk to a travel
              agent. It asks the right questions, coordinates the
              agents, then hands you an editable itinerary you can
              finalize.
            </p>
          </motion.div>

          {/* Conversational planner */}
          <div>
            <ChatPlanner />
          </div>

          {/* Small footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4 text-center text-xs text-base-content/45"
          >
            No account required · Natural-language planning ·
            Edit every detail before you finalize
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default PlanTrip;