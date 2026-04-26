import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SegmentMembersResponse } from '../../types';
import { SegmentService } from '../../services/segment.service';

@Component({
  selector: 'app-segment-members',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './segment-members.html',
})
export class SegmentMembers {
  readonly #route = inject(ActivatedRoute);
  readonly #segmentService = inject(SegmentService);

  readonly membersResponse = signal<SegmentMembersResponse | null>(null);

  constructor() {
    const segmentId = this.#route.snapshot.paramMap.get('id');
    if (!segmentId) return;

    this.#segmentService
      .getSegmentMembers(segmentId)
      .subscribe((response) => this.membersResponse.set(response));
  }
}
