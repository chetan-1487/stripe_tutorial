import { prisma } from "../../config/prisma.js";
import {stripe} from "../../config/stripe.js";
import { AppError } from "../../utils/errorHandler.js";
import { ENV } from "../../config/env.js";

export const createCheckoutSession = async (userId: string, planId: string, currency: string) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
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
  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription) throw new AppError("Subscription not found", 404);

  await stripe.subscriptions.update(subscription.stripeId, { cancel_at_period_end: true });

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "canceled" },
  });
};

export const changeSubscriptionPlan = async (subscriptionId: string, newPlanId: string) => {
  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription) throw new AppError("Subscription not found", 404);

  const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } });
  if (!newPlan) throw new AppError("New plan not found", 404);

  await stripe.subscriptions.update(subscription.stripeId, {
    items: [{ price: newPlan.stripePriceId }],
  });

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { planId: newPlanId, status: "active" },
    include: { plan: true },
  });
};
