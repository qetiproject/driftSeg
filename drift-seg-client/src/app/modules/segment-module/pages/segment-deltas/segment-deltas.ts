import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, filter, merge, switchMap, timer } from 'rxjs';
import { SegmentDeltaLiveEvent, SegmentDeltaResponse } from '../../types';
import { SegmentLiveUpdatesService } from '../../services/segment-live-updates.service';
import { SegmentService } from '../../services/segment.service';

@Component({
  selector: 'app-segment-deltas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './segment-deltas.html',
})
export class SegmentDeltas {
  static readonly POLL_INTERVAL_MS = 4000;
  readonly #route = inject(ActivatedRoute);
  readonly #destroyRef = inject(DestroyRef);
  readonly #segmentService = inject(SegmentService);
  readonly #liveUpdates = inject(SegmentLiveUpdatesService);

  readonly deltas = signal<SegmentDeltaResponse[]>([]);
  readonly #segmentId = this.#route.snapshot.paramMap.get('id');

  constructor() {
    const segmentId = this.#segmentId;
    if (!segmentId) return;

    merge(
      timer(0, SegmentDeltas.POLL_INTERVAL_MS),
      this.#liveUpdates.onDeltaChanged().pipe(
        filter((event: SegmentDeltaLiveEvent) => event.segmentId === segmentId),
        debounceTime(250),
      ),
    )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .pipe(switchMap(() => this.#segmentService.getSegmentDeltas(segmentId)))
      .subscribe((response) => this.deltas.set(response));
  }
}
