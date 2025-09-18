import bcrypt from "bcrypt";
import jwt from "jsonwebtoken" ;
import type {SignOptions, Secret} from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { ENV } from "../../config/env.js";
import { generateOtp } from "../../utils/otp.js";
import { setOtp, verifyOtp as verifyOtpInRedis } from "../../utils/otpStore.js";
import { sendEmail } from "../../utils/otp.js"; // your Nodemailer service

// Signup: create user and send OTP
export const signup = async (email: string, password: string) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { status: 400, message: "Email already registered" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  // Generate OTP and store in Redis for 5 minutes
  const otp = generateOtp(6);
  await setOtp(email, otp, 5 * 60 * 1000);

  // Send OTP via email (HTML or console in dev)
  await sendEmail(email, "Verify your email address", otp);

  return { id: user.id, email: user.email };
}

// Verify OTP: check Redis and mark user as verified
export const verifyOtp= async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 400, message: "Invalid email" };

  const isValid = await verifyOtpInRedis(email, otp);
  if (!isValid) throw { status: 400, message: "Invalid or expired OTP" };

  // Mark user as verified (optional: add isEmailVerified field in Prisma)
  await prisma.user.update({
    where: { email },
    data: { /* add fields like isEmailVerified if needed */ },
  });

  return true;
}

// Login: validate credentials and return JWT
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 400, message: "Invalid credentials" };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 400, message: "Invalid credentials" };

  const secret: Secret = ENV.JWT_SECRET as Secret; // ✅ ensure correct type

  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN || "1h", // default 1h if not set
  };

  const token = jwt.sign({ sub: user.id }, secret, options);

  return { token };
}

export const forgotPassword= async (email: string) =>  {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 400, message: "User not found" };

  const otp = generateOtp(6);
  await setOtp(email, otp, 5 * 60 * 1000); // expires in 5 mins

  await sendEmail(email, "Password Reset Request", otp);
  return true;
}

// Step 2: Reset password using OTP
export async function resetPassword(email: string, otp: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 400, message: "Invalid email" };

  const isValid = await verifyOtpInRedis(email, otp);
  if (!isValid) throw { status: 400, message: "Invalid or expired OTP" };

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  return true;
}