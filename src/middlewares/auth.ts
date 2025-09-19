import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { AppError } from "../utils/errorHandler.js";

export interface AuthRequest extends Request {
    user?: { id: string; email?: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
    
  if (!authHeader) throw new AppError("Authorization header missing", 401);

  const token = authHeader.split(" ")[1];
  if (!token) throw new AppError("Token missing", 401);

  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as any;

    // Use "sub" because that’s what we set in login
    req.user = { id: payload.userId, email: payload.email };


    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
