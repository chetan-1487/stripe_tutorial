import type { Response } from "express";

export const sendSuccess = (res: Response, data: any, status = 200) => res.status(status).json({ success: true, data });
export const sendError = (res: Response, message: string, status = 400) => res.status(status).json({ success: false, message });
