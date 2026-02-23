import { ApiResult } from '@/types/types';
import z, { ZodObject } from 'zod';
import { error, ok } from './error';

export async function apiCall<TData>(
  url: string,
  payload?: string | object,
  method: 'POST' | 'GET' = 'GET',
): Promise<ApiResult<TData>> {
  try {
    const fetchOptions =
      method === 'POST'
        ? {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body:
              typeof payload === 'string' ? payload : JSON.stringify(payload),
          }
        : { method: 'GET' };

    const response = await fetch(url, fetchOptions);
    const status = response.status;

    if (!response.ok) {
      let message = 'An error occured when fetching data.';
      try {
        const errorBody = await response.json();
        if (typeof errorBody?.message === 'string') {
          message = errorBody.message;
        }
      } catch (error) {}

      return {
        type: 'error',
        error: message,
        status,
      };
    }

    const data = (await response.json()) as TData;

    return {
      type: 'success',
      data,
      status,
    };
  } catch (error) {
    return {
      type: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Network error when fetching data.',
      status: 0,
    };
  }
}
