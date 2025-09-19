import {prisma} from "../../config/prisma.js";

interface PlanInput {
  name: string;
  price: number;
  currency: string;
  interval?: string | null;
  credits: number;
  stripePriceId: string;
}

export const getAllPlans = async () => {
  return prisma.plan.findMany();
};

export const createPlan = async (data: PlanInput) => {
  return prisma.plan.create({ data });
};
