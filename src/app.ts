import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { paymentRoutes } from "./modules/payment/payment.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { planRoute } from "./modules/plan/plan.routes.js";
import { subscriptionRoute } from "./modules/subscription/subscription.routes.js";
import { checkoutRoutes } from "./modules/checkout/checkout.routes.js";
import { webhookRoute } from "./modules/webhook/webhook.routes.js";

export const app = express();

// ====== Middlewares ======
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

// Skip express.json() for webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// ====== Routes ======
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/plan", planRoute);
app.use("/subscription", subscriptionRoute);
app.use("/checkout", checkoutRoutes);
app.use("/api", webhookRoute);

// ====== Error Handler ======
app.use(errorHandler);
