import type { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.services.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";

export const createOneTimeCheckout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, planId, currency } = req.body;
    if (!userId || !planId) throw new AppError("Missing required fields", 400);

    const session = await paymentService.createOneTimeCheckout(userId, planId, currency);
    return sendSuccess(res, "One-time checkout session created", { url: session.url });
  } catch (err) {
    next(err);
  }
};

export const getUserPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError("UserId required", 400);

    const payments = await paymentService.getPaymentsByUser(userId);
    return sendSuccess(res, "Fetched user payments successfully", payments);
  } catch (err) {
    next(err);
  }
};
