import { Component, inject, input } from '@angular/core';
import { SegmentService } from '../../services/segment.service';
import { SegmentResponse } from '../../types';

@Component({
  selector: 'app-segment-item',
  standalone: true,
  imports: [],
  templateUrl: './segment-item.html',
})
export class SegmentItem {
  segment = input.required<SegmentResponse>();
  readonly #segmentService = inject(SegmentService);

  async onOpenModal(): Promise<void> {
    // const { _id } = this.segment();
    // this.#segmentService.deleteSegment(_id);
  }
}
