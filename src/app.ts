import express from "express";
import cors from "cors";
import {authRoutes} from "./modules/auth/auth.routes.js";
import {paymentRoutes} from "./modules/payment/payment.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRoutes } from "./modules/user/user.routes.js";

export const app = express();

// ====== Middlewares ======
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // allow specific origin or all
    credentials: true, // allow cookies if needed
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== Routes ======
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);

// ====== Error Handler ======
app.use(errorHandler);
