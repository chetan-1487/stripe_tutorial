import express from 'express';
import { Router } from 'express';
import { createSession } from './payment.controller.js';
import { stripeWebhook } from './payment.webhook.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

router.post('/create-session', authMiddleware, createSession);

// Stripe webhook route (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export const paymentRoutes = router;