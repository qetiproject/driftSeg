import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SegmentService } from '../../services/segment.service';
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

  readonly segments = this.#segmentService.segments;

  constructor() {
    this.#segmentService.getSegments();
  }
}
