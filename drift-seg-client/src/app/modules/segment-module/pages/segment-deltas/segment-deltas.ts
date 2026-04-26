import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  readonly #route = inject(ActivatedRoute);
  readonly #destroyRef = inject(DestroyRef);
  readonly #segmentService = inject(SegmentService);
  readonly #liveUpdates = inject(SegmentLiveUpdatesService);

  readonly deltas = signal<SegmentDeltaResponse[]>([]);
  readonly #segmentId = this.#route.snapshot.paramMap.get('id');

  constructor() {
    const segmentId = this.#segmentId;
    if (!segmentId) return;

    this.#segmentService.getSegmentDeltas(segmentId).subscribe((response) => this.deltas.set(response));

    this.#liveUpdates
      .onDeltaChanged()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((event: SegmentDeltaLiveEvent) => {
        if (event.segmentId !== segmentId) return;
        this.#segmentService.getSegmentDeltas(segmentId).subscribe((response) => this.deltas.set(response));
      });
  }
}
