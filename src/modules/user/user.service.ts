// src/services/user.service.ts
import { prisma } from "../../config/prisma.js";

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      // add isEmailVerified if you added that column
    },
  });
}
