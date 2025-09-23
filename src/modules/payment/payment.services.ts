import { prisma } from "../../config/prisma.js";
import { stripe } from "../../config/stripe.js";
import { AppError } from "../../utils/errorHandler.js";

export const createOneTimeCheckout = async (
  userId: string,
  planName: string,
  currency: string,
) => {
  const plan = await prisma.plan.findFirst({ where: { name: planName } });
  if (!plan) throw new AppError("Plan not found", 404);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency || plan.currency,
          product_data: { name: plan.name },
          unit_amount: plan.price,
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });

  return session;
};

export const getPaymentsByUser = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
