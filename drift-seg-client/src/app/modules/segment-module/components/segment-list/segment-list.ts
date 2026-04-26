import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SegmentItem } from '../segment-item/segment-item';

@Component({
  selector: 'app-segment-list',
  standalone: true,
  imports: [SegmentItem],
  templateUrl: './segment-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentList {
  readonly #segmentService = inject(SegmentService);

  readonly customers = this.#segmentService.segments;

  constructor() {
    this.#segmentService.getSegments();
  }
}
