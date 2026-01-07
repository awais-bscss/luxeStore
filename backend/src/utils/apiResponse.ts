import { Response } from 'express';

interface ApiResponseData {
  success: boolean;
  message?: string;
  data?: any;
  token?: string;
}

/**
 * Standardized API response format
 */
export class ApiResponse {
  static success(res: Response, statusCode: number, data: any, message?: string) {
    const response: ApiResponseData = {
      success: true,
      ...(message && { message }),
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, statusCode: number, message: string) {
    const response: ApiResponseData = {
      success: false,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static authSuccess(res: Response, statusCode: number, token: string, user: any, message?: string) {
    const response: ApiResponseData = {
      success: true,
      ...(message && { message }),
      token,
      data: { user },
    };
    return res.status(statusCode).json(response);
  }
}
