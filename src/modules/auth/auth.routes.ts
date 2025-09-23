import { Router } from "express";
import {
  signup,
  login,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validationRequest.js";
import {
  signupSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", validateRequest(signupSchema), signup);
router.post("/login", validateRequest(loginSchema), login);
router.post(
  "/forgot-password",
  validateRequest(forgotSchema),
  forgotPasswordHandler,
);
router.post(
  "/reset-password",
  validateRequest(resetSchema),
  resetPasswordHandler,
);

export const authRoutes = router;
