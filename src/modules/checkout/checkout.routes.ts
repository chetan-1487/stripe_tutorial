import { Router } from "express";
import { checkoutOneTime, checkoutSubscription } from "./checkout.controller.js";

const router = Router();

router.post("/one-time", checkoutOneTime);
router.post("/subscription", checkoutSubscription);

export const checkoutRoutes = router;
