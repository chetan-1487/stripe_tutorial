import { Router } from "express";
import {
  createSubscriptionCheckout,
  getUserSubscriptions,
  cancelSubscription,
  upgradeSubscription,
  downgradeSubscription,
} from "./subscription.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

// POST /subscriptions/checkout → create a new subscription session
router.post("/checkout",authMiddleware, createSubscriptionCheckout);

// GET /subscriptions/:userId → fetch all subscriptions for a user
router.get("/:userId", getUserSubscriptions);

// POST /subscriptions/:id/cancel → cancel subscription
router.post("/:id/cancel", cancelSubscription);

// POST /subscriptions/:id/upgrade → upgrade subscription
router.post("/:id/upgrade", upgradeSubscription);

// POST /subscriptions/:id/downgrade → downgrade subscription
router.post("/:id/downgrade", downgradeSubscription);

export const subscriptionRoute = router;
