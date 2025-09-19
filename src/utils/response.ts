import type { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}), // ✅ only include if provided
  };
  return res.status(statusCode).json(response);
};


export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    data: errors,
  };
  return res.status(statusCode).json(response);
};
