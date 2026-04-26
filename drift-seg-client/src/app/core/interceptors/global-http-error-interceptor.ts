import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageSeverity } from '../../types/message';
import { toErrorMessage } from '../http/http-utils';
import { MessagesService } from '../services/messages.service';

export const GlobalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessagesService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0 || error.status >= 400) {
        messages.showMessage({
          text: toErrorMessage(error),
          severity: MessageSeverity.Error,
          duration: 5000,
        });
      }
      return throwError(() => error);
    }),
  );
};
