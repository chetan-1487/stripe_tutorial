import { prisma } from "../../config/prisma.js";
import { stripe } from "../../config/stripe.js";

export async function createOneTimeCheckout(userId: string, planId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!user || !plan) throw new Error("Invalid user or plan");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: { userId: user.id, planId: plan.id, type: "ONE_TIME" },
  });

  return session.url;
}

export async function createSubscriptionCheckout(userId: string, planId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!user || !plan) throw new Error("Invalid user or plan");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: { userId: user.id, planId: plan.id, type: "SUBSCRIPTION" },
  });

  return session.url;
}
