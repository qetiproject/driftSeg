import { Component } from '@angular/core';
import { SegmentList } from '../../components/segment-list/segment-list';
import { SegmentPageHeader } from '../../components/segment-page-header/segment-page-header';

@Component({
  selector: 'app-segments',
  standalone: true,
  imports: [SegmentPageHeader, SegmentList],
  templateUrl: './segments.html',
})
export class Segments {}
