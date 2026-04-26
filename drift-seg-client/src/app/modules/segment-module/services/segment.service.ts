import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { CreateSegmentRequest, SegmentResponse } from '../types';
import { SegmentApi } from './segment.api';

@Injectable({ providedIn: 'root' })
export class SegmentService {
  readonly #segmentApi = inject(SegmentApi);
  readonly #segments = signal<SegmentResponse[]>([]);

  readonly segments = this.#segments.asReadonly();

  createsegment(payload: CreateSegmentRequest): Observable<SegmentResponse> {
    return this.#segmentApi.createSegment(payload).pipe(
      tap((createdsegment) => {
        this.#segments.update((segments) => [createdsegment, ...segments]);
      }),
    );
  }

  getSegments(): void {
    this.#segmentApi
      .getAllSegments()
      .pipe(catchError(() => of([])))
      .subscribe((segments) => this.#segments.set(segments));
  }
}
