import type { Request, Response, NextFunction } from "express";
import * as subscriptionService from "./subscription.service.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";
import type { AuthRequest } from "../../middlewares/auth.js";
import { prisma } from "../../config/prisma.js";
import { createCustomerPortalSession } from "./subscription.service.js";

export const createSubscriptionCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new AppError("userId not found", 401);

    const { planName, currency } = req.body;
    if (!planName) throw new AppError("Missing planName fields", 400);

    const userSubscriptionName = await prisma.subscription.findFirst({where: { userId},include: { plan: true }});
    
    if(userSubscriptionName) throw new AppError(`you have already ${userSubscriptionName.plan.name} plan. you can upgrade into pro or business plan.`);

    const session = await subscriptionService.createCheckoutSession(
      userId,
      planName,
      currency,
    );
    return sendSuccess(res, "Subscription checkout session created", {
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("UserId required", 400);

    const subscriptions =
      await subscriptionService.getSubscriptionsByUser(userId);
    return sendSuccess(
      res,
      "user subscriptions details",
      subscriptions,
    );
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError("Subscription ID required", 400);

    await subscriptionService.cancelSubscription(id);
    return sendSuccess(res, "Subscription cancelled successfully");
  } catch (err) {
    next(err);
  }
};

export const upgradeSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { planName, currency } = req.body;

    if (!userId || !planName)
      throw new AppError("User ID and planName required", 400);

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
      include: { plan: true },
    });

    if (!subscription)
      throw new AppError("You do not have an active subscription", 400);

    // Check if user is trying to upgrade to the same plan
    if (subscription.plan.name === planName) {
      throw new AppError(`You already have the ${planName} plan.`, 400);
    }

    // Call service to change subscription by plan name
    const updatedSub = await subscriptionService.changeSubscriptionPlan(
      subscription.id,
      planName,
      currency
    );

    return sendSuccess(res, "Subscription upgraded successfully", updatedSub);
  } catch (err) {
    next(err);
  }
};


export const downgradeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { newPlanName, currency } = req.body;
    if (!id || !newPlanName)
      throw new AppError("Subscription ID and newPlanName required", 400);

    const updatedSub = await subscriptionService.changeSubscriptionPlan(
      id,
      newPlanName,
      currency,
    );
    return sendSuccess(res, "Subscription downgraded successfully", updatedSub);
  } catch (err) {
    next(err);
  }
};

export const openStripePortal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not found");

    // Get the user's Stripe customer ID
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) throw new Error("Stripe customer ID not found");

    // Create portal session
    const portalUrl = await createCustomerPortalSession(
      user.stripeCustomerId,
      "https://yourapp.com/account" // Redirect after leaving Stripe
    );

    res.json({ url: portalUrl });
  } catch (err) {
    next(err);
  }
};
