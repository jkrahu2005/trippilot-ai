# ✈️ TripPilot AI

> **An AI-powered multi-agent travel planner that turns a simple trip request into a personalized, weather-aware itinerary.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square)](https://client-one-brown-20.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square)](https://trippilot-ai-api.onrender.com/health)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=flat-square&logo=github)](https://github.com/jkrahu2005/trippilot-ai)

TripPilot AI is a full-stack **agentic AI travel planner** built around a supervisor-driven **LangGraph** workflow. Instead of making one large LLM call, the system splits trip planning into specialized agents that incrementally enrich a shared graph state with itinerary, transport, budget, weather, recommendations, and optimized changes.

## 🌐 Live

**Frontend:** https://client-one-brown-20.vercel.app/  
**Backend health:** https://trippilot-ai-api.onrender.com/health  
**Repository:** https://github.com/jkrahu2005/trippilot-ai

## 🧠 Architecture

![TripPilot AI Architecture](docs/trippilot-architecture.svg)

### Core execution flow

```text
User
  ↓
React Trip Form
  ↓
POST /api/trip/plan
  ↓
Express Controller
  ↓
LangGraph StateGraph
  ↓
Supervisor
  ↓
Planner
  ↓
Supervisor
  ↓
Transport
  ↓
Supervisor
  ↓
Budget
  ↓
Supervisor
  ↓
Weather
  ↓
Supervisor
  ↓
Optimizer
  ↓
Supervisor
  ↓
END
  ↓
Final Graph State
  ↓
TripResult Dashboard
```

## ✨ Key Features

- **Multi-agent orchestration:** 5 specialized agents coordinated through LangGraph.
- **Shared state:** Each agent reads the current `TripState`, performs one responsibility, and returns state updates for the next stage.
- **Structured AI outputs:** Gemini responses are validated against Zod schemas for predictable downstream data.
- **Transport intelligence:** Uses geocoding, Haversine distance calculation, and Gemini reasoning to estimate travel mode, duration, and cost.
- **Parallel destination discovery:** The Budget Agent searches hotels, restaurants, and attractions concurrently.
- **Weather-aware planning:** Open-Meteo provides forecast data while Gemini turns it into travel advice.
- **Itinerary optimization:** The Optimizer reviews itinerary, weather, transport, and budget context and returns an optimized plan plus explicit changes.
- **Graceful external API handling:** Independent place searches use parallel execution with timeouts and partial-failure fallbacks.
- **Responsive travel UI:** React, Tailwind CSS, daisyUI, and Framer Motion power the frontend experience.

## 🤖 Agents

| Agent | Responsibility | Main Inputs | Main Output |
|---|---|---|---|
| **Supervisor** | Routes the workflow using `currentStep` | Shared state | Next step |
| **Planner** | Generates the initial day-wise itinerary | Destination, days, interests | `itinerary` |
| **Transport** | Determines travel mode, distance, duration, and estimated cost | Origin, destination context | `transport` |
| **Budget** | Estimates trip expenses and discovers places | Itinerary, transport, destination context | `budget`, `recommendations` |
| **Weather** | Retrieves forecast data and generates advice | Destination coordinates, days | `weather` |
| **Optimizer** | Refines the itinerary using trip context | Itinerary, weather, transport, budget | `optimizedItinerary`, `changes` |

## 🔄 Shared State Model

`TripState` is the backbone of the application. The graph starts with the user's trip request and progressively enriches it.

```text
Initial State
├── origin
├── destination
├── days
├── interests
└── currentStep

        ↓ Planner

+ itinerary

        ↓ Transport

+ transport
+ destinationContext

        ↓ Budget

+ budget
+ recommendations

        ↓ Weather

+ weather

        ↓ Optimizer

+ optimizedItinerary
+ changes

        ↓

currentStep = done
```

The important design principle is:

> **Agents don't pass isolated results directly from one function to another; they incrementally update a shared graph state that the Supervisor uses to coordinate the workflow.**

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- daisyUI
- React Router
- React Hook Form
- Zod
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express.js
- LangChain
- LangGraph
- Google Gemini
- Zod

### External APIs & Tools

- **OpenTripMap** — hotels, restaurants, and interesting places
- **Open-Meteo** — weather forecast and rain probability
- **OpenStreetMap Nominatim** — origin/destination geocoding
- **Haversine distance calculation** — deterministic distance estimation
- **Google Gemini** — itinerary generation, budget reasoning, weather advice, and optimization

### Deployment

- **Vercel** — frontend
- **Render** — backend

## 📁 Project Structure

```text
trippilot-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── budget/
│   │   │   ├── itinerary/
│   │   │   ├── optimizer/
│   │   │   ├── planner/
│   │   │   ├── recommendations/
│   │   │   ├── transport/
│   │   │   └── weather/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── PlanTrip.jsx
│   │   │   └── TripResult.jsx
│   │   │
│   │   ├── services/
│   │   │   └── trip.service.js
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── vercel.json
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── agents/
│   │   ├── controllers/
│   │   ├── graph/
│   │   ├── middleware/
│   │   ├── prompts/
│   │   ├── routes/
│   │   ├── schema/
│   │   ├── services/
│   │   ├── tools/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── trippilot-architecture.svg
│
├── .gitignore
└── README.md
```

## 🔌 API

### Health

```http
GET /health
```

Example:

```json
{
  "success": true,
  "message": "TripPilot backend is healthy"
}
```

### Generate Trip

```http
POST /api/trip/plan
Content-Type: application/json
```

Request body:

```json
{
  "origin": "Delhi",
  "destination": "Goa",
  "days": 3,
  "interests": [
    "beaches",
    "food",
    "nightlife"
  ]
}
```

The final response contains the graph state used by the frontend, including:

```text
itinerary
optimizedItinerary
transport
budget
weather
recommendations
changes
trace
```

## 🧩 Engineering Highlights

### 1. Supervisor-driven orchestration

The graph intentionally routes every specialist through the Supervisor. The Supervisor checks `currentStep` and selects the next node rather than embedding the entire workflow inside a single controller.

### 2. Shared graph state

Every agent receives the current state and returns only the fields it needs to update. LangGraph merges those updates into the shared state before the next routing decision.

### 3. Structured generation

Gemini outputs are generated through LangChain's structured-output flow and validated with dedicated Zod schemas for itinerary, transport, budget, weather, and optimizer results.

### 4. Parallel tool execution

The Budget Agent performs hotel, restaurant, and attraction searches concurrently with `Promise.allSettled()`, reducing the effect of slow or failed individual searches.

### 5. Timeout and graceful fallback

External place searches are wrapped with a timeout utility. A failed individual category falls back to an empty array so the remaining planning pipeline can continue.

### 6. Deterministic data + LLM reasoning

The application uses deterministic tools where appropriate—geocoding, distance calculation, and weather retrieval—while using Gemini for tasks that benefit from language-model reasoning such as itinerary generation and optimization.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Gemini API key
- OpenTripMap API key

### 1. Clone

```bash
git clone https://github.com/jkrahu2005/trippilot-ai.git
cd trippilot-ai
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3000
GOOGLE_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
OPENTRIPMAP_API_KEY=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## ☁️ Deployment

TripPilot is deployed as two services from the same GitHub repository:

```text
GitHub Monorepo
      │
      ├── client/ ──→ Vercel
      │
      └── server/ ──→ Render
```

### Frontend — Vercel

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable:

```env
VITE_API_BASE_URL=https://trippilot-ai-api.onrender.com
```

### Backend — Render

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:

```text
GOOGLE_API_KEY
GEMINI_MODEL
OPENTRIPMAP_API_KEY
CLIENT_URL
NODE_ENV
```

## 🔐 Environment Variables

Never commit real API keys.

Use the example file:

```text
server/.env.example
```

and keep the real values only in your local environment or deployment platform.

## 📌 Future Improvements

- Constraint-aware planning with explicit budget limits and travel pace
- Deterministic itinerary validation and guardrails
- AI evaluation datasets and quality metrics
- Agent latency and token observability
- Streaming agent progress to the frontend
- Conversational trip modification
- Saved trips and trip history
- Interactive maps and richer place details
- PDF itinerary export

## 👨‍💻 Author

**Rahul Kumar**  
NIT Rourkela

- GitHub: https://github.com/jkrahu2005

## ⭐ Project

If you find TripPilot AI useful or interesting, consider starring the repository.
