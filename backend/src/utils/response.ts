import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export const sendSuccess = <T>(
  res: Response, 
  data: T, 
  message: string = 'Success', 
  statusCode: number = 200,
  meta?: ApiResponse['meta']
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response, 
  error: string, 
  statusCode: number = 500,
  code?: string
) => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};
