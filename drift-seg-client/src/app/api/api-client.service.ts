import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, Observable, retryWhen, throwError, timeout, TimeoutError, timer } from 'rxjs';
import { environment } from '../../environment/environment';

const DEFAULT_TIMEOUT_MS = 15_000;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 500;

function isRetriableError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof HttpErrorResponse) {
    return error.status === 0 || error.status >= 500;
  }
  return false;
}

export interface ApiRequestOptions {
  params?: HttpParams | Record<string, string | number | boolean>;
  headers?: HttpHeaders | Record<string, string>;
  context?: HttpContext;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  timeoutMs?: number;
}

/** Options we pass to HttpClient (observe: 'body'). Cast at call site to satisfy overload union. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HttpClientOptionsBody = any;

@Injectable({ providedIn: 'root' })
export class ApiClient {
  readonly #http = inject(HttpClient);

  get baseUrls(): Readonly<{
    customer: string;
  }> {
    return {
      customer: environment.customer,
    };
  }

  get<T>(baseUrl: string, path: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(baseUrl, path);
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return this.#http.get<T>(url, this.buildHttpOptions(options) as HttpClientOptionsBody).pipe(
      timeout(timeoutMs),
      retryWhen((errors) =>
        errors.pipe(
          concatMap((err, index) =>
            index < RETRY_COUNT && isRetriableError(err)
              ? timer(RETRY_DELAY_MS * Math.pow(2, index))
              : throwError(() => err),
          ),
        ),
      ),
    ) as Observable<T>;
  }

  post<T>(
    baseUrl: string,
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(baseUrl, path);
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return this.#http
      .post<T>(url, body, this.buildHttpOptions(options) as HttpClientOptionsBody)
      .pipe(timeout(timeoutMs)) as Observable<T>;
  }

  put<T>(baseUrl: string, path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(baseUrl, path);
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return this.#http
      .put<T>(url, body, this.buildHttpOptions(options) as HttpClientOptionsBody)
      .pipe(timeout(timeoutMs)) as Observable<T>;
  }

  patch<T>(
    baseUrl: string,
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(baseUrl, path);
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return this.#http
      .patch<T>(url, body, this.buildHttpOptions(options) as HttpClientOptionsBody)
      .pipe(timeout(timeoutMs)) as Observable<T>;
  }

  delete<T>(baseUrl: string, path: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(baseUrl, path);
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return this.#http
      .delete<T>(url, this.buildHttpOptions(options) as HttpClientOptionsBody)
      .pipe(timeout(timeoutMs)) as Observable<T>;
  }

  private buildHttpOptions(options?: ApiRequestOptions): HttpClientOptionsBody {
    const params = this.toHttpParams(options?.params);
    const opts = {
      observe: 'body' as const,
      params,
      headers: options?.headers,
      context: options?.context,
      ...(options?.responseType && { responseType: options.responseType }),
    };
    return opts as HttpClientOptionsBody;
  }

  private buildUrl(base: string, path: string): string {
    const baseTrimmed = base.replace(/\/$/, '');
    if (!path || path === '/') return baseTrimmed;
    const pathTrimmed = path.startsWith('/') ? path : `/${path}`;
    return `${baseTrimmed}${pathTrimmed}`;
  }

  private toHttpParams(
    params?: HttpParams | Record<string, string | number | boolean>,
  ): HttpParams | undefined {
    if (!params) return undefined;
    if (params instanceof HttpParams) return params;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
