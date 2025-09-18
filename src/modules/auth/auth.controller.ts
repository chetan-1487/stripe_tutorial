import type { Request, Response } from "express";
import * as AuthService from "./auth.services.js";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await AuthService.signup(email, password);
  res.status(201).json({ user });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyOtp(email, otp);
  res.json({ success: true });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await AuthService.login(email, password);
  res.json(token);
};

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    res.json({ message: "OTP sent to your email (or console in dev)" });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    res.json({ message: "Password reset successfully" });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}