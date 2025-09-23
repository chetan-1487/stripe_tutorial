import type { Request, Response } from "express";
import {
  createOneTimeCheckout,
  createSubscriptionCheckout,
} from "./checkout.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import type { AuthRequest } from "../../middlewares/auth.js";
import { AppError } from "../../utils/errorHandler.js";

export async function checkoutOneTime(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) throw new AppError("missing userId field", 400);

    const { planName } = req.body;

    if (!planName) throw new AppError("Missing planName field", 400);

    const url = await createOneTimeCheckout(userId, planName);
    return sendSuccess(res, "", { url });
  } catch (err: any) {
    return sendError(res, err.message);
  }
}

export async function checkoutSubscription(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Missing userId detail", 400);

    const { planName } = req.body;
    if (!planName) throw new AppError("Missing planName field", 400);

    const url = await createSubscriptionCheckout(userId, planName);
    return sendSuccess(res, "", { url });
  } catch (err: any) {
    return sendError(res, err.message);
  }
}
