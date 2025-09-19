import type { Request, Response, NextFunction } from "express";
import * as webhookService from "./webhook.service.js";
import { sendSuccess } from "../../utils/response.js";

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = req.body; // middleware needed for raw body
    await webhookService.processWebhookEvent(rawBody, sig);
    return sendSuccess(res, "Webhook received", null, 200);
  } catch (err) {
    next(err);
  }
};
