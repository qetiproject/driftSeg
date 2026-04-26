import { inject, Injectable } from '@angular/core';
import { ApiClient, Endpoints } from '@api';
import { Observable } from 'rxjs';
import { CreateSegmentRequest, SegmentResponse } from '../types';

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
}
