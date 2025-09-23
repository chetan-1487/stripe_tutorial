import { Router } from "express";
import {
  checkoutOneTime,
  checkoutSubscription,
} from "./checkout.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.post("/one-time", authMiddleware, checkoutOneTime);
router.post("/subscription", authMiddleware, checkoutSubscription);

export const checkoutRoutes = router;
