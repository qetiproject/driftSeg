import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SegmentDeltaResponse } from '../../types';
import { SegmentService } from '../../services/segment.service';

@Component({
  selector: 'app-segment-deltas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './segment-deltas.html',
})
export class SegmentDeltas {
  readonly #route = inject(ActivatedRoute);
  readonly #segmentService = inject(SegmentService);

  readonly deltas = signal<SegmentDeltaResponse[]>([]);

  constructor() {
    const segmentId = this.#route.snapshot.paramMap.get('id');
    if (!segmentId) return;

    this.#segmentService.getSegmentDeltas(segmentId).subscribe((response) => this.deltas.set(response));
  }
}
