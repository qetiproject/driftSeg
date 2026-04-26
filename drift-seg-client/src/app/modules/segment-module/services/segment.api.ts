import { inject, Injectable } from '@angular/core';
import { ApiClient, Endpoints } from '@api';
import { Observable } from 'rxjs';
import {
  CreateSegmentRequest,
  SegmentDeltaResponse,
  SegmentMembersResponse,
  SegmentResponse,
} from '../types';

@Injectable({
  providedIn: 'root',
})
export class SegmentApi {
  readonly #api = inject(ApiClient);
  readonly #baseUrl = this.#api.baseUrls.segments;

  createSegment(payload: CreateSegmentRequest): Observable<SegmentResponse> {
    return this.#api.post<SegmentResponse>(
      this.#baseUrl,
      Endpoints.segments.createSegment,
      payload,
    );
  }
  getAllSegments(): Observable<SegmentResponse[]> {
    return this.#api.get<SegmentResponse[]>(this.#baseUrl, Endpoints.segments.getSegments);
  }

  getSegmentMembers(segmentId: string): Observable<SegmentMembersResponse> {
    return this.#api.get<SegmentMembersResponse>(
      this.#baseUrl,
      Endpoints.segments.getSegmentMembers(segmentId),
    );
  }

  getSegmentDeltas(segmentId: string): Observable<SegmentDeltaResponse[]> {
    return this.#api.get<SegmentDeltaResponse[]>(
      this.#baseUrl,
      Endpoints.segments.getSegmentDeltas(segmentId),
    );
  }

  refreshSegment(segmentId: string): Observable<{ refreshed: true }> {
    return this.#api.post<{ refreshed: true }>(
      this.#baseUrl,
      Endpoints.segments.refreshSegment(segmentId),
      {},
    );
  }
}
