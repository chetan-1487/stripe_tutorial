import type{ Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Global Error Handler Middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // fallback
  return sendError(res, "Internal Server Error", 500);
};
