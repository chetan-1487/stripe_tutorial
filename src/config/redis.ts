import Redis from "ioredis";
import { ENV } from "../config/env.js"

const redis = new Redis(ENV.REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
