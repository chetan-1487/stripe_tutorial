import redis from "../config/redis.js";

const OTP_PREFIX = "otp:";

// ttlMs default: 5 minutes
export async function setOtp(email: string, otp: string, ttlMs = 5 * 60 * 1000) {
  await redis.set(`${OTP_PREFIX}${email}`, otp, "PX", ttlMs);
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const key = `${OTP_PREFIX}${email}`;
  const storedOtp = await redis.get(key);

  if (!storedOtp) return false;
  if (storedOtp === otp) {
    await redis.del(key); // OTP can only be used once
    return true;
  }

  return false;
}
