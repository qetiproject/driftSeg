import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  readonly #loadingSignal = signal<boolean>(false);
  #activeRequests = 0;

  readonly loading = this.#loadingSignal.asReadonly();

  loadingOn(): void {
    this.#activeRequests++;
    if (this.#activeRequests === 1) {
      this.#loadingSignal.set(true);
    }
  }

  loadingOff(): void {
    this.#activeRequests = Math.max(0, this.#activeRequests - 1);
    if (this.#activeRequests === 0) {
      this.#loadingSignal.set(false);
    }
  }
}
