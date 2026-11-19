import { Router } from "express";
import { planTrip } from "../controllers/trip.controller.js";
import { chatIntake } from "../controllers/chat.controller.js";
import { customizeExpenses } from "../controllers/customize.controller.js";

const router = Router();

router.post("/plan", planTrip);
router.post("/chat", chatIntake);
router.post("/customize", customizeExpenses);

export default router;