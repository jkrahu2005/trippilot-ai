import express from "express";
import cors from "cors";
import morgan from "morgan";

import healthRoutes from "./routes/health.routes.js";
import tripRoutes from "./routes/trip.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/trip", tripRoutes);

app.use(errorHandler);

export default app;