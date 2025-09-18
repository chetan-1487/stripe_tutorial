import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { ENV } from "../config/env.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    if (!payload.sub || typeof payload.sub !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }


    // Use "sub" because that’s what we set in login
    req.userId = typeof payload.sub === "string" ? payload.sub : undefined;

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
