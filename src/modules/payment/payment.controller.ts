import type { Request, Response } from 'express';
import { createCheckoutSession } from './payment.services.js';
import type { AuthRequest }  from '../../middlewares/auth.js';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const session = await createCheckoutSession(
      userId,
      planId,
      'http://localhost:5173/success',
      'http://localhost:5173/cancel'
    );

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};