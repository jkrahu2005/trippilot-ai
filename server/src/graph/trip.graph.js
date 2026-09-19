import { StateGraph, START, END } from "@langchain/langgraph";

import { TripState } from "./state.js";
import { routeFromSupervisor } from "./router.js";

import { supervisorAgent } from "../agents/supervisor.agent.js";
import { plannerAgent } from "../agents/planner.agent.js";
import { transportAgent } from "../agents/transport.agent.js";
import { budgetAgent } from "../agents/budget.agent.js";
import { weatherAgent } from "../agents/weather.agent.js";
import { optimizerAgent } from "../agents/optimizer.agent.js";

const builder = new StateGraph(TripState);

// Register all nodes
builder.addNode("supervisor", supervisorAgent);
builder.addNode("planner", plannerAgent);
builder.addNode("transportAgent", transportAgent);
builder.addNode("budgetAgent", budgetAgent);
builder.addNode("weatherAgent", weatherAgent);
builder.addNode("optimizerAgent", optimizerAgent);

// Start the workflow
builder.addEdge(START, "supervisor");

// Supervisor decides which agent runs next
builder.addConditionalEdges("supervisor", routeFromSupervisor, {
  planner: "planner",
  transport: "transportAgent",
  budget: "budgetAgent",
  weather: "weatherAgent",
  optimizer: "optimizerAgent",
  end: END,
});

// Every agent returns control to the Supervisor
builder.addEdge("planner", "supervisor");
builder.addEdge("transportAgent", "supervisor");
builder.addEdge("budgetAgent", "supervisor");
builder.addEdge("weatherAgent", "supervisor");
builder.addEdge("optimizerAgent", "supervisor");

export const tripGraph = builder.compile();