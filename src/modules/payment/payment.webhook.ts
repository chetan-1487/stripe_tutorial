import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { stripe } from '../../config/stripe.js';
import { ENV } from '../../config/env.js';

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body as Buffer;
  const webhookSecret = ENV.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;

      // update payment
      const payment = await prisma.payment.update({
        where: { stripeId: session.id },
        data: { status: 'SUCCEEDED' },
      });

      if (payment.type === 'ONE_TIME') {
        const plan = await prisma.plan.findUnique({ where: { id: session.metadata.planId } });
        if (plan) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { credits: { increment: plan.credits } },
          });
        }
      } else if (payment.type === 'SUBSCRIPTION') {
        const planId = session.metadata.planId;
        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            planId,
            stripeId: session.subscription,
            status: 'active',
            startDate: new Date(),
          },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any;
      const subscription = await prisma.subscription.findUnique({ where: { stripeId: invoice.subscription } });
      if (subscription) {
        const plan = await prisma.plan.findUnique({ where: { id: subscription.planId } });
        if (plan) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { credits: { increment: plan.credits } },
          });
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      await prisma.subscription.update({
        where: { stripeId: invoice.subscription },
        data: { status: 'past_due' },
      });
      break;
    }

    default:
      break;
  }

  res.json({ received: true });
};
