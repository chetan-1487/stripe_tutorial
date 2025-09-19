import type { Request, Response, NextFunction } from "express";
import * as subscriptionService from "./subscription.service.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";
import type { AuthRequest } from "../../middlewares/auth.js";

export const createSubscriptionCheckout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // ✅ get userId from token
    console.log("----------------------------userId-------------------------",userId);
    if (!userId) throw new AppError("Unauthorized", 401);

    const { planId, currency } = req.body;
    if (!planId) throw new AppError("Missing required fields", 400);

    const session = await subscriptionService.createCheckoutSession(userId, planId, currency);
    return sendSuccess(res, "Subscription checkout session created", { url: session.url });
  } catch (err) {
    next(err);
  }
};

export const getUserSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError("UserId required", 400);

    const subscriptions = await subscriptionService.getSubscriptionsByUser(userId);
    return sendSuccess(res, "Fetched subscriptions successfully", subscriptions);
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError("Subscription ID required", 400);

    await subscriptionService.cancelSubscription(id);
    return sendSuccess(res, "Subscription cancelled successfully");
  } catch (err) {
    next(err);
  }
};

export const upgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPlanId } = req.body;
    if (!id || !newPlanId) throw new AppError("Subscription ID and newPlanId required", 400);

    const updatedSub = await subscriptionService.changeSubscriptionPlan(id, newPlanId);
    return sendSuccess(res, "Subscription upgraded successfully", updatedSub);
  } catch (err) {
    next(err);
  }
};

export const downgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPlanId } = req.body;
    if (!id || !newPlanId) throw new AppError("Subscription ID and newPlanId required", 400);

    const updatedSub = await subscriptionService.changeSubscriptionPlan(id, newPlanId);
    return sendSuccess(res, "Subscription downgraded successfully", updatedSub);
  } catch (err) {
    next(err);
  }
};
