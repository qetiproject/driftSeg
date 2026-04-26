import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { ErrorMessages } from '../../types';

export function toErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) return error.trim();

  if (error instanceof TimeoutError) {
    return ErrorMessages.Timeout;
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return ErrorMessages.Unknown;

    if (error.status === 400) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) return body;
      if (body && typeof body === 'object' && 'message' in body) {
        const msg = (body as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim()) return msg;
      }
    }

    switch (error.status) {
      case 404:
        return ErrorMessages.E404;
      case 500:
        return ErrorMessages.E500;
      default:
        return ErrorMessages.Unknown;
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  return ErrorMessages.Unknown;
}
