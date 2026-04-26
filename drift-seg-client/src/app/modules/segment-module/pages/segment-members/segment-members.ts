import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, filter, merge, switchMap, timer } from 'rxjs';
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
  static readonly POLL_INTERVAL_MS = 4000;
  readonly #route = inject(ActivatedRoute);
  readonly #destroyRef = inject(DestroyRef);
  readonly #segmentService = inject(SegmentService);
  readonly #liveUpdates = inject(SegmentLiveUpdatesService);

  readonly membersResponse = signal<SegmentMembersResponse | null>(null);
  readonly #segmentId = this.#route.snapshot.paramMap.get('id');

  constructor() {
    const segmentId = this.#segmentId;
    if (!segmentId) return;

    merge(
      timer(0, SegmentMembers.POLL_INTERVAL_MS),
      this.#liveUpdates.onDeltaChanged().pipe(
        filter((event: SegmentDeltaLiveEvent) => event.segmentId === segmentId),
        debounceTime(250),
      ),
    )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .pipe(switchMap(() => this.#segmentService.getSegmentMembers(segmentId)))
      .subscribe((response) => this.membersResponse.set(response));
  }
}
