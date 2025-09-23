// services/webhookService.ts
import Stripe from "stripe";
import { stripe } from "../../config/stripe.js";
import { prisma } from "../../config/prisma.js";

export const processWebhookEvent = async (rawBody: Buffer, sig: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  console.log("✅ Webhook event type:", event.type);

  switch (event.type) {
    /**
     * Fired after a checkout session is completed
     */
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const {
        mode,
        id,
        amount_total,
        currency,
        customer_email,
        subscription: subscriptionId,
      } = session;

      if (!customer_email) break;

      // Upsert user
      const user = await prisma.user.upsert({
        where: { email: customer_email },
        update: {},
        create: { email: customer_email, password: "test123" },
      });

      if (mode === "payment") {
        // Save one-time payment (idempotent check)
        const exists = await prisma.payment.findUnique({
          where: { stripeId: id },
        });
        if (!exists) {
          await prisma.payment.create({
            data: {
              userId: user.id,
              amount: amount_total || 0,
              currency: currency || "usd",
              stripeId: id,
              status: "succeeded",
              type: "ONE_TIME",
            },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: 10 } }, // example credits
          });
        }
        console.log("✅ One-time payment recorded for user:", user.email);
      }

      if (mode === "subscription" && subscriptionId) {
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId as string,
        )) as Stripe.Subscription;

        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) break;

        const plan = await prisma.plan.findUnique({
          where: { stripePriceId: priceId },
        });
        if (!plan) break;

        // Check existing active subscription
        const existingSub = await prisma.subscription.findFirst({
          where: { userId: user.id, status: "active" },
          include: { plan: true },
        });

        if (existingSub) {
          // User already has a subscription
          if (existingSub.planId !== plan.id) {
            // User upgraded/downgraded
            await prisma.subscription.update({
              where: { id: existingSub.id },
              data: {
                planId: plan.id,
                stripeId: subscription.id,
                status: subscription.status,
                startDate: new Date(subscription.start_date * 1000),
                endDate: new Date(
                  (subscription as any).current_period_end * 1000,
                ),
              },
            });

            // Add credits difference
            const creditDiff = plan.credits - existingSub.plan.credits;
            if (creditDiff > 0) {
              await prisma.user.update({
                where: { id: user.id },
                data: { credits: { increment: creditDiff } },
              });
            }

            console.log(
              `🔄 User ${user.email} upgraded/downgraded to plan ${plan.name}`,
            );
          } else {
            console.warn(
              `⚠️ User ${user.email} already has this subscription plan.`,
            );
          }
        } else {
          // Create new subscription
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.id,
              stripeId: subscription.id,
              status: subscription.status,
              startDate: new Date(subscription.start_date * 1000),
              endDate: new Date(
                (subscription as any).current_period_end * 1000,
              ),
            },
          });

          // Give credits for new subscription
          if (plan.credits && subscription.status === "active") {
            await prisma.user.update({
              where: { id: user.id },
              data: { credits: { increment: plan.credits } },
            });
          }

          console.log("✅ Subscription created for user:", user.email);
        }

        // Save initial subscription payment (if not already saved)
        const invoiceId = session.invoice as string | undefined;
        if (invoiceId) {
          const invoice = await stripe.invoices.retrieve(invoiceId);
          if (invoice.id) {
            const exists = await prisma.payment.findUnique({
              where: { stripeId: invoice.id },
            });
            if (!exists) {
              await prisma.payment.create({
                data: {
                  userId: user.id,
                  amount: invoice.amount_paid,
                  currency: invoice.currency,
                  stripeId: invoice.id,
                  status: "succeeded",
                  type: "SUBSCRIPTION",
                },
              });
            }
          }
        }
      }
      break;
    }

    /**
     * Fired on recurring subscription payment success
     */
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;
      if (!subscriptionId) break;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: subscriptionId },
      });
      if (!subscription) break;

      const plan = await prisma.plan.findUnique({
        where: { id: subscription.planId },
      });

      // Save payment (idempotent check)
      if (!invoice.id) break;
      const exists = await prisma.payment.findUnique({
        where: { stripeId: invoice.id },
      });
      if (!exists) {
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
      }

      // Update subscription validity
      const periodEnd = invoice.lines.data[0]?.period?.end
        ? new Date(invoice.lines.data[0].period.end * 1000)
        : subscription.endDate;

      const now = new Date();
      const status = periodEnd && periodEnd > now ? "active" : "expired";

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { endDate: periodEnd, status },
      });

      // Add credits for recurring payment
      if (status === "active" && plan?.credits) {
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { credits: { increment: plan.credits } },
        });
      }

      console.log(
        "✅ Subscription payment recorded for user:",
        subscription.userId,
      );
      break;
    }

    /**
     * Fired when subscription is canceled
     */
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeId: sub.id },
        data: { status: "canceled", endDate: new Date() },
      });
      console.log("❌ Subscription canceled:", sub.id);
      break;
    }

    default:
      console.log("⚠️ Unhandled event type:", event.type);
  }
};
