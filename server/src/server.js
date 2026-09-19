import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
  path: envPath,
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `TripPilot Backend running on port ${PORT}`
  );
});