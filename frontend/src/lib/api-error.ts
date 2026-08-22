import type { AxiosError } from 'axios';

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static from(error: unknown): ApiError {
    const axiosError = error as AxiosError<ApiErrorBody>;
    if (axiosError?.isAxiosError) {
      const status = axiosError.response?.status ?? 0;
      const body = axiosError.response?.data;
      if (body) {
        const messages = Array.isArray(body.message) ? body.message : [body.message];
        return new ApiError(status, messages[0] ?? 'Error', messages);
      }
      return new ApiError(status, axiosError.message);
    }
    return new ApiError(0, error instanceof Error ? error.message : 'Error desconocido');
  }
}
