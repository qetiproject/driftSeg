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

  deleteSegment(segmentId: string): void {
    this.#segmentApi
      .deleteSegment(segmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((removedSegment) => {
        if (!removedSegment) return;
        this.#segments.update((segments) => segments.filter((segment) => segment._id !== segmentId));
      });
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
