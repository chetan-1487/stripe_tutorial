import type { AuthRequest } from "../../middlewares/auth.js";
import type { Response, NextFunction } from "express";
import { getUserById } from "./user.service.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return sendSuccess(res, "User fetched successfully", { user });
  } catch (err) {
    next(err);
  }
};
