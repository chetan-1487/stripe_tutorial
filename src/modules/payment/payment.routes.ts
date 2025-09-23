import { Router } from "express";
import {
  createOneTimeCheckout,
  getUserPayments,
} from "./payment.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.post("/checkout", authMiddleware, createOneTimeCheckout);
router.get("/:userId", authMiddleware, getUserPayments);

export const paymentRoutes = router;
