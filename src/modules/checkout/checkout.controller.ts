import type { Request, Response } from "express";
import { createOneTimeCheckout, createSubscriptionCheckout } from "./checkout.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function checkoutOneTime(req: Request, res: Response) {
  try {
    const { userId, planId } = req.body;
    const url = await createOneTimeCheckout(userId, planId);
    return sendSuccess(res,"", { url });
  } catch (err: any) {
    return sendError(res, err.message);
  }
}

export async function checkoutSubscription(req: Request, res: Response) {
  try {
    const { userId, planId } = req.body;
    const url = await createSubscriptionCheckout(userId, planId);
    return sendSuccess(res, "",{ url });
  } catch (err: any) {
    return sendError(res, err.message);
  }
}
