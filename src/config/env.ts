import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ||
    "1h") as SignOptions["expiresIn"],
  EMAIL_HOST: process.env.EMAIL_HOST!,
  EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  FROM_EMAIL: process.env.FROM_EMAIL || "no-reply@example.com",
  IS_DEVELOPMENT: process.env.IS_DEVELOPMENT || "false",
  REDIS_URL: process.env.REDIS_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_API_VERSION: process.env.STRIPE_API_VERSION,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  CHECKOUT_SUCCESS_URL: process.env.CHECKOUT_SUCCESS_URL,
  CHECKOUT_CANCEL_URL: process.env.CHECKOUT_CANCEL_URL,
};
