import { prisma } from "../../config/prisma.js";
import { stripe } from "../../config/stripe.js";
import { AppError } from "../../utils/errorHandler.js";
import { ENV } from "../../config/env.js";

export const createCheckoutSession = async (
  userId: string,
  planName: string,
  currency: string,
) => {
  const plan = await prisma.plan.findFirst({ where: { name: planName } });
  if (!plan) throw new AppError("Plan not found", 404);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const successUrl = ENV.CHECKOUT_SUCCESS_URL;
  const cancelUrl = ENV.CHECKOUT_CANCEL_URL;

  if (!successUrl || !cancelUrl) {
    throw new AppError("Checkout URLs are not configured properly", 500);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    customer_email: user.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
};

export const getSubscriptionsByUser = async (userId: string) => {
  return prisma.subscription.findMany({
    where: { userId },
    include: { plan: true },
  });
};

export const cancelSubscription = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) throw new AppError("Subscription not found", 404);

  await stripe.subscriptions.update(subscription.stripeId, {
    cancel_at_period_end: true,
  });

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "canceled" },
  });
};

export const changeSubscriptionPlan = async (
  subscriptionId: string,
  newPlanName: string,
  currency: string,
) => {
  // Fetch current subscription and plan
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!subscription) throw new AppError("Subscription not found", 404);

  // Find new plan by name
  const newPlan = await prisma.plan.findFirst({ where: { name: newPlanName } });
  if (!newPlan) throw new AppError("Plan not found", 404);

  // Check if user already has this plan
  if (subscription.planId === newPlan.id) {
    throw new AppError(`You already have the ${newPlan.name} plan`, 400);
  }

  // Retrieve Stripe subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeId);

  if (!stripeSubscription.items.data[0]) {
    throw new AppError("Subscription item not found on Stripe", 500);
  }

  const subscriptionItemId = stripeSubscription.items.data[0].id;

  // Update subscription item in Stripe
  await stripe.subscriptions.update(subscription.stripeId, {
    items: [
      {
        id: subscriptionItemId,
        price: newPlan.stripePriceId,
      },
    ],
    proration_behavior: "create_prorations", // adjust billing for partial periods
  });

  // Update subscription in DB
  const updatedSub = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId: newPlan.id,
      status: "active",
    },
    include: { plan: true },
  });

  // Adjust user credits if plan credits changed
  const creditDiff = newPlan.credits - subscription.plan.credits;
  if (creditDiff !== 0) {
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { credits: { increment: creditDiff } },
    });
  }

  return updatedSub;
};


export const createCustomerPortalSession = async (customerId: string, returnUrl: string) => {
  // Create a session for the Stripe Customer Portal
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl, // Redirect after leaving portal
  });

  return session.url;
};