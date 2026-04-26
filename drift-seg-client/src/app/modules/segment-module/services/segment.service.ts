import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import {
  CreateSegmentRequest,
  SegmentDeltaResponse,
  SegmentMembersResponse,
  SegmentResponse,
} from '../types';
import { SegmentApi } from './segment.api';

@Injectable({ providedIn: 'root' })
export class SegmentService {
  readonly #segmentApi = inject(SegmentApi);
  readonly #segments = signal<SegmentResponse[]>([]);

  readonly segments = this.#segments.asReadonly();

  createSegment(payload: CreateSegmentRequest): Observable<SegmentResponse> {
    return this.#segmentApi.createSegment(payload).pipe(
      tap((createdSegment) => {
        this.#segments.update((segments) => [createdSegment, ...segments]);
      }),
    );
  }

  getSegments(): void {
    this.#segmentApi
      .getAllSegments()
      .pipe(catchError(() => of([])))
      .subscribe((segments) => this.#segments.set(segments));
  }

  getSegmentMembers(segmentId: string): Observable<SegmentMembersResponse> {
    return this.#segmentApi.getSegmentMembers(segmentId);
  }

  getSegmentDeltas(segmentId: string): Observable<SegmentDeltaResponse[]> {
    return this.#segmentApi.getSegmentDeltas(segmentId);
  }

  refreshSegment(segmentId: string): Observable<{ refreshed: true }> {
    return this.#segmentApi.refreshSegment(segmentId);
  }
}
