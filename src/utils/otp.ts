import { ENV } from "../config/env.js";
import { otpEmailTemplate } from "./emailTemplates.js";
import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, otp: string) => {
  if (ENV.IS_DEVELOPMENT) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: ENV.FROM_EMAIL,
    to,
    subject,
    text: `Your verification code is ${otp}`,
    html: otpEmailTemplate(otp, to),
  });
};

export const generateOtp = (length = 6) => {
  const max = 10 ** length;
  const num = Math.floor(Math.random() * (max - 1)) + 1;
  return num.toString().padStart(length, "0");
};
