import type { Request, Response, NextFunction } from "express";
import * as planService from "./plan.service.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";

export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await planService.getAllPlans();
    return sendSuccess(res, "Fetched all plans", plans);
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, currency, interval, credits, stripePriceId } = req.body;
    if (!name || !price || !currency || !credits || !stripePriceId) {
      throw new AppError("Missing required fields", 400);
    }
    const plan = await planService.createPlan({ name, price, currency, interval, credits, stripePriceId });
    return sendSuccess(res, "Plan created successfully", plan, 201);
  } catch (err) {
    next(err);
  }
};
