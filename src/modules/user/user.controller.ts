import type { AuthRequest } from "../../middlewares/auth.js";
import type { Response } from "express";
import { getUserById } from "./user.service.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await getUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
};
