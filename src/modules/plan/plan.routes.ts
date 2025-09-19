import { Router } from "express";
import { getPlans, createPlan } from "./plan.controller.js";

const router = Router();

router.get("/", getPlans);
router.post("/", createPlan);

export const planRoute = router;
