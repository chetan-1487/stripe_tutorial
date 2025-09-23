import type { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.services.js";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/errorHandler.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await AuthService.signup(email, password);
    return sendSuccess(res, "User registered successfully", { user }, 201);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    await AuthService.verifyOtp(email, otp);
    return sendSuccess(res, "OTP verified successfully");
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const token = await AuthService.login(email, password);
    return sendSuccess(res, "Login successful", { token });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    await AuthService.forgotPassword(email);
    return sendSuccess(res, "OTP sent to your email (or console in dev)");
  } catch (err) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new AppError("Email, OTP and new password are required", 400);
    }
    await AuthService.resetPassword(email, otp, newPassword);
    return sendSuccess(res, "Password reset successfully");
  } catch (err) {
    next(err);
  }
};
