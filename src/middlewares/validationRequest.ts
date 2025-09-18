import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateRequest = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    req.body = result.data;
    next();
  };
};
