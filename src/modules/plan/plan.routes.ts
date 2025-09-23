import { Router } from "express";
import { getPlans, createPlan } from "./plan.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.get("/", authMiddleware, getPlans);
router.post("/", authMiddleware, createPlan);

export const planRoute = router;
