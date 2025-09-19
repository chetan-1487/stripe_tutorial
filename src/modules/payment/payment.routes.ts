import { Router } from "express";
import { createOneTimeCheckout, getUserPayments } from "./payment.controller.js";

const router = Router();

router.post("/checkout", createOneTimeCheckout);
router.get("/:userId", getUserPayments);

export const paymentRoutes = router;
