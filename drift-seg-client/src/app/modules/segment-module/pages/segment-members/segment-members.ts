import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SegmentDeltaLiveEvent, SegmentMembersResponse } from '../../types';
import { SegmentLiveUpdatesService } from '../../services/segment-live-updates.service';
import { SegmentService } from '../../services/segment.service';

@Component({
  selector: 'app-segment-members',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './segment-members.html',
})
export class SegmentMembers {
  readonly #route = inject(ActivatedRoute);
  readonly #destroyRef = inject(DestroyRef);
  readonly #segmentService = inject(SegmentService);
  readonly #liveUpdates = inject(SegmentLiveUpdatesService);

  readonly membersResponse = signal<SegmentMembersResponse | null>(null);
  readonly #segmentId = this.#route.snapshot.paramMap.get('id');

  constructor() {
    const segmentId = this.#segmentId;
    if (!segmentId) return;

    this.#segmentService.getSegmentMembers(segmentId).subscribe((response) => this.membersResponse.set(response));

    this.#liveUpdates
      .onDeltaChanged()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((event: SegmentDeltaLiveEvent) => {
        if (event.segmentId !== segmentId) return;
        this.#segmentService.getSegmentMembers(segmentId).subscribe((response) => this.membersResponse.set(response));
      });
  }
}
