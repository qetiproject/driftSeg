import { Component, inject, input } from '@angular/core';

@Component({
  selector: 'app-segment-item',
  standalone: true,
  imports: [],
  templateUrl: './segment-item.html',
})
export class SegmentItem {
  segment = input.required<SegmentResponse>();
  readonly #segmentService = inject(segmentService);

  async onOpenModal(): Promise<void> {
    const { _id } = this.segment();

    this.#segmentService.deleteSegment(_id);
  }
}
