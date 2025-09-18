// src/routes/user.routes.ts
import { Router } from "express";
import { getMe } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

router.get("/me", authMiddleware, getMe);

export const userRoutes = router;
