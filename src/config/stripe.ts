import Stripe from "stripe";
import { ENV } from "./env.js";

if (!ENV.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16" as any,
});
