import { Router } from "express";
import { handleStripeWebhook } from "./webhook.controller.js";
import bodyparser from "body-parser";

const router = Router();

router.post(
  "/webhook",
  bodyparser.raw({ type: "application/json" }),
  handleStripeWebhook,
);

export const webhookRoute = router;
