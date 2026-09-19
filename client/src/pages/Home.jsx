import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  CloudSun,
  WalletCards,
  Route,
} from "lucide-react";

function Home() {
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

export default Home;