import { prisma } from '../../config/prisma.js';
import { stripe } from '../../config/stripe.js';

export async function createCheckoutSession(
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

  const mode = plan.interval ? 'subscription' : 'payment';

  const session = await stripe.checkout.sessions.create({
    mode: mode as 'payment' | 'subscription',
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
    metadata: { userId, planId, type: mode },
  });

  await prisma.payment.create({
    data: {
      userId,
      amount: plan.price,
      currency: plan.currency,
      stripeId: session.id,
      status: 'CREATED',
      type: mode === 'payment' ? 'ONE_TIME' : 'SUBSCRIPTION',
    },
  });

  return session;
}
