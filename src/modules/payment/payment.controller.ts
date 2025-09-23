import type { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.services.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";
import type { AuthRequest } from "../../middlewares/auth.js";

export const createOneTimeCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new AppError("Missing userId fields", 400);

    const { planName, currency } = req.body;

    if (!planName) throw new AppError("Missing planName fields", 400);

    const session = await paymentService.createOneTimeCheckout(
      userId,
      planName,
      currency,
    );
    return sendSuccess(res, "One-time checkout session created", {
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("UserId required", 400);

    const payments = await paymentService.getPaymentsByUser(userId);
    return sendSuccess(res, "Fetched user payments successfully", payments);
  } catch (err) {
    next(err);
  }
};
