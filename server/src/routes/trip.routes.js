import { Router } from "express";
import { planTrip } from "../controllers/trip.controller.js";

const router = Router();

router.post("/plan", planTrip);

export default router;