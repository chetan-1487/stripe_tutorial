// services/webhookService.ts
import { stripe } from "../../config/stripe.js";
import { prisma } from "../../config/prisma.js";

export const processWebhookEvent = async (rawBody: Buffer, sig: string) => {
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  console.log("✅ Webhook event type:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const { mode, id, amount_total, currency, customer_email } = session;

      if (!customer_email) {
        console.warn("No customer email in session, skipping...");
        break;
      }

      // ✅ Upsert user: create if doesn't exist
      const user = await prisma.user.upsert({
        where: { email: customer_email },
        update: {},
        create: { email: customer_email, password: "test123" },
      });
      console.log("User found or created:", user.id);

      if (mode === "payment") {
        // One-time purchase
        try {
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: amount_total,
              currency,
              stripeId: id,
              status: "succeeded",
              type: "ONE_TIME",
            },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: 10 } },
          });
          console.log("One-time payment saved for user:", user.id);
        } catch (err) {
          console.error("Error saving one-time payment:", err);
        }
      } else if (mode === "subscription") {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;

        if (!priceId) {
          console.warn("No priceId found in subscription, skipping...");
          break;
        }

        // ✅ Get plan by Stripe priceId
        const plan = await prisma.plan.findUnique({ where: { stripePriceId: priceId } });
        if (!plan) {
          console.warn("Plan not found in DB for priceId:", priceId);
          break;
        }

        // ✅ Upsert subscription
        const existing = await prisma.subscription.findFirst({
          where: { userId: user.id },
        });

        try {
          if (existing) {
            await prisma.subscription.update({
              where: { id: existing.id },
              data: {
                planId: plan.id,
                stripeId: subscription.id,
                status: subscription.status,
                startDate: subscription.start_date ? new Date(subscription.start_date * 1000) : new Date(),
                endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
              },
            });
            console.log("Subscription updated for user:", user.id);
          } else {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: plan.id,
                stripeId: subscription.id,
                status: subscription.status,
                startDate: subscription.start_date ? new Date(subscription.start_date * 1000) : new Date(),
                endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
              },
            });
            console.log("Subscription created for user:", user.id);
          }
        } catch (err) {
          console.error("Error saving subscription:", err);
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;

      if (!subscriptionId) break;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: subscriptionId },
      });

      if (subscription) {
        try {
          await prisma.payment.create({
            data: {
              userId: subscription.userId,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              stripeId: invoice.id,
              status: "succeeded",
              type: "SUBSCRIPTION",
            },
          });
          console.log("Subscription payment saved for user:", subscription.userId);
        } catch (err) {
          console.error("Error saving subscription payment:", err);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      try {
        await prisma.subscription.updateMany({
          where: { stripeId: sub.id },
          data: { status: "canceled", endDate: new Date() },
        });
        console.log("Subscription canceled:", sub.id);
      } catch (err) {
        console.error("Error updating canceled subscription:", err);
      }
      break;
    }

    default:
      console.log("Unhandled event type:", event.type);
  }
};
